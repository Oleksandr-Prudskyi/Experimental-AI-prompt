import {
  Controller,
  Post,
  Get,
  UseGuards,
  Body,
  Res,
  Req,
  HttpCode,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import type { Response, Request } from 'express';
import { AuthService } from './auth.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { ZodValidationPipe } from '../../common/pipes/zod-validation.pipe';
import { loginSchema } from '@evidence/shared';
import type { LoginInput } from '@evidence/shared';

@Controller('api/v1/auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('login')
  @HttpCode(200)
  @UseGuards(AuthGuard('local'))
  async login(
    @Body(new ZodValidationPipe(loginSchema)) _body: LoginInput,
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ) {
    const result = await this.authService.login(req.user);
    res.cookie('refresh_token', result.refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000,
      path: '/api/v1/auth',
    });
    return { accessToken: result.accessToken, user: result.user };
  }

  @Post('refresh')
  @HttpCode(200)
  async refresh(
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ) {
    const token = req.cookies?.refresh_token;
    if (!token) {
      res
        .status(401)
        .json({ error: { code: 'NO_TOKEN', message: 'Refresh token chybí' } });
      return;
    }
    const result = await this.authService.refreshTokens(token);
    res.cookie('refresh_token', result.refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000,
      path: '/api/v1/auth',
    });
    return { accessToken: result.accessToken, user: result.user };
  }

  @Post('logout')
  @HttpCode(200)
  @UseGuards(JwtAuthGuard)
  async logout(@Res({ passthrough: true }) res: Response) {
    res.clearCookie('refresh_token', { path: '/api/v1/auth' });
    return { message: 'Odhlášení úspěšné' };
  }

  @Get('me')
  @UseGuards(JwtAuthGuard)
  async me(@CurrentUser('id') userId: string) {
    return this.authService.getProfile(userId);
  }
}
