import { Controller, Post, Body } from '@nestjs/common';
import { CrmService } from './crm.service';

@Controller('crm')
export class CrmController {
  constructor(private readonly crmService: CrmService) {}

  @Post('login')
  async login(@Body('phone') phone: string) {
    return this.crmService.findCustomerByPhone(phone);
  }
}