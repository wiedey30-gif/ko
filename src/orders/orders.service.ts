import { Injectable, Logger, BadRequestException } from '@nestjs/common';
import { QuickRestoService } from '../quick-resto/quick-resto.service';
import { CreateOrderDto } from './dto/create-order.dto';
import { CrmService } from '../crm/crm.service';

@Injectable()
export class OrdersService {
  private readonly logger = new Logger(OrdersService.name);

  constructor(
    private readonly qrService: QuickRestoService,
    private readonly crmService: CrmService,
  ) {}

  // --- ИСПРАВЛЕНИЕ ОШИБКИ TS: Добавляем метод getPreorder ---
  async getPreorder(id: number) {
    return this.qrService.readObject(
        'front.preorders',
        'ru.edgex.quickresto.modules.front.preorders.PreorderInfo',
        id
    );
  }
  // ----------------------------------------------------------

  async createOrder(dto: CreateOrderDto) {
    this.logger.log(`🚀 Начинаем создание ПРЕЧЕКА (Универсальный items) для ${dto.customerPhone}`);

    const customer = await this.crmService.findCustomerByPhone(dto.customerPhone);
    if (!customer || !customer.id) throw new BadRequestException('Клиент не найден');

    // 1. Загружаем объекты окружения
    const tableId = 1; 
    const salePlaceId = Number(dto.salePlaceId);
    const employeeId = 1; 

    const [tableObj, salePlaceObj, employeeObj] = await Promise.all([
        this.qrService.readObject('front.tablemanagement', 'ru.edgex.quickresto.modules.front.tablemanagement.Table', tableId),
        this.qrService.readObject('warehouse.nomenclature.sale_place', 'ru.edgex.quickresto.modules.warehouse.nomenclature.sale_place.SalePlace', salePlaceId),
        this.qrService.readObject('personnel.employee', 'ru.edgex.quickresto.modules.personnel.employee.Employee', employeeId)
    ]);

    // 2. Формируем ссылки контекста
    // Место приготовления (Обязательно!)
    let cookingPlaceRef: any = null;
    if (salePlaceObj?.defaultCookingPlace) {
        cookingPlaceRef = {
            id: salePlaceObj.defaultCookingPlace.id,
            className: salePlaceObj.defaultCookingPlace.className || 'ru.edgex.quickresto.modules.warehouse.nomenclature.cooking_place.CookingPlace'
        };
    }
    // Место реализации
    const salePlaceRef = { 
        id: salePlaceId, 
        className: 'ru.edgex.quickresto.modules.warehouse.nomenclature.sale_place.SalePlace' 
    };

    let totalSum = 0;

    // 3. Собираем позиции с "Ковровой бомбардировкой" полями
    const itemsData = await Promise.all(dto.items.map(async (item) => {
        const dishId = Number(item.dishId);
        
        // Ссылка на блюдо
        const dishRef = { 
            id: dishId,
            className: 'ru.edgex.quickresto.modules.warehouse.nomenclature.dish.Dish'
        };

        // Проверяем существование (для надежности)
        const dishCheck = await this.qrService.readObject('warehouse.nomenclature.dish', dishRef.className, dishId);
        if (!dishCheck) throw new BadRequestException(`Блюдо ${dishId} не найдено`);

        const sum = Number(item.amount) * Number(item.price);
        totalSum += sum;

        return {
            className: 'ru.edgex.quickresto.modules.front.preorders.PreorderItem',
            
            // --- УНИВЕРСАЛЬНАЯ ПРИВЯЗКА ---
            // Мы передаем блюдо во все возможные поля ссылкой. 
            // Сервер использует то, что ему нужно, и проигнорирует остальные.
            nomenclature: dishRef, // Стандарт для документов
            storeItem: dishRef,    // Стандарт для пречеков (чтение)
            dish: dishRef,         // Возможный вариант
            product: dishRef,      // Возможный вариант

            // Плоские поля
            itemId: dishId,
            itemClassName: dishRef.className,
            
            // Контекст (Где готовить и откуда списывать)
            cookingPlace: cookingPlaceRef,
            salePlace: salePlaceRef,
            
            // Данные
            amount: Number(item.amount),
            price: Number(item.price),
            sum: sum,
            
            // Дополнительно: статус (как в успешном JSON)
            status: 'new' 
        };
    }));

    // 4. Пейлоад
    const preorderPayload = {
      className: 'ru.edgex.quickresto.modules.front.preorders.PreorderInfo',
      date: new Date().toISOString(),
      
      customer: { id: customer.id, className: 'ru.edgex.quickresto.modules.crm.customer.CrmCustomer' },
      salePlace: salePlaceRef,
      table: tableObj ? { id: tableObj.id, className: tableObj.className } : { id: tableId, className: 'ru.edgex.quickresto.modules.front.tablemanagement.Table' },

      // Сотрудники
      waiter: employeeObj ? { id: employeeObj.id, className: employeeObj.className } : null,
      cashier: employeeObj ? { id: employeeObj.id, className: employeeObj.className } : null,

      comment: `APP ЗАКАЗ. Адрес: ${dto.deliveryAddress}. Имя: ${dto.customerName || ''}`,
      
      // Поле списка (мы выяснили, что это preorderItemList)
      preorderItemList: itemsData, 
      
      sums: { total: totalSum },
      externalId: `APP-${Date.now()}` 
    };

    this.logger.log('📦 Отправляем СУПЕР-запрос (Все варианты связей)...');

    try {
      const result = await this.qrService.postCommand<any>(
        '/api/create?moduleName=front.preorders&className=ru.edgex.quickresto.modules.front.preorders.PreorderInfo',
        preorderPayload
      );

      this.logger.log(`✅ ПРЕЧЕК СОЗДАН! ID: ${result.id}`);
      return { success: true, orderId: result.id, status: 'created', qrData: result };

    } catch (e) {
      const errorData = e.response?.data || e.message;
      this.logger.error(`❌ ОШИБКА QR API: ${JSON.stringify(errorData, null, 2)}`);
      throw e;
    }
  }
}