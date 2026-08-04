import { Controller, Get, Post, Patch, Delete, Param, Body, Query, UseGuards } from '@nestjs/common';
import { ProductionLinesService } from './production-lines.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { PermissionsGuard } from '../../common/guards/permissions.guard';
import { RequirePermissions } from '../../common/decorators/permissions.decorator';
import { ZodValidationPipe } from '../../common/pipes/zod-validation.pipe';
import { createProductionLineSchema, PERMISSIONS } from '@evidence/shared';

@Controller('api/v1/production-lines')
@UseGuards(JwtAuthGuard, PermissionsGuard)
export class ProductionLinesController {
  constructor(private productionLinesService: ProductionLinesService) {}

  @Get()
  findAll(@Query('workshop_id') workshopId?: string) {
    return this.productionLinesService.findAll(workshopId);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.productionLinesService.findOne(id);
  }

  @Post()
  @RequirePermissions(PERMISSIONS.WORKSHOPS_MANAGE)
  create(@Body(new ZodValidationPipe(createProductionLineSchema)) body: any) {
    return this.productionLinesService.create(body);
  }

  @Patch(':id')
  @RequirePermissions(PERMISSIONS.WORKSHOPS_MANAGE)
  update(@Param('id') id: string, @Body() body: any) {
    return this.productionLinesService.update(id, body);
  }

  @Delete(':id')
  @RequirePermissions(PERMISSIONS.WORKSHOPS_MANAGE)
  delete(@Param('id') id: string) {
    return this.productionLinesService.softDelete(id);
  }
}
