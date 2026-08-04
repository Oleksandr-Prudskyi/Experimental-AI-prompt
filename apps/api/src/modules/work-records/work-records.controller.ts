import { Controller, Get, Post, Patch, Delete, Param, Body, Query, UseGuards } from '@nestjs/common';
import { WorkRecordsService } from './work-records.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { PermissionsGuard } from '../../common/guards/permissions.guard';
import { RequirePermissions } from '../../common/decorators/permissions.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { ZodValidationPipe } from '../../common/pipes/zod-validation.pipe';
import { createWorkRecordSchema, PERMISSIONS } from '@evidence/shared';

@Controller('api/v1/work-records')
@UseGuards(JwtAuthGuard, PermissionsGuard)
export class WorkRecordsController {
  constructor(private workRecordsService: WorkRecordsService) {}

  @Get()
  findAll(
    @Query('cursor') cursor?: string,
    @Query('limit') limit?: string,
    @Query('category') category?: string,
    @Query('machine_id') machineId?: string,
    @Query('date_from') dateFrom?: string,
    @Query('date_to') dateTo?: string,
    @Query('status') status?: string,
    @Query('author_id') authorId?: string,
  ) {
    return this.workRecordsService.findAll({
      cursor, limit: limit ? parseInt(limit) : undefined,
      category, machineId, dateFrom, dateTo, status, authorId,
    });
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.workRecordsService.findOne(id);
  }

  @Post()
  @RequirePermissions(PERMISSIONS.RECORDS_CREATE)
  create(
    @Body(new ZodValidationPipe(createWorkRecordSchema)) body: any,
    @CurrentUser('id') authorId: string,
  ) {
    return this.workRecordsService.create(body, authorId);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() body: any, @CurrentUser() user: any) {
    return this.workRecordsService.update(id, body, user);
  }

  @Delete(':id')
  @RequirePermissions(PERMISSIONS.RECORDS_DELETE)
  delete(@Param('id') id: string) {
    return this.workRecordsService.softDelete(id);
  }

  @Post(':id/duplicate')
  @RequirePermissions(PERMISSIONS.RECORDS_CREATE)
  duplicate(@Param('id') id: string, @CurrentUser('id') authorId: string) {
    return this.workRecordsService.duplicate(id, authorId);
  }
}
