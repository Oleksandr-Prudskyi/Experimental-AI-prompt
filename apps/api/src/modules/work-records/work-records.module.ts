import { Module } from '@nestjs/common';
import { WorkRecordsController } from './work-records.controller';
import { WorkRecordsService } from './work-records.service';
import { DemoCreateLimitGuard } from '../../common/guards/demo.guard';

@Module({
  controllers: [WorkRecordsController],
  providers: [WorkRecordsService, DemoCreateLimitGuard],
  exports: [WorkRecordsService],
})
export class WorkRecordsModule {}
