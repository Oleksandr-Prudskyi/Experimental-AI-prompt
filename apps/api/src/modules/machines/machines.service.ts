import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import type { CreateMachineInput } from '@evidence/shared';

@Injectable()
export class MachinesService {
  constructor(private prisma: PrismaService) {}

  async findAll(params?: { lineId?: string; workshopId?: string; status?: string }) {
    const where: any = { deletedAt: null };
    if (params?.lineId) where.lineId = params.lineId;
    if (params?.status) where.status = params.status;
    if (params?.workshopId) where.line = { workshopId: params.workshopId };

    const machines = await this.prisma.machine.findMany({
      where,
      orderBy: { name: 'asc' },
      include: { line: { include: { workshop: true } } },
    });
    return { data: machines };
  }

  async findOne(id: string) {
    const machine = await this.prisma.machine.findFirst({
      where: { id, deletedAt: null },
      include: {
        line: { include: { workshop: true } },
        responsibles: { include: { user: { select: { id: true, fullName: true, email: true } } } },
      },
    });
    if (!machine) throw new NotFoundException('Stroj nenalezen');
    return machine;
  }

  async create(data: CreateMachineInput) {
    return this.prisma.machine.create({ data, include: { line: true } });
  }

  async update(id: string, data: Partial<CreateMachineInput>) {
    await this.findOne(id);
    return this.prisma.machine.update({ where: { id }, data, include: { line: true } });
  }

  async softDelete(id: string) {
    await this.findOne(id);
    await this.prisma.machine.update({ where: { id }, data: { deletedAt: new Date() } });
    return { message: 'Stroj smazán' };
  }

  async getHistory(machineId: string, params?: { cursor?: string; limit?: number }) {
    const limit = params?.limit || 20;
    const records = await this.prisma.workRecord.findMany({
      where: { machineId, deletedAt: null },
      take: limit + 1,
      ...(params?.cursor && { cursor: { id: params.cursor }, skip: 1 }),
      orderBy: { date: 'desc' },
      include: { author: { select: { id: true, fullName: true } }, shift: true },
    });
    const hasMore = records.length > limit;
    const data = hasMore ? records.slice(0, limit) : records;
    return { data, meta: { hasMore, cursor: data.at(-1)?.id } };
  }

  async addResponsible(machineId: string, userId: string, role: string) {
    return this.prisma.machineResponsible.create({
      data: { machineId, userId, role },
      include: { user: { select: { id: true, fullName: true } } },
    });
  }

  async removeResponsible(machineId: string, userId: string) {
    return this.prisma.machineResponsible.delete({
      where: { machineId_userId: { machineId, userId } },
    });
  }
}
