import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import type { Priority } from '@prisma/client';

@Injectable()
export class AnnouncementsService {
  constructor(private prisma: PrismaService) {}

  async findAll(params: { cursor?: string; limit?: number }) {
    const limit = params.limit || 20;
    const where = { deletedAt: null };
    const announcements = await this.prisma.announcement.findMany({
      where,
      take: limit + 1,
      ...(params.cursor && { cursor: { id: params.cursor }, skip: 1 }),
      orderBy: { createdAt: 'desc' },
      include: { author: { include: { role: true } } },
    });

    const hasMore = announcements.length > limit;
    const data = hasMore ? announcements.slice(0, limit) : announcements;
    return {
      data: data.map(({ author, ...rest }) => {
        const { passwordHash, ...safeAuthor } = author;
        return { ...rest, author: safeAuthor };
      }),
      meta: { hasMore, cursor: data.at(-1)?.id },
    };
  }

  async findOne(id: string) {
    const announcement = await this.prisma.announcement.findFirst({
      where: { id, deletedAt: null },
      include: { author: { include: { role: true } } },
    });
    if (!announcement) throw new NotFoundException('Announcement not found');
    const { passwordHash, ...safeAuthor } = announcement.author;
    return { ...announcement, author: safeAuthor };
  }

  async create(
    data: { title: string; content: string; priority?: string; isActive?: boolean; expiresAt?: string },
    authorId: string,
  ) {
    return this.prisma.announcement.create({
      data: {
        title: data.title,
        content: data.content,
        priority: data.priority as Priority | undefined,
        isActive: data.isActive,
        expiresAt: data.expiresAt ? new Date(data.expiresAt) : undefined,
        authorId,
      },
    });
  }

  async update(
    id: string,
    data: { title?: string; content?: string; priority?: string; isActive?: boolean; expiresAt?: string },
  ) {
    await this.findOne(id);
    return this.prisma.announcement.update({
      where: { id },
      data: {
        title: data.title,
        content: data.content,
        priority: data.priority as Priority | undefined,
        isActive: data.isActive,
        expiresAt: data.expiresAt !== undefined ? new Date(data.expiresAt) : undefined,
      },
    });
  }

  async softDelete(id: string) {
    await this.findOne(id);
    await this.prisma.announcement.update({ where: { id }, data: { deletedAt: new Date() } });
    return { message: 'Announcement deleted' };
  }
}
