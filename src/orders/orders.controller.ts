import { Controller, Post, Get, Body, Param, UseGuards, Request } from '@nestjs/common';
import { OrdersService } from './orders.service';
import { CreateOrderDto } from './dto/create-order.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('orders')
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  async create(@Body() createOrderDto: CreateOrderDto, @Request() req) {
    createOrderDto.customerPhone = req.user.phone; 
    createOrderDto.customerName = req.user.name;
    return this.ordersService.createOrder(createOrderDto);
  }

  // --- НОВЫЙ МЕТОД ДЛЯ ОТЛАДКИ ---
  // Позволяет посмотреть, как выглядит "правильный" заказ внутри QR
  // Вызов: GET http://localhost:3000/api/v1/orders/{ID_ЗАКАЗА}
  @Get(':id')
  async getOrder(@Param('id') id: string) {
    return this.ordersService.getPreorder(Number(id));
  }
}