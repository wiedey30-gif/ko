import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { CrmService } from '../crm/crm.service';

@Injectable()
export class AuthService {
  constructor(
    private crmService: CrmService,
    private jwtService: JwtService
  ) {}

  // Шаг 1: Приложение просит код
  async sendSmsCode(phone: string) {
    // Тут в будущем будет интеграция с SMS.ru или аналогом
    // Пока просто говорим "ОК"
    return { status: 'sms_sent', debugCode: '0000' };
  }

  // Шаг 2: Приложение шлет код, мы отдаем токен
  async loginWithCode(phone: string, code: string) {
    if (code !== '0000') {
        throw new UnauthorizedException('Неверный код из SMS');
    }

    // Ищем клиента в Quick Resto (используем уже готовый сервис)
    const customer = await this.crmService.findCustomerByPhone(phone);

    // Создаем токен
    const payload = { phone: customer.phone, name: customer.name, sub: customer.id };
    
    return {
      access_token: this.jwtService.sign(payload),
      user: customer
    };
  }
}