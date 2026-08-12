import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import * as bcrypt from 'bcrypt';
import type { CreateUserInput, UpdateUserInput } from '@evidence/shared';

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  async findAll(params: { cursor?: string; limit?: number }) {
    const limit = params.limit || 20;
    const where = { deletedAt: null };
    const users = await this.prisma.user.findMany({
      where,
      take: limit + 1,
      ...(params.cursor && { cursor: { id: params.cursor }, skip: 1 }),
      orderBy: { createdAt: 'desc' },
      include: { role: true, workshop: true, shift: true },
    });
    const hasMore = users.length > limit;
    const data = hasMore ? users.slice(0, limit) : users;
    return {
      data: data.map(({ passwordHash, ...u }) => u),
      meta: { hasMore, cursor: data.at(-1)?.id },
    };
  }

  async findOne(id: string) {
    const user = await this.prisma.user.findFirst({
      where: { id, deletedAt: null },
      include: { role: true, workshop: true, shift: true, permissions: true },
    });
    if (!user) throw new NotFoundException('Uživatel nenalezen');
    const { passwordHash, ...safeUser } = user;
    return safeUser;
  }

  async create(data: CreateUserInput) {
    const passwordHash = await bcrypt.hash(data.password, 12);
    const user = await this.prisma.user.create({
      data: {
        email: data.email,
        passwordHash,
        fullName: data.fullName,
        roleId: data.roleId,
        workshopId: data.workshopId,
        shiftId: data.shiftId,
        phone: data.phone,
        position: data.position,
      },
      include: { role: true, shift: true },
    });
    const { passwordHash: _, ...safeUser } = user;
    return safeUser;
  }

  async update(id: string, data: UpdateUserInput) {
    await this.findOne(id);
    const user = await this.prisma.user.update({
      where: { id },
      data: {
        ...(data.email && { email: data.email }),
        ...(data.fullName && { fullName: data.fullName }),
        ...(data.roleId && { roleId: data.roleId }),
        ...(data.workshopId !== undefined && { workshopId: data.workshopId }),
        ...(data.shiftId !== undefined && { shiftId: data.shiftId }),
        ...(data.phone !== undefined && { phone: data.phone }),
        ...(data.position !== undefined && { position: data.position }),
      },
      include: { role: true, workshop: true, shift: true },
    });
    const { passwordHash, ...safeUser } = user;
    return safeUser;
  }

  async softDelete(id: string) {
    await this.findOne(id);
    await this.prisma.user.update({ where: { id }, data: { deletedAt: new Date() } });
    return { message: 'Uživatel smazán' };
  }

  async getPermissions(userId: string) {
    return this.prisma.userPermission.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });
  }

  async grantPermission(userId: string, permission: string, grantedBy: string) {
    return this.prisma.userPermission.create({
      data: { userId, permission: permission as any, grantedBy },
    });
  }

  async revokePermission(permissionId: string) {
    return this.prisma.userPermission.delete({ where: { id: permissionId } });
  }

  async getRoles() {
    return this.prisma.role.findMany({ orderBy: { name: 'asc' } });
  }
}
