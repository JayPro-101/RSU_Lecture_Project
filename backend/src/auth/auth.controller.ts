import {
  Controller,
  Post,
  Get,
  Body,
  Req,
  Res,
  HttpCode,
  HttpStatus,
  UseGuards,
  UnauthorizedException,
} from '@nestjs/common';
import type { Request, Response } from 'express';
import { ConfigService } from '@nestjs/config';
import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { VerifyEmailDto } from './dto/verify-email.dto';
import { ResendVerificationDto } from './dto/resend-verification.dto';
import { ForgotPasswordDto } from './dto/forgot-password.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { Public } from '../common/decorators/public.decorator';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import type { AuthenticatedUser } from '../common/decorators/current-user.decorator';
import { UserResponseDto } from '../users/dto/user-response.dto';
import { ApiResponseDto } from '../common/dto/api-response.dto';

const REFRESH_TOKEN_COOKIE = 'rsu_refresh_token';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly configService: ConfigService,
  ) {}

  private setRefreshTokenCookie(res: Response, refreshToken: string) {
    const isProduction = this.configService.get('NODE_ENV') === 'production';
    const isSecure =
      this.configService.get<string>('COOKIE_SECURE') === 'true' ||
      isProduction;
    const sameSite =
      (this.configService.get<string>('COOKIE_SAME_SITE') as
        'lax' | 'strict' | 'none') || 'lax';

    res.cookie(REFRESH_TOKEN_COOKIE, refreshToken, {
      httpOnly: true,
      secure: isSecure,
      sameSite,
      path: '/auth',
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });
  }

  private clearRefreshTokenCookie(res: Response) {
    const isProduction = this.configService.get('NODE_ENV') === 'production';
    const isSecure =
      this.configService.get<string>('COOKIE_SECURE') === 'true' ||
      isProduction;
    const sameSite =
      (this.configService.get<string>('COOKIE_SAME_SITE') as
        'lax' | 'strict' | 'none') || 'lax';

    res.clearCookie(REFRESH_TOKEN_COOKIE, {
      httpOnly: true,
      secure: isSecure,
      sameSite,
      path: '/auth',
    });
  }

  @Public()
  @Post('register')
  @HttpCode(HttpStatus.CREATED)
  async register(
    @Body() dto: RegisterDto,
  ): Promise<ApiResponseDto<UserResponseDto>> {
    const user = await this.authService.register(dto);
    return ApiResponseDto.success(
      'Registration successful. Please check your email to verify your account.',
      user,
    );
  }

  @Public()
  @Post('login')
  @HttpCode(HttpStatus.OK)
  async login(
    @Body() dto: LoginDto,
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ): Promise<
    ApiResponseDto<{
      user: UserResponseDto;
      accessToken: string;
      expiresIn: number;
    }>
  > {
    const metadata = {
      userAgent: req.headers['user-agent'],
      ipAddress: req.ip || req.socket.remoteAddress,
    };

    const result = await this.authService.login(dto, metadata);
    this.setRefreshTokenCookie(res, result.tokens.refreshToken);

    return ApiResponseDto.success('Login successful', {
      user: result.user,
      accessToken: result.tokens.accessToken,
      expiresIn: result.tokens.expiresIn,
    });
  }

  @Public()
  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  async refresh(
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
    @Body('refreshToken') bodyRefreshToken?: string,
  ): Promise<ApiResponseDto<{ accessToken: string; expiresIn: number }>> {
    const token = (req.cookies?.[REFRESH_TOKEN_COOKIE] || bodyRefreshToken) as
      string | undefined;

    if (!token) {
      throw new UnauthorizedException('Refresh token is required');
    }

    const metadata = {
      userAgent: req.headers['user-agent'],
      ipAddress: req.ip || req.socket.remoteAddress,
    };

    const tokens = await this.authService.refresh(token, metadata);
    this.setRefreshTokenCookie(res, tokens.refreshToken);

    return ApiResponseDto.success('Token refreshed successfully', {
      accessToken: tokens.accessToken,
      expiresIn: tokens.expiresIn,
    });
  }

  @Public()
  @Post('logout')
  @HttpCode(HttpStatus.OK)
  async logout(
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
    @Body('refreshToken') bodyRefreshToken?: string,
  ): Promise<ApiResponseDto<null>> {
    const token = (req.cookies?.[REFRESH_TOKEN_COOKIE] || bodyRefreshToken) as
      string | undefined;

    await this.authService.logout(token);
    this.clearRefreshTokenCookie(res);

    return ApiResponseDto.success('Logged out successfully');
  }

  @UseGuards(JwtAuthGuard)
  @Post('logout-all')
  @HttpCode(HttpStatus.OK)
  async logoutAll(
    @CurrentUser('id') userId: string,
    @Res({ passthrough: true }) res: Response,
  ): Promise<ApiResponseDto<{ revokedCount: number }>> {
    const result = await this.authService.logoutAll(userId);
    this.clearRefreshTokenCookie(res);

    return ApiResponseDto.success('All active sessions have been revoked', {
      revokedCount: result.revokedCount,
    });
  }

  @UseGuards(JwtAuthGuard)
  @Get('me')
  async me(
    @CurrentUser() user: AuthenticatedUser,
  ): Promise<ApiResponseDto<UserResponseDto>> {
    const profile = await this.authService.getCurrentUserProfile(user);
    return ApiResponseDto.success('Current user profile retrieved', profile);
  }

  @Public()
  @Post('verify-email')
  @HttpCode(HttpStatus.OK)
  async verifyEmail(
    @Body() dto: VerifyEmailDto,
  ): Promise<ApiResponseDto<{ verified: boolean }>> {
    const result = await this.authService.verifyEmail(dto);
    return ApiResponseDto.success(result.message, {
      verified: result.verified,
    });
  }

  @Public()
  @Post('resend-verification')
  @HttpCode(HttpStatus.OK)
  async resendVerification(
    @Body() dto: ResendVerificationDto,
  ): Promise<ApiResponseDto<null>> {
    const result = await this.authService.resendVerification(dto);
    return ApiResponseDto.success(result.message);
  }

  @Public()
  @Post('forgot-password')
  @HttpCode(HttpStatus.OK)
  async forgotPassword(
    @Body() dto: ForgotPasswordDto,
  ): Promise<ApiResponseDto<null>> {
    const result = await this.authService.forgotPassword(dto);
    return ApiResponseDto.success(result.message);
  }

  @Public()
  @Post('reset-password')
  @HttpCode(HttpStatus.OK)
  async resetPassword(
    @Body() dto: ResetPasswordDto,
  ): Promise<ApiResponseDto<null>> {
    const result = await this.authService.resetPassword(dto);
    return ApiResponseDto.success(result.message);
  }
}
