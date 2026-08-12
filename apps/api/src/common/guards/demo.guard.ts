import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

const DEMO_EMAIL = 'demo@evidence.local';
const DAILY_CREATE_LIMIT = 2;

@Injectable()
export class DemoCreateLimitGuard implements CanActivate {
  constructor(private prisma: PrismaService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const user = request.user;
    if (!user || user.email !== DEMO_EMAIL) return true;

    const since = new Date();
    since.setHours(since.getHours() - 24);

    const count = await this.prisma.workRecord.count({
      where: { authorId: user.id, createdAt: { gte: since } },
    });

    if (count >= DAILY_CREATE_LIMIT) {
      throw new ForbiddenException(
        `Demo účet může vytvořit maximálně ${DAILY_CREATE_LIMIT} záznamy za 24 hodin`,
      );
    }

    return true;
  }
}

@Injectable()
export class DemoAnnouncementLimitGuard implements CanActivate {
  constructor(private prisma: PrismaService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const user = request.user;
    if (!user || user.email !== DEMO_EMAIL) return true;

    const since = new Date();
    since.setHours(since.getHours() - 24);

    const count = await this.prisma.announcement.count({
      where: { authorId: user.id, createdAt: { gte: since } },
    });

    if (count >= DAILY_CREATE_LIMIT) {
      throw new ForbiddenException(
        `Demo účet může vytvořit maximálně ${DAILY_CREATE_LIMIT} oznámení za 24 hodin`,
      );
    }

    return true;
  }
}

@Injectable()
export class DemoBlockGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    const user = request.user;
    if (user?.email === DEMO_EMAIL) {
      throw new ForbiddenException('Tato akce není dostupná pro demo účet');
    }
    return true;
  }
}

@Injectable()
export class DemoDeleteBlockGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    const user = request.user;
    if (user?.email === DEMO_EMAIL) {
      throw new ForbiddenException('Demo účet nemůže mazat záznamy');
    }
    return true;
  }
}
