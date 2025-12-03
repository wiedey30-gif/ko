import { Module } from '@nestjs/common';
import { CrmController } from './crm.controller';
import { CrmService } from './crm.service';
import { QuickRestoModule } from '../quick-resto/quick-resto.module';

@Module({
  imports: [QuickRestoModule],
  controllers: [CrmController],
  providers: [CrmService],
  exports: [CrmService],
})
export class CrmModule {}