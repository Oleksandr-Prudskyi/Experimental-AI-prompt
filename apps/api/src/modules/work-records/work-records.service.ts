import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import type { CreateWorkRecordInput } from '@evidence/shared';

@Injectable()
export class WorkRecordsService {
  constructor(private prisma: PrismaService) {}

  async findAll(params: {
    cursor?: string; limit?: number;
    category?: string; machineId?: string;
    dateFrom?: string; dateTo?: string;
    status?: string; authorId?: string;
  }) {
    const limit = params.limit || 20;
    const where: any = { deletedAt: null };

    if (params.category) where.category = params.category;
    if (params.machineId) where.machineId = params.machineId;
    if (params.status) where.status = params.status;
    if (params.authorId) where.authorId = params.authorId;
    if (params.dateFrom || params.dateTo) {
      where.date = {};
      if (params.dateFrom) where.date.gte = new Date(params.dateFrom);
      if (params.dateTo) where.date.lte = new Date(params.dateTo);
    }

    const records = await this.prisma.workRecord.findMany({
      where,
      take: limit + 1,
      ...(params.cursor && { cursor: { id: params.cursor }, skip: 1 }),
      orderBy: { date: 'desc' },
      include: {
        author: { select: { id: true, fullName: true } },
        machine: { select: { id: true, name: true, code: true } },
        shift: { select: { id: true, name: true } },
        line: { select: { id: true, name: true } },
      },
    });

    const hasMore = records.length > limit;
    const data = hasMore ? records.slice(0, limit) : records;
    return { data, meta: { hasMore, cursor: data.at(-1)?.id } };
  }

  async findOne(id: string) {
    const record = await this.prisma.workRecord.findFirst({
      where: { id, deletedAt: null },
      include: {
        author: { select: { id: true, fullName: true, email: true } },
        machine: { include: { line: { include: { workshop: true } } } },
        shift: true,
        line: true,
      },
    });
    if (!record) throw new NotFoundException('Záznam nenalezen');

    const comments = await this.prisma.comment.findMany({
      where: { entityType: 'work_record', entityId: id },
      include: { author: { select: { id: true, fullName: true } } },
      orderBy: { createdAt: 'asc' },
    });

    return { ...record, comments };
  }

  async create(data: CreateWorkRecordInput, authorId: string) {
    return this.prisma.workRecord.create({
      data: {
        ...data,
        date: new Date(data.date),
        authorId,
      },
      include: {
        author: { select: { id: true, fullName: true } },
        machine: { select: { id: true, name: true } },
      },
    });
  }

  async update(id: string, data: any, currentUser: any) {
    const record = await this.findOne(id);

    if (currentUser.role.slug === 'serizovac') {
      if (record.authorId !== currentUser.id) {
        throw new ForbiddenException('Můžete upravovat pouze vlastní záznamy');
      }
      const recordDate = new Date(record.createdAt).toDateString();
      const today = new Date().toDateString();
      if (recordDate !== today) {
        throw new ForbiddenException('Záznamy lze upravovat pouze v den vytvoření');
      }
    }

    const updateData: any = { ...data };
    if (data.date) updateData.date = new Date(data.date);

    return this.prisma.workRecord.update({
      where: { id },
      data: updateData,
      include: {
        author: { select: { id: true, fullName: true } },
        machine: { select: { id: true, name: true } },
      },
    });
  }

  async softDelete(id: string) {
    await this.findOne(id);
    await this.prisma.workRecord.update({ where: { id }, data: { deletedAt: new Date() } });
    return { message: 'Záznam smazán' };
  }

  async duplicate(id: string, authorId: string) {
    const original = await this.findOne(id);
    const { id: _, createdAt, updatedAt, deletedAt, comments, author, machine, shift, line, ...rest } = original as any;
    return this.prisma.workRecord.create({
      data: { ...rest, authorId, date: new Date() },
      include: { author: { select: { id: true, fullName: true } }, machine: { select: { id: true, name: true } } },
    });
  }
}
