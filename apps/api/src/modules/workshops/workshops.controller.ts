import { Controller, Get, Post, Patch, Delete, Param, Body, UseGuards } from '@nestjs/common';
import { WorkshopsService } from './workshops.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { PermissionsGuard } from '../../common/guards/permissions.guard';
import { RequirePermissions } from '../../common/decorators/permissions.decorator';
import { ZodValidationPipe } from '../../common/pipes/zod-validation.pipe';
import { createWorkshopSchema, updateWorkshopSchema, PERMISSIONS } from '@evidence/shared';

@Controller('api/v1/workshops')
@UseGuards(JwtAuthGuard, PermissionsGuard)
export class WorkshopsController {
  constructor(private workshopsService: WorkshopsService) {}

  @Get()
  findAll() {
    return this.workshopsService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.workshopsService.findOne(id);
  }

  @Post()
  @RequirePermissions(PERMISSIONS.WORKSHOPS_MANAGE)
  create(@Body(new ZodValidationPipe(createWorkshopSchema)) body: any) {
    return this.workshopsService.create(body);
  }

  @Patch(':id')
  @RequirePermissions(PERMISSIONS.WORKSHOPS_MANAGE)
  update(@Param('id') id: string, @Body(new ZodValidationPipe(updateWorkshopSchema)) body: any) {
    return this.workshopsService.update(id, body);
  }

  @Delete(':id')
  @RequirePermissions(PERMISSIONS.WORKSHOPS_MANAGE)
  delete(@Param('id') id: string) {
    return this.workshopsService.softDelete(id);
  }
}
