import { Module } from '@nestjs/common';
import { OrdersService } from './orders.service';
import { OrdersController } from './orders.controller';
import { QuickRestoModule } from '../quick-resto/quick-resto.module';

@Module({
  imports: [QuickRestoModule], // Импортируем, чтобы пользоваться qrService
  controllers: [OrdersController],
  providers: [OrdersService],
})
export class OrdersModule {}