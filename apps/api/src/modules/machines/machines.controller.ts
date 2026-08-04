import { Controller, Get, Post, Patch, Delete, Param, Body, Query, UseGuards } from '@nestjs/common';
import { MachinesService } from './machines.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { PermissionsGuard } from '../../common/guards/permissions.guard';
import { RequirePermissions } from '../../common/decorators/permissions.decorator';
import { ZodValidationPipe } from '../../common/pipes/zod-validation.pipe';
import { createMachineSchema, updateMachineSchema, PERMISSIONS } from '@evidence/shared';

@Controller('api/v1/machines')
@UseGuards(JwtAuthGuard, PermissionsGuard)
export class MachinesController {
  constructor(private machinesService: MachinesService) {}

  @Get()
  findAll(
    @Query('line_id') lineId?: string,
    @Query('workshop_id') workshopId?: string,
    @Query('status') status?: string,
  ) {
    return this.machinesService.findAll({ lineId, workshopId, status });
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.machinesService.findOne(id);
  }

  @Get(':id/history')
  getHistory(@Param('id') id: string, @Query('cursor') cursor?: string, @Query('limit') limit?: string) {
    return this.machinesService.getHistory(id, { cursor, limit: limit ? parseInt(limit) : undefined });
  }

  @Post()
  @RequirePermissions(PERMISSIONS.MACHINES_MANAGE)
  create(@Body(new ZodValidationPipe(createMachineSchema)) body: any) {
    return this.machinesService.create(body);
  }

  @Patch(':id')
  @RequirePermissions(PERMISSIONS.MACHINES_MANAGE)
  update(@Param('id') id: string, @Body(new ZodValidationPipe(updateMachineSchema)) body: any) {
    return this.machinesService.update(id, body);
  }

  @Delete(':id')
  @RequirePermissions(PERMISSIONS.MACHINES_MANAGE)
  delete(@Param('id') id: string) {
    return this.machinesService.softDelete(id);
  }

  @Post(':id/responsibles')
  @RequirePermissions(PERMISSIONS.MACHINES_MANAGE)
  addResponsible(@Param('id') id: string, @Body('userId') userId: string, @Body('role') role: string) {
    return this.machinesService.addResponsible(id, userId, role);
  }

  @Delete(':id/responsibles/:userId')
  @RequirePermissions(PERMISSIONS.MACHINES_MANAGE)
  removeResponsible(@Param('id') id: string, @Param('userId') userId: string) {
    return this.machinesService.removeResponsible(id, userId);
  }
}
