import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { QuickRestoService } from './quick-resto.service';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [HttpModule, ConfigModule],
  providers: [QuickRestoService],
  exports: [QuickRestoService], // Экспортируем, чтобы использовать в Catalog и CRM
})
export class QuickRestoModule {}