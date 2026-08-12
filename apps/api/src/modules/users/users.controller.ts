import { Controller, Get, Post, Patch, Delete, Param, Body, Query, UseGuards } from '@nestjs/common';
import { UsersService } from './users.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { PermissionsGuard } from '../../common/guards/permissions.guard';
import { DemoBlockGuard, DemoDeleteBlockGuard } from '../../common/guards/demo.guard';
import { RequirePermissions } from '../../common/decorators/permissions.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { ZodValidationPipe } from '../../common/pipes/zod-validation.pipe';
import { createUserSchema, updateUserSchema, PERMISSIONS } from '@evidence/shared';

@Controller('api/v1/users')
@UseGuards(JwtAuthGuard, PermissionsGuard)
export class UsersController {
  constructor(private usersService: UsersService) {}

  @Get()
  @RequirePermissions(PERMISSIONS.USERS_MANAGE)
  findAll(@Query('cursor') cursor?: string, @Query('limit') limit?: string) {
    return this.usersService.findAll({ cursor, limit: limit ? parseInt(limit) : undefined });
  }

  @Get('roles')
  getRoles() {
    return this.usersService.getRoles();
  }

  @Get(':id')
  @RequirePermissions(PERMISSIONS.USERS_MANAGE)
  findOne(@Param('id') id: string) {
    return this.usersService.findOne(id);
  }

  @Post()
  @RequirePermissions(PERMISSIONS.USERS_MANAGE)
  @UseGuards(DemoBlockGuard)
  create(@Body(new ZodValidationPipe(createUserSchema)) body: any) {
    return this.usersService.create(body);
  }

  @Patch(':id')
  @RequirePermissions(PERMISSIONS.USERS_MANAGE)
  update(@Param('id') id: string, @Body(new ZodValidationPipe(updateUserSchema)) body: any) {
    return this.usersService.update(id, body);
  }

  @Delete(':id')
  @RequirePermissions(PERMISSIONS.USERS_MANAGE)
  @UseGuards(DemoDeleteBlockGuard)
  delete(@Param('id') id: string) {
    return this.usersService.softDelete(id);
  }

  @Get(':id/permissions')
  @RequirePermissions(PERMISSIONS.USERS_GRANT_PERMISSIONS)
  getPermissions(@Param('id') id: string) {
    return this.usersService.getPermissions(id);
  }

  @Post(':id/permissions')
  @RequirePermissions(PERMISSIONS.USERS_GRANT_PERMISSIONS)
  grantPermission(
    @Param('id') id: string,
    @Body('permission') permission: string,
    @CurrentUser('id') grantedBy: string,
  ) {
    return this.usersService.grantPermission(id, permission, grantedBy);
  }

  @Delete(':id/permissions/:permId')
  @RequirePermissions(PERMISSIONS.USERS_GRANT_PERMISSIONS)
  revokePermission(@Param('permId') permId: string) {
    return this.usersService.revokePermission(permId);
  }
}
