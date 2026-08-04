import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import type { CreateProductionLineInput } from '@evidence/shared';

@Injectable()
export class ProductionLinesService {
  constructor(private prisma: PrismaService) {}

  async findAll(workshopId?: string) {
    const where: any = { deletedAt: null };
    if (workshopId) where.workshopId = workshopId;
    const lines = await this.prisma.productionLine.findMany({
      where,
      orderBy: { name: 'asc' },
      include: { workshop: true },
    });
    return { data: lines };
  }

  async findOne(id: string) {
    const line = await this.prisma.productionLine.findFirst({
      where: { id, deletedAt: null },
      include: { workshop: true, machines: { where: { deletedAt: null } } },
    });
    if (!line) throw new NotFoundException('Výrobní linka nenalezena');
    return line;
  }

  async create(data: CreateProductionLineInput) {
    return this.prisma.productionLine.create({ data, include: { workshop: true } });
  }

  async update(id: string, data: Partial<CreateProductionLineInput>) {
    await this.findOne(id);
    return this.prisma.productionLine.update({ where: { id }, data, include: { workshop: true } });
  }

  async softDelete(id: string) {
    await this.findOne(id);
    await this.prisma.productionLine.update({ where: { id }, data: { deletedAt: new Date() } });
    return { message: 'Výrobní linka smazána' };
  }
}
