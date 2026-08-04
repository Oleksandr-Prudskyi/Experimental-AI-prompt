import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import type { CreateWorkshopInput } from '@evidence/shared';

@Injectable()
export class WorkshopsService {
  constructor(private prisma: PrismaService) {}

  async findAll() {
    const workshops = await this.prisma.workshop.findMany({
      where: { deletedAt: null },
      orderBy: { name: 'asc' },
      include: { productionLines: { where: { deletedAt: null } } },
    });
    return { data: workshops };
  }

  async findOne(id: string) {
    const workshop = await this.prisma.workshop.findFirst({
      where: { id, deletedAt: null },
      include: { productionLines: { where: { deletedAt: null } }, users: { where: { deletedAt: null }, include: { role: true } } },
    });
    if (!workshop) throw new NotFoundException('Dílna nenalezena');
    return workshop;
  }

  async create(data: CreateWorkshopInput) {
    return this.prisma.workshop.create({ data });
  }

  async update(id: string, data: Partial<CreateWorkshopInput>) {
    await this.findOne(id);
    return this.prisma.workshop.update({ where: { id }, data });
  }

  async softDelete(id: string) {
    await this.findOne(id);
    await this.prisma.workshop.update({ where: { id }, data: { deletedAt: new Date() } });
    return { message: 'Dílna smazána' };
  }
}
