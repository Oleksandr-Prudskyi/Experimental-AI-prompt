import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class CommentsService {
  constructor(private prisma: PrismaService) {}

  async findAll(entityType: string, entityId: string) {
    return this.prisma.comment.findMany({
      where: { entityType, entityId },
      orderBy: { createdAt: 'asc' },
      include: { author: { select: { id: true, fullName: true } } },
    });
  }

  async create(data: { entityType: string; entityId: string; content: string }, authorId: string) {
    return this.prisma.comment.create({
      data: { ...data, authorId },
      include: { author: { select: { id: true, fullName: true } } },
    });
  }

  async update(id: string, content: string, userId: string) {
    const comment = await this.prisma.comment.findUnique({ where: { id } });
    if (!comment) throw new NotFoundException('Komentář nenalezen');
    return this.prisma.comment.update({
      where: { id },
      data: { content },
      include: { author: { select: { id: true, fullName: true } } },
    });
  }

  async delete(id: string) {
    await this.prisma.comment.delete({ where: { id } });
    return { message: 'Komentář smazán' };
  }
}
