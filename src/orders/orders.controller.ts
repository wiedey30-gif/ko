import { Controller, Post, Body, UseGuards, Request } from '@nestjs/common';
import { OrdersService } from './orders.service';
import { CreateOrderDto } from './dto/create-order.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('orders')
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  @Post()
  @UseGuards(JwtAuthGuard) // <--- 1. ВЕШАЕМ ЗАМОК (Требуется токен)
  async create(@Body() createOrderDto: CreateOrderDto, @Request() req) {
    
    // 2. ДОСТАЕМ НОМЕР ИЗ ТОКЕНА
    // Даже если хакер пришлет в JSON чужой номер, мы перезапишем его номером владельца токена
    createOrderDto.customerPhone = req.user.phone; 
    createOrderDto.customerName = req.user.name;

    return this.ordersService.createOrder(createOrderDto);
  }
}