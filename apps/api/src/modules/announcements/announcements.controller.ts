import { Controller, Get, Post, Patch, Delete, Param, Body, Query, UseGuards } from '@nestjs/common';
import { AnnouncementsService } from './announcements.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { PermissionsGuard } from '../../common/guards/permissions.guard';
import { DemoAnnouncementLimitGuard, DemoDeleteBlockGuard } from '../../common/guards/demo.guard';
import { RequirePermissions } from '../../common/decorators/permissions.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { PERMISSIONS } from '@evidence/shared';

@Controller('api/v1/announcements')
@UseGuards(JwtAuthGuard, PermissionsGuard)
export class AnnouncementsController {
  constructor(private announcementsService: AnnouncementsService) {}

  @Get()
  findAll(@Query('cursor') cursor?: string, @Query('limit') limit?: string) {
    return this.announcementsService.findAll({ cursor, limit: limit ? parseInt(limit) : undefined });
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.announcementsService.findOne(id);
  }

  @Post()
  @RequirePermissions(PERMISSIONS.ANNOUNCEMENTS_MANAGE)
  @UseGuards(DemoAnnouncementLimitGuard)
  create(
    @Body() body: { title: string; content: string; priority?: string; isActive?: boolean; expiresAt?: string },
    @CurrentUser('id') authorId: string,
  ) {
    return this.announcementsService.create(body, authorId);
  }

  @Patch(':id')
  @RequirePermissions(PERMISSIONS.ANNOUNCEMENTS_MANAGE)
  update(@Param('id') id: string, @Body() body: { title?: string; content?: string; priority?: string; isActive?: boolean; expiresAt?: string }) {
    return this.announcementsService.update(id, body);
  }

  @Delete(':id')
  @RequirePermissions(PERMISSIONS.ANNOUNCEMENTS_MANAGE)
  @UseGuards(DemoDeleteBlockGuard)
  delete(@Param('id') id: string) {
    return this.announcementsService.softDelete(id);
  }
}
