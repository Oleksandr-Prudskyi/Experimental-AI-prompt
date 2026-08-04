import { Injectable, NestInterceptor, ExecutionContext, CallHandler } from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class AuditInterceptor implements NestInterceptor {
  constructor(private prisma: PrismaService) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest();
    const method = request.method;

    if (!['POST', 'PATCH', 'DELETE'].includes(method)) return next.handle();

    const user = request.user;
    if (!user) return next.handle();

    const url = request.url;
    const urlParts = url.replace('/api/v1/', '').split('/');
    const entityType = urlParts[0];
    const entityId = urlParts[1] || null;

    const actionMap: Record<string, string> = { POST: 'create', PATCH: 'update', DELETE: 'delete' };
    const action = actionMap[method];

    return next.handle().pipe(
      tap(async (responseData) => {
        try {
          await this.prisma.auditLog.create({
            data: {
              userId: user.id,
              action: action as any,
              entityType,
              entityId: entityId || responseData?.data?.id || 'unknown',
              newValue: method !== 'DELETE' ? request.body : undefined,
              metadata: { ip: request.ip, url },
            },
          });
        } catch {}
      }),
    );
  }
}
