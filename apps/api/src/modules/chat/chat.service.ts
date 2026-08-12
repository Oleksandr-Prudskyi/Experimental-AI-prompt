import { Injectable, ForbiddenException, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class ChatService {
  constructor(private prisma: PrismaService) {}

  async getChannels(userId: string) {
    const memberships = await this.prisma.chatMember.findMany({
      where: { userId },
      include: {
        channel: {
          include: {
            members: { include: { user: { select: { id: true, fullName: true } } } },
            messages: { take: 1, orderBy: { createdAt: 'desc' } },
          },
        },
      },
    });

    const data = memberships.map(({ lastReadAt, channel }) => {
      const lastMessage = channel.messages[0] || null;
      return {
        ...channel,
        memberCount: channel.members.length,
        lastMessage,
        unreadCount: 0, // will be filled below
        members: channel.members,
      };
    });

    // Count unread messages per channel
    const unreadCounts = await Promise.all(
      memberships.map(({ channelId, lastReadAt }) =>
        this.prisma.chatMessage.count({
          where: { channelId, createdAt: { gt: lastReadAt } },
        }),
      ),
    );
    data.forEach((ch, i) => {
      ch.unreadCount = unreadCounts[i];
    });

    return { data };
  }

  async getOrCreateDirectChannel(userId: string, otherUserId: string) {
    if (userId === otherUserId) {
      throw new BadRequestException('Cannot create direct channel with yourself');
    }

    // Find existing direct channel where both users are members
    const existing = await this.prisma.chatChannel.findFirst({
      where: {
        type: 'direct',
        AND: [
          { members: { some: { userId } } },
          { members: { some: { userId: otherUserId } } },
        ],
      },
      include: {
        members: { include: { user: { select: { id: true, fullName: true } } } },
      },
    });

    if (existing) return existing;

    return this.prisma.chatChannel.create({
      data: {
        type: 'direct',
        createdById: userId,
        members: {
          create: [{ userId }, { userId: otherUserId }],
        },
      },
      include: {
        members: { include: { user: { select: { id: true, fullName: true } } } },
      },
    });
  }

  async createGroupChannel(name: string, creatorId: string, memberIds: string[]) {
    const uniqueIds = [...new Set([creatorId, ...memberIds])];

    return this.prisma.chatChannel.create({
      data: {
        name,
        type: 'group',
        createdById: creatorId,
        members: {
          create: uniqueIds.map((userId) => ({ userId })),
        },
      },
      include: {
        members: { include: { user: { select: { id: true, fullName: true } } } },
      },
    });
  }

  async createDepartmentChannel(workshopId: string, creatorId: string) {
    const workshop = await this.prisma.workshop.findUnique({ where: { id: workshopId } });
    if (!workshop) throw new NotFoundException('Workshop not found');

    return this.prisma.chatChannel.create({
      data: {
        name: workshop.name,
        type: 'department',
        workshopId,
        createdById: creatorId,
        members: {
          create: [{ userId: creatorId }],
        },
      },
      include: {
        members: { include: { user: { select: { id: true, fullName: true } } } },
      },
    });
  }

  async getMessages(channelId: string, userId: string, params: { cursor?: string; limit?: number }) {
    // Verify membership
    const member = await this.prisma.chatMember.findUnique({
      where: { channelId_userId: { channelId, userId } },
    });
    if (!member) throw new ForbiddenException('Not a member of this channel');

    const limit = params.limit || 50;
    const messages = await this.prisma.chatMessage.findMany({
      where: { channelId },
      take: limit + 1,
      ...(params.cursor && { cursor: { id: params.cursor }, skip: 1 }),
      orderBy: { createdAt: 'desc' },
      include: { author: { include: { role: true } } },
    });

    const hasMore = messages.length > limit;
    const data = hasMore ? messages.slice(0, limit) : messages;

    return {
      data: data.map(({ author, ...rest }) => {
        const { passwordHash, ...safeAuthor } = author;
        return { ...rest, author: safeAuthor };
      }),
      meta: { hasMore, cursor: data.at(-1)?.id },
    };
  }

  async sendMessage(channelId: string, authorId: string, content: string) {
    // Verify membership
    const member = await this.prisma.chatMember.findUnique({
      where: { channelId_userId: { channelId, userId: authorId } },
    });
    if (!member) throw new ForbiddenException('Not a member of this channel');

    const message = await this.prisma.chatMessage.create({
      data: { channelId, authorId, content },
      include: { author: { include: { role: true } } },
    });

    const { passwordHash, ...safeAuthor } = message.author;
    return { ...message, author: safeAuthor };
  }

  async markRead(channelId: string, userId: string) {
    await this.prisma.chatMember.update({
      where: { channelId_userId: { channelId, userId } },
      data: { lastReadAt: new Date() },
    });
    return { message: 'Marked as read' };
  }

  async addMembers(channelId: string, userIds: string[]) {
    const channel = await this.prisma.chatChannel.findUnique({ where: { id: channelId } });
    if (!channel) throw new NotFoundException('Channel not found');

    await this.prisma.chatMember.createMany({
      data: userIds.map((userId) => ({ channelId, userId })),
      skipDuplicates: true,
    });

    return this.prisma.chatChannel.findUnique({
      where: { id: channelId },
      include: {
        members: { include: { user: { select: { id: true, fullName: true } } } },
      },
    });
  }

  async leaveChannel(channelId: string, userId: string) {
    const channel = await this.prisma.chatChannel.findUnique({ where: { id: channelId } });
    if (!channel) throw new NotFoundException('Channel not found');
    if (channel.type === 'direct') {
      throw new BadRequestException('Cannot leave a direct channel');
    }

    await this.prisma.chatMember.delete({
      where: { channelId_userId: { channelId, userId } },
    });

    return { message: 'Left channel' };
  }
}
