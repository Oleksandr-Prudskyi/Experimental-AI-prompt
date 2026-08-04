import { Controller, Get, Post, Delete, Param, UseGuards } from '@nestjs/common';
import { TrashService } from './trash.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { PermissionsGuard } from '../../common/guards/permissions.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';

@Controller('api/v1/trash')
@UseGuards(JwtAuthGuard, PermissionsGuard)
export class TrashController {
  constructor(private trashService: TrashService) {}

  @Get()
  findAll() {
    return this.trashService.findAll();
  }

  @Post(':entityType/:id/restore')
  restore(@Param('entityType') entityType: string, @Param('id') id: string) {
    return this.trashService.restore(entityType, id);
  }

  @Delete(':entityType/:id/permanent')
  @UseGuards(RolesGuard)
  @Roles('administrator')
  permanentDelete(@Param('entityType') entityType: string, @Param('id') id: string) {
    return this.trashService.permanentDelete(entityType, id);
  }
}
