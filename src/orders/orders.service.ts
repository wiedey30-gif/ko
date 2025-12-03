import { Injectable, Logger } from '@nestjs/common';
import { QuickRestoService } from '../quick-resto/quick-resto.service';
import { CreateOrderDto } from './dto/create-order.dto';

@Injectable()
export class OrdersService {
  private readonly logger = new Logger(OrdersService.name);

  constructor(private readonly qrService: QuickRestoService) {}

  async createOrder(dto: CreateOrderDto) {
    this.logger.log(`🚀 Начинаем создание заказа для ${dto.customerPhone}`);

    // 1. "Обогащаем" данные: скачиваем информацию о каждом блюде
    const enrichedItems = await Promise.all(dto.items.map(async (item) => {
        const dishId = Number(item.dishId);
        
        // Запрашиваем у QR детали блюда
        const dishDetails = await this.qrService.readObject(
            'warehouse.nomenclature.dish',
            'ru.edgex.quickresto.modules.warehouse.nomenclature.dish.Dish',
            dishId
        );

        if (!dishDetails) {
            throw new Error(`Блюдо ID ${dishId} не найдено`);
        }

        // 2. Формируем строку чека, ВКЛЮЧАЯ Единицу Измерения (measureUnit)
        // Именно этого не хватало серверу для счастья
        return {
            className: 'ru.edgex.quickresto.modules.front.orders.OrderItem',
            nomenclature: { 
                id: dishId,
                className: 'ru.edgex.quickresto.modules.warehouse.nomenclature.dish.Dish'
            },
            // Вставляем объект единицы измерения, полученный от самого QR
            measureUnit: dishDetails.measureUnit, 
            
            amount: Number(item.amount),
            price: Number(item.price),
            sum: Number(item.amount) * Number(item.price)
        };
    }));

    // 3. Собираем итоговый документ
    const qrOrderPayload = {
      className: 'ru.edgex.quickresto.modules.front.orders.OrderInfo',
      date: new Date().toISOString(),
      customer: {
        phoneNumber: dto.customerPhone,
        name: dto.customerName || 'App Guest',
      },
      salePlace: { id: Number(dto.salePlaceId) },
      comment: `Доставка: ${dto.deliveryAddress}`,
      
      // Вставляем полные данные
      orderItemList: enrichedItems,
      
      externalId: `APP-${Date.now()}` 
    };

    // 4. Отправляем
    const result = await this.qrService.postCommand<any>(
      '/api/create?moduleName=front.orders&className=ru.edgex.quickresto.modules.front.orders.OrderInfo',
      qrOrderPayload
    );

    if (result && result.id) {
        this.logger.log(`✅ ПОБЕДА! Заказ создан. ID: ${result.id}`);
        return { success: true, orderId: result.id, status: 'created' };
    } else {
        throw new Error('Order creation failed');
    }
  }
}