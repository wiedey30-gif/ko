import { IsArray, IsNumber, IsString, ValidateNested, IsOptional } from 'class-validator';
import { Type } from 'class-transformer';

class OrderItemDto {
  @IsNumber()
  dishId: number;

  @IsNumber()
  amount: number;

  @IsNumber()
  price: number; // Цена за единицу на момент заказа
}

export class CreateOrderDto {
  @IsString()
  customerPhone: string;

  @IsString()
  @IsOptional()
  customerName?: string;

  @IsNumber()
  salePlaceId: number; // ID точки продаж (ресторана)

  @IsString()
  deliveryAddress: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => OrderItemDto)
  items: OrderItemDto[];
}