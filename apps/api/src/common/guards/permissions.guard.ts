import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { PERMISSIONS_KEY } from '../decorators/permissions.decorator';
import { DEFAULT_ROLE_PERMISSIONS } from '@evidence/shared';

@Injectable()
export class PermissionsGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const required = this.reflector.getAllAndOverride<string[]>(PERMISSIONS_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (!required) return true;

    const { user } = context.switchToHttp().getRequest();
    if (!user?.role) return false;

    const rolePerms = DEFAULT_ROLE_PERMISSIONS[user.role.slug] || [];
    const userPerms = (user.permissions || []).map((p: any) => p.permission);
    const allPerms = [...rolePerms, ...userPerms];

    return required.every((perm) => allPerms.includes(perm));
  }
}
