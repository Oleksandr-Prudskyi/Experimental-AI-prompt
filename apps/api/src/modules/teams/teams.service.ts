import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class TeamsService {
  constructor(private prisma: PrismaService) {}

  async findAll(workshopId?: string) {
    const where: any = { deletedAt: null };
    if (workshopId) where.workshopId = workshopId;
    const teams = await this.prisma.team.findMany({
      where,
      orderBy: { name: 'asc' },
      include: {
        workshop: true,
        members: { include: { user: { select: { id: true, fullName: true, email: true } } } },
      },
    });
    return { data: teams };
  }

  async findOne(id: string) {
    const team = await this.prisma.team.findFirst({
      where: { id, deletedAt: null },
      include: {
        workshop: true,
        members: { include: { user: { select: { id: true, fullName: true, email: true, role: true } } } },
      },
    });
    if (!team) throw new NotFoundException('Tým nenalezen');
    return team;
  }

  async create(data: { name: string; workshopId: string }) {
    return this.prisma.team.create({ data, include: { workshop: true } });
  }

  async update(id: string, data: { name?: string; workshopId?: string }) {
    await this.findOne(id);
    return this.prisma.team.update({ where: { id }, data, include: { workshop: true } });
  }

  async softDelete(id: string) {
    await this.findOne(id);
    await this.prisma.team.update({ where: { id }, data: { deletedAt: new Date() } });
    return { message: 'Tým smazán' };
  }

  async addMember(teamId: string, userId: string) {
    return this.prisma.teamMember.create({
      data: { teamId, userId },
      include: { user: { select: { id: true, fullName: true } } },
    });
  }

  async removeMember(teamId: string, userId: string) {
    await this.prisma.teamMember.deleteMany({ where: { teamId, userId } });
    return { message: 'Člen odebrán' };
  }
}
