import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

const TRASHABLE_ENTITIES = ['user', 'workshop', 'productionLine', 'machine', 'team', 'workRecord', 'comment'] as const;

@Injectable()
export class TrashService {
  constructor(private prisma: PrismaService) {}

  async findAll() {
    const results = await Promise.all(
      TRASHABLE_ENTITIES.map(async (entity) => {
        const items = await (this.prisma[entity] as any).findMany({
          where: { deletedAt: { not: null } },
          orderBy: { deletedAt: 'desc' },
          take: 50,
        });
        return { entityType: entity, items };
      }),
    );
    return results.filter((r) => r.items.length > 0);
  }

  async restore(entityType: string, id: string) {
    if (!TRASHABLE_ENTITIES.includes(entityType as any)) {
      throw new NotFoundException('Neplatný typ entity');
    }
    const model = this.prisma[entityType as keyof typeof this.prisma] as any;
    await model.update({ where: { id }, data: { deletedAt: null } });
    return { message: 'Obnoveno' };
  }

  async permanentDelete(entityType: string, id: string) {
    if (!TRASHABLE_ENTITIES.includes(entityType as any)) {
      throw new NotFoundException('Neplatný typ entity');
    }
    const model = this.prisma[entityType as keyof typeof this.prisma] as any;
    await model.delete({ where: { id } });
    return { message: 'Trvale smazáno' };
  }
}
