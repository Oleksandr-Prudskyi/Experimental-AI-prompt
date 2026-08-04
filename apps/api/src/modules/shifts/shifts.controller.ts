import { Controller, Get, Post, Patch, Delete, Param, Body, UseGuards } from '@nestjs/common';
import { ShiftsService } from './shifts.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { PermissionsGuard } from '../../common/guards/permissions.guard';
import { RequirePermissions } from '../../common/decorators/permissions.decorator';
import { PERMISSIONS } from '@evidence/shared';

@Controller('api/v1/shifts')
@UseGuards(JwtAuthGuard, PermissionsGuard)
export class ShiftsController {
  constructor(private shiftsService: ShiftsService) {}

  @Get()
  findAll() {
    return this.shiftsService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.shiftsService.findOne(id);
  }

  @Post()
  @RequirePermissions(PERMISSIONS.SETTINGS_MANAGE)
  create(@Body() body: { name: string; startTime: string; endTime: string; isActive?: boolean }) {
    return this.shiftsService.create(body);
  }

  @Patch(':id')
  @RequirePermissions(PERMISSIONS.SETTINGS_MANAGE)
  update(@Param('id') id: string, @Body() body: any) {
    return this.shiftsService.update(id, body);
  }

  @Delete(':id')
  @RequirePermissions(PERMISSIONS.SETTINGS_MANAGE)
  delete(@Param('id') id: string) {
    return this.shiftsService.delete(id);
  }
}
