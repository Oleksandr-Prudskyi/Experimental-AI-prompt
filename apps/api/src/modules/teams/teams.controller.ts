import { Controller, Get, Post, Patch, Delete, Param, Body, Query, UseGuards } from '@nestjs/common';
import { TeamsService } from './teams.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { PermissionsGuard } from '../../common/guards/permissions.guard';
import { RequirePermissions } from '../../common/decorators/permissions.decorator';
import { PERMISSIONS } from '@evidence/shared';

@Controller('api/v1/teams')
@UseGuards(JwtAuthGuard, PermissionsGuard)
export class TeamsController {
  constructor(private teamsService: TeamsService) {}

  @Get()
  findAll(@Query('workshop_id') workshopId?: string) {
    return this.teamsService.findAll(workshopId);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.teamsService.findOne(id);
  }

  @Post()
  @RequirePermissions(PERMISSIONS.TEAMS_MANAGE)
  create(@Body() body: { name: string; workshopId: string }) {
    return this.teamsService.create(body);
  }

  @Patch(':id')
  @RequirePermissions(PERMISSIONS.TEAMS_MANAGE)
  update(@Param('id') id: string, @Body() body: { name?: string; workshopId?: string }) {
    return this.teamsService.update(id, body);
  }

  @Delete(':id')
  @RequirePermissions(PERMISSIONS.TEAMS_MANAGE)
  delete(@Param('id') id: string) {
    return this.teamsService.softDelete(id);
  }

  @Post(':id/members')
  @RequirePermissions(PERMISSIONS.TEAMS_MANAGE)
  addMember(@Param('id') id: string, @Body('userId') userId: string) {
    return this.teamsService.addMember(id, userId);
  }

  @Delete(':id/members/:userId')
  @RequirePermissions(PERMISSIONS.TEAMS_MANAGE)
  removeMember(@Param('id') id: string, @Param('userId') userId: string) {
    return this.teamsService.removeMember(id, userId);
  }
}
