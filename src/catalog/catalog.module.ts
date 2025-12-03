import { Module } from '@nestjs/common';
import { CatalogService } from './catalog.service';
import { CatalogController } from './catalog.controller';
import { QuickRestoModule } from '../quick-resto/quick-resto.module';

@Module({
  imports: [QuickRestoModule],
  controllers: [CatalogController],
  providers: [CatalogService],
})
export class CatalogModule {}