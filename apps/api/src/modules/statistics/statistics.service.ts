import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class StatisticsService {
  constructor(private prisma: PrismaService) {}

  async getDashboard() {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const [todayRecords, totalDowntime, machinesBreakdown, openRecords, recentRecords] =
      await Promise.all([
        this.prisma.workRecord.count({
          where: { date: { gte: today }, deletedAt: null },
        }),
        this.prisma.workRecord.aggregate({
          where: { date: { gte: today }, deletedAt: null },
          _sum: { downtimeMin: true },
        }),
        this.prisma.machine.count({
          where: { status: 'breakdown', deletedAt: null },
        }),
        this.prisma.workRecord.count({
          where: { status: { in: ['open', 'in_progress'] }, deletedAt: null },
        }),
        this.prisma.workRecord.findMany({
          where: { deletedAt: null },
          take: 10,
          orderBy: { createdAt: 'desc' },
          include: {
            author: { select: { fullName: true } },
            machine: { select: { name: true, code: true } },
          },
        }),
      ]);

    return {
      todayRecords,
      totalDowntimeMin: totalDowntime._sum.downtimeMin || 0,
      machinesInBreakdown: machinesBreakdown,
      openRecords,
      recentRecords,
    };
  }
}
