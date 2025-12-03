import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { QuickRestoModule } from './quick-resto/quick-resto.module';
import { CatalogModule } from './catalog/catalog.module';
import { CrmModule } from './crm/crm.module';
import { OrdersModule } from './orders/orders.module'; // <-- Важно!
import { AuthModule } from './auth/auth.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    QuickRestoModule,
    CatalogModule, // <-- Проверь, что это есть
    CrmModule,     // <-- И это
    OrdersModule,
    AuthModule,  // <-- И это
  ],
})
export class AppModule {}