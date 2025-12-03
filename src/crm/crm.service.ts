import { Injectable, Logger } from '@nestjs/common';
import { QuickRestoService } from '../quick-resto/quick-resto.service';

@Injectable()
export class CrmService {
  private readonly logger = new Logger(CrmService.name);

  constructor(private readonly qrService: QuickRestoService) {}

  async findCustomerByPhone(phone: string) {
    // 1. Пытаемся найти клиента
    const searchBody = {
      search: phone,
      typeList: ["customer"],
      limit: 1
    };

    const result: any = await this.qrService.postCommand('/bonuses/filterCustomers', searchBody);

    // 2. Если нашли - возвращаем
    if (result && result.customers && result.customers.length > 0) {
        const customer = result.customers[0];
        this.logger.log(`Клиент найден: ${customer.id}`);
        
        return {
            id: customer.id,
            guid: customer.customerGuid,
            name: `${customer.firstName || ''} ${customer.lastName || ''}`.trim(),
            phone: phone
        };
    }

    // 3. Если НЕ нашли - СОЗДАЕМ нового (Авторегистрация)
    this.logger.log(`Клиент не найден. Создаем нового для номера ${phone}...`);
    return this.createCustomer(phone);
  }

  // Метод создания нового клиента
  async createCustomer(phone: string) {
    const createBody = {
        firstName: "Гость",
        lastName: "из Приложения",
        contactMethods: [
            {
                type: "phoneNumber",
                value: phone
            }
        ]
    };

    // Отправляем запрос на создание в CRM
    const newCustomer = await this.qrService.postCommand<any>(
        '/api/create?moduleName=crm.customer&className=ru.edgex.quickresto.modules.crm.customer.CrmCustomer',
        createBody
    );

    this.logger.log(`Новый клиент успешно создан! ID: ${newCustomer.id}`);

    return {
        id: newCustomer.id,
        guid: newCustomer.customerGuid,
        name: "Гость из Приложения",
        phone: phone
    };
  }
}