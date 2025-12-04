import { Module } from '@nestjs/common';
import { OrdersService } from './orders.service';
import { OrdersController } from './orders.controller';
import { QuickRestoModule } from '../quick-resto/quick-resto.module';
import { CrmModule } from '../crm/crm.module';

@Module({
  imports: [
    QuickRestoModule, // Для прямых запросов к API
    CrmModule,        // <-- ДОБАВИЛИ: Чтобы искать/создавать клиента перед заказом
  ],
  controllers: [OrdersController],
  providers: [OrdersService],
})
export class OrdersModule {}
