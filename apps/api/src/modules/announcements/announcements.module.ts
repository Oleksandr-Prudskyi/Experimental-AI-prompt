import { Module } from '@nestjs/common';
import { AnnouncementsController } from './announcements.controller';
import { AnnouncementsService } from './announcements.service';
import { DemoAnnouncementLimitGuard } from '../../common/guards/demo.guard';

@Module({
  controllers: [AnnouncementsController],
  providers: [AnnouncementsService, DemoAnnouncementLimitGuard],
  exports: [AnnouncementsService],
})
export class AnnouncementsModule {}
