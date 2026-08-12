import { Injectable, UnauthorizedException, ForbiddenException, BadRequestException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwt: JwtService,
    private config: ConfigService,
  ) {}

  async validateUser(email: string, password: string) {
    const user = await this.prisma.user.findUnique({
      where: { email },
      include: { role: true, workshop: true, shift: true },
    });
    if (!user || !user.isActive || user.deletedAt) {
      throw new UnauthorizedException('Neplatné přihlašovací údaje');
    }
    const valid = await bcrypt.compare(password, user.passwordHash);
    if (!valid) {
      throw new UnauthorizedException('Neplatné přihlašovací údaje');
    }
    return user;
  }

  async login(user: any) {
    const payload = { sub: user.id, email: user.email, role: user.role.slug };
    const accessToken = this.jwt.sign(payload, {
      secret: this.config.get('JWT_SECRET'),
      expiresIn: '15m',
    });
    const refreshToken = this.jwt.sign(payload, {
      secret: this.config.get('JWT_REFRESH_SECRET'),
      expiresIn: '7d',
    });

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { passwordHash, ...safeUser } = user;
    return { accessToken, refreshToken, user: safeUser };
  }

  async refreshTokens(token: string) {
    try {
      const payload = this.jwt.verify(token, {
        secret: this.config.get('JWT_REFRESH_SECRET'),
      });
      const user = await this.prisma.user.findUnique({
        where: { id: payload.sub },
        include: { role: true, workshop: true, shift: true },
      });
      if (!user || !user.isActive || user.deletedAt) {
        throw new UnauthorizedException('Neplatný token');
      }
      return this.login(user);
    } catch {
      throw new UnauthorizedException('Neplatný refresh token');
    }
  }

  async changePassword(userId: string, currentPassword: string, newPassword: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: { role: true },
    });
    if (!user) throw new UnauthorizedException();

    if (user.email === 'demo@evidence.local') {
      throw new ForbiddenException('Heslo demo účtu nelze změnit');
    }

    if (user.role?.slug === 'administrator') {
      throw new ForbiddenException('Heslo administrátora nelze změnit');
    }

    const valid = await bcrypt.compare(currentPassword, user.passwordHash);
    if (!valid) {
      throw new BadRequestException('Aktuální heslo je nesprávné');
    }

    const hash = await bcrypt.hash(newPassword, 10);
    await this.prisma.user.update({
      where: { id: userId },
      data: { passwordHash: hash },
    });

    return { message: 'Heslo bylo úspěšně změněno' };
  }

  async getProfile(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: {
        role: true,
        workshop: true,
        shift: true,
        permissions: true,
      },
    });
    if (!user) throw new UnauthorizedException();
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { passwordHash, ...safeUser } = user;
    return safeUser;
  }
}
