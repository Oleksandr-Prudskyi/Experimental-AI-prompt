import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class ShiftsService {
  constructor(private prisma: PrismaService) {}

  async findAll() {
    const shifts = await this.prisma.shift.findMany({
      orderBy: { startTime: 'asc' },
    });
    return { data: shifts };
  }

  async findOne(id: string) {
    const shift = await this.prisma.shift.findUnique({ where: { id } });
    if (!shift) throw new NotFoundException('Směna nenalezena');
    return shift;
  }

  async create(data: { name: string; startTime: string; endTime: string; isActive?: boolean }) {
    return this.prisma.shift.create({ data });
  }

  async update(id: string, data: { name?: string; startTime?: string; endTime?: string; isActive?: boolean }) {
    await this.findOne(id);
    return this.prisma.shift.update({ where: { id }, data });
  }

  async delete(id: string) {
    await this.findOne(id);
    await this.prisma.shift.delete({ where: { id } });
    return { message: 'Směna smazána' };
  }
}
