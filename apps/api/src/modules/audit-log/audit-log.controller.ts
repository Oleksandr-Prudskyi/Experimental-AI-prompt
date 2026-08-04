import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { AuditLogService } from './audit-log.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { PermissionsGuard } from '../../common/guards/permissions.guard';
import { RequirePermissions } from '../../common/decorators/permissions.decorator';
import { PERMISSIONS } from '@evidence/shared';

@Controller('api/v1/audit-logs')
@UseGuards(JwtAuthGuard, PermissionsGuard)
export class AuditLogController {
  constructor(private auditLogService: AuditLogService) {}

  @Get()
  @RequirePermissions(PERMISSIONS.AUDIT_VIEW)
  findAll(
    @Query('cursor') cursor?: string,
    @Query('limit') limit?: string,
    @Query('entity_type') entityType?: string,
    @Query('user_id') userId?: string,
    @Query('action') action?: string,
    @Query('date_from') dateFrom?: string,
    @Query('date_to') dateTo?: string,
  ) {
    return this.auditLogService.findAll({
      cursor, limit: limit ? parseInt(limit) : undefined,
      entityType, userId, action, dateFrom, dateTo,
    });
  }
}
