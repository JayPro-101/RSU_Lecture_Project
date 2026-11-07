import {
  Injectable,
  UnauthorizedException,
  BadRequestException,
  ConflictException,
  Logger,
} from '@nestjs/common';
import { JwtService, JwtSignOptions } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import * as argon2 from 'argon2';
import { PrismaService } from '../prisma/prisma.service';
import { UsersService } from '../users/users.service';
import { MailService } from '../mail/mail.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { VerifyEmailDto } from './dto/verify-email.dto';
import { ResendVerificationDto } from './dto/resend-verification.dto';
import { ForgotPasswordDto } from './dto/forgot-password.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { UserResponseDto } from '../users/dto/user-response.dto';
import { generateSecureToken, hashToken } from '../common/utils/crypto.util';
import { AccountStatus, UserRole } from '../common/enums/roles.enum';
import { AuthenticatedUser } from '../common/decorators/current-user.decorator';
import { $Enums } from '@prisma/client';

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
}

export interface AuthResult {
  user: UserResponseDto;
  tokens: AuthTokens;
}

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
    private readonly mailService: MailService,
  ) {}

  /**
   * Hashes a password using Argon2id with OWASP recommended configuration.
   */
  async hashPassword(password: string): Promise<string> {
    return argon2.hash(password, {
      type: argon2.argon2id,
      memoryCost: 2 ** 16, // 64 MB
      timeCost: 3,
      parallelism: 1,
    });
  }

  /**
   * Verifies a password hash using Argon2.
   */
  async verifyPassword(hash: string, plain: string): Promise<boolean> {
    try {
      return await argon2.verify(hash, plain);
    } catch {
      return false;
    }
  }

  /**
   * Register a new student account.
   * Role is strictly defaulted to STUDENT; incoming public payloads cannot assign elevated roles.
   */
  async register(dto: RegisterDto): Promise<UserResponseDto> {
    const normalizedEmail = dto.email.toLowerCase().trim();

    const existingUser = await this.usersService.findByEmail(normalizedEmail);
    if (existingUser) {
      throw new ConflictException(
        'A user with this email address already exists',
      );
    }

    const passwordHash = await this.hashPassword(dto.password);

    const user = await this.prisma.user.create({
      data: {
        email: normalizedEmail,
        displayName: dto.displayName.trim(),
        passwordHash,
        role: UserRole.STUDENT, // Principle: Default role is strictly STUDENT
        accountStatus: AccountStatus.PENDING_VERIFICATION,
      },
    });

    // Create secure email verification token
    const rawToken = generateSecureToken(32);
    const tokenHash = hashToken(rawToken);
    const ttlHours = Number(
      this.configService.get('EMAIL_VERIFICATION_TOKEN_TTL_HOURS', 24),
    );
    const expiresAt = new Date(Date.now() + ttlHours * 60 * 60 * 1000);

    await this.prisma.emailVerificationToken.create({
      data: {
        userId: user.id,
        tokenHash,
        expiresAt,
      },
    });

    // Send verification email via configured provider
    await this.mailService.sendVerificationEmail(
      user.email,
      rawToken,
      user.displayName,
    );

    return this.usersService.toResponseDto(user);
  }

  /**
   * Authenticate user credentials, check account eligibility, and issue session tokens.
   */
  async login(
    dto: LoginDto,
    metadata?: { userAgent?: string; ipAddress?: string },
  ): Promise<AuthResult> {
    const normalizedEmail = dto.email.toLowerCase().trim();
    const user = await this.usersService.findByEmail(normalizedEmail);

    // Timing-safe defense against enumeration: always perform verification check
    if (!user) {
      // Dummy verify to prevent timing attacks
      await this.verifyPassword(
        '$argon2id$v=19$m=65536,t=3,p=1$fakeSaltForTimingDefense$dummyHashValueToPreventEnumeration',
        dto.password,
      );
      throw new UnauthorizedException('Invalid email or password');
    }

    const isPasswordValid = await this.verifyPassword(
      user.passwordHash,
      dto.password,
    );
    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid email or password');
    }

    // Check account status
    if (user.accountStatus === $Enums.AccountStatus.SUSPENDED) {
      throw new UnauthorizedException(
        'This account has been suspended. Please contact platform administrators.',
      );
    }

    if (user.accountStatus === $Enums.AccountStatus.DEACTIVATED) {
      throw new UnauthorizedException('This account has been deactivated.');
    }

    // Email verification check
    if (
      user.accountStatus === $Enums.AccountStatus.PENDING_VERIFICATION &&
      !user.emailVerifiedAt
    ) {
      throw new UnauthorizedException(
        'Please verify your email address before logging in. Check your inbox for the verification token.',
      );
    }

    // Generate tokens & session family
    const familyId = generateSecureToken(16);
    const tokens = await this.createSession(
      user.id,
      user.email,
      user.role as UserRole,
      familyId,
      metadata,
    );

    return {
      user: this.usersService.toResponseDto(user),
      tokens,
    };
  }

  /**
   * Creates a session with refresh token rotation family.
   */
  private async createSession(
    userId: string,
    email: string,
    role: UserRole,
    familyId: string,
    metadata?: { userAgent?: string; ipAddress?: string },
  ): Promise<AuthTokens> {
    const rawRefreshToken = generateSecureToken(48);
    const refreshTokenHash = hashToken(rawRefreshToken);

    const refreshTtlDays = 7;
    const expiresAt = new Date(
      Date.now() + refreshTtlDays * 24 * 60 * 60 * 1000,
    );

    const session = await this.prisma.refreshSession.create({
      data: {
        userId,
        tokenHash: refreshTokenHash,
        familyId,
        expiresAt,
        userAgent: metadata?.userAgent,
        ipAddress: metadata?.ipAddress,
      },
    });

    const accessSecret = this.configService.get<string>(
      'JWT_ACCESS_SECRET',
      'dev-insecure-access-secret-rsu-lecture-platform-key-32chars',
    );
    const accessExpiration = this.configService.get<string>(
      'JWT_ACCESS_EXPIRATION',
      '15m',
    );

    const accessToken = this.jwtService.sign(
      {
        sub: userId,
        email,
        role,
        sessionId: session.id,
      },
      {
        secret: accessSecret,
        expiresIn: accessExpiration as JwtSignOptions['expiresIn'],
      },
    );

    return {
      accessToken,
      refreshToken: rawRefreshToken,
      expiresIn: 15 * 60, // 15 mins
    };
  }

  /**
   * Rotates refresh tokens and detects token reuse attacks.
   */
  async refresh(
    rawRefreshToken: string,
    metadata?: { userAgent?: string; ipAddress?: string },
  ): Promise<AuthTokens> {
    if (!rawRefreshToken) {
      throw new UnauthorizedException('Refresh token is required');
    }

    const tokenHash = hashToken(rawRefreshToken);
    const session = await this.prisma.refreshSession.findUnique({
      where: { tokenHash },
      include: { user: true },
    });

    if (!session) {
      // Possible token reuse attack or invalid token
      throw new UnauthorizedException('Invalid or expired refresh token');
    }

    // DETECT REFRESH-TOKEN REUSE:
    // If the token was already revoked, someone is trying to reuse a consumed token!
    if (session.isRevoked) {
      this.logger.warn(
        `🚨 REFRESH TOKEN REUSE DETECTED! FamilyId: ${session.familyId}, UserId: ${session.userId}. Revoking family.`,
      );
      // Invalidate the entire session family for security
      await this.prisma.refreshSession.updateMany({
        where: { familyId: session.familyId },
        data: { isRevoked: true },
      });
      throw new UnauthorizedException(
        'Session compromise detected. All related sessions have been revoked.',
      );
    }

    // Check expiration
    if (session.expiresAt < new Date()) {
      await this.prisma.refreshSession.update({
        where: { id: session.id },
        data: { isRevoked: true },
      });
      throw new UnauthorizedException('Refresh token expired');
    }

    // Check user account eligibility
    if (
      session.user.accountStatus === $Enums.AccountStatus.SUSPENDED ||
      session.user.accountStatus === $Enums.AccountStatus.DEACTIVATED
    ) {
      throw new UnauthorizedException('Account is no longer active');
    }

    // Mark current token as revoked (rotated out)
    await this.prisma.refreshSession.update({
      where: { id: session.id },
      data: { isRevoked: true },
    });

    // Create next token in the SAME family
    return this.createSession(
      session.userId,
      session.user.email,
      session.user.role as UserRole,
      session.familyId,
      metadata,
    );
  }

  /**
   * Revokes the session associated with the provided refresh token.
   */
  async logout(rawRefreshToken?: string): Promise<{ success: boolean }> {
    if (!rawRefreshToken) {
      return { success: true };
    }

    const tokenHash = hashToken(rawRefreshToken);
    await this.prisma.refreshSession.updateMany({
      where: { tokenHash },
      data: { isRevoked: true },
    });

    return { success: true };
  }

  /**
   * Revokes all active refresh sessions for a user.
   */
  async logoutAll(userId: string): Promise<{ revokedCount: number }> {
    const result = await this.prisma.refreshSession.updateMany({
      where: { userId, isRevoked: false },
      data: { isRevoked: true },
    });

    return { revokedCount: result.count };
  }

  /**
   * Verifies email using a secure one-time token.
   */
  async verifyEmail(
    dto: VerifyEmailDto,
  ): Promise<{ message: string; verified: boolean }> {
    const tokenHash = hashToken(dto.token);

    const tokenRecord = await this.prisma.emailVerificationToken.findUnique({
      where: { tokenHash },
      include: { user: true },
    });

    if (!tokenRecord) {
      throw new BadRequestException('Invalid or expired verification token');
    }

    if (tokenRecord.isUsed) {
      throw new BadRequestException(
        'This verification token has already been used',
      );
    }

    if (tokenRecord.expiresAt < new Date()) {
      throw new BadRequestException('Verification token has expired');
    }

    // Atomic transaction: mark token used and update user status
    await this.prisma.$transaction([
      this.prisma.emailVerificationToken.update({
        where: { id: tokenRecord.id },
        data: { isUsed: true },
      }),
      this.prisma.user.update({
        where: { id: tokenRecord.userId },
        data: {
          emailVerifiedAt: new Date(),
          accountStatus:
            tokenRecord.user.accountStatus ===
            $Enums.AccountStatus.PENDING_VERIFICATION
              ? $Enums.AccountStatus.ACTIVE
              : tokenRecord.user.accountStatus,
        },
      }),
    ]);

    return { message: 'Email successfully verified', verified: true };
  }

  /**
   * Resends email verification with rate-limiting / cooldown enforcement.
   */
  async resendVerification(
    dto: ResendVerificationDto,
  ): Promise<{ message: string }> {
    const user = await this.usersService.findByEmail(dto.email);

    // If user doesn't exist, return success message to prevent enumeration
    if (!user) {
      return {
        message:
          'If this email is registered and unverified, a verification link has been sent.',
      };
    }

    if (user.emailVerifiedAt) {
      return { message: 'This email is already verified.' };
    }

    // Enforce rate limiting: check recent tokens
    const cooldownSeconds = Number(
      this.configService.get('EMAIL_RESEND_COOLDOWN_SECONDS', 60),
    );
    const recentToken = await this.prisma.emailVerificationToken.findFirst({
      where: {
        userId: user.id,
        createdAt: {
          gte: new Date(Date.now() - cooldownSeconds * 1000),
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    if (recentToken) {
      throw new BadRequestException(
        `Please wait ${cooldownSeconds} seconds before requesting another verification email.`,
      );
    }

    // Invalidate existing unused tokens
    await this.prisma.emailVerificationToken.updateMany({
      where: { userId: user.id, isUsed: false },
      data: { isUsed: true },
    });

    // Create fresh token
    const rawToken = generateSecureToken(32);
    const tokenHash = hashToken(rawToken);
    const ttlHours = Number(
      this.configService.get('EMAIL_VERIFICATION_TOKEN_TTL_HOURS', 24),
    );
    const expiresAt = new Date(Date.now() + ttlHours * 60 * 60 * 1000);

    await this.prisma.emailVerificationToken.create({
      data: {
        userId: user.id,
        tokenHash,
        expiresAt,
      },
    });

    await this.mailService.sendVerificationEmail(
      user.email,
      rawToken,
      user.displayName,
    );

    return {
      message:
        'If this email is registered and unverified, a verification link has been sent.',
    };
  }

  /**
   * Forgot password: generates a single-use token without revealing user existence.
   */
  async forgotPassword(dto: ForgotPasswordDto): Promise<{ message: string }> {
    const genericResponse = {
      message:
        'If the provided email is associated with an account, password reset instructions have been sent.',
    };

    const user = await this.usersService.findByEmail(dto.email);
    if (!user) {
      return genericResponse;
    }

    // Invalidate previously issued active reset tokens
    await this.prisma.passwordResetToken.updateMany({
      where: { userId: user.id, isUsed: false },
      data: { isUsed: true },
    });

    const rawToken = generateSecureToken(32);
    const tokenHash = hashToken(rawToken);
    const ttlMinutes = Number(
      this.configService.get('PASSWORD_RESET_TOKEN_TTL_MINUTES', 60),
    );
    const expiresAt = new Date(Date.now() + ttlMinutes * 60 * 1000);

    await this.prisma.passwordResetToken.create({
      data: {
        userId: user.id,
        tokenHash,
        expiresAt,
      },
    });

    await this.mailService.sendPasswordResetEmail(
      user.email,
      rawToken,
      user.displayName,
    );

    return genericResponse;
  }

  /**
   * Reset password: validates token, updates password with Argon2id, and revokes all active sessions.
   */
  async resetPassword(dto: ResetPasswordDto): Promise<{ message: string }> {
    const tokenHash = hashToken(dto.token);

    const resetToken = await this.prisma.passwordResetToken.findUnique({
      where: { tokenHash },
      include: { user: true },
    });

    if (!resetToken) {
      throw new BadRequestException('Invalid or expired reset token');
    }

    if (resetToken.isUsed) {
      throw new BadRequestException('This reset token has already been used');
    }

    if (resetToken.expiresAt < new Date()) {
      throw new BadRequestException('Reset token has expired');
    }

    const newPasswordHash = await this.hashPassword(dto.newPassword);

    // Transaction: update password, mark token used, and revoke all user sessions
    await this.prisma.$transaction([
      this.prisma.passwordResetToken.update({
        where: { id: resetToken.id },
        data: { isUsed: true },
      }),
      this.prisma.user.update({
        where: { id: resetToken.userId },
        data: { passwordHash: newPasswordHash },
      }),
      this.prisma.refreshSession.updateMany({
        where: { userId: resetToken.userId, isRevoked: false },
        data: { isRevoked: true },
      }),
    ]);

    return {
      message:
        'Password has been successfully reset. Please log in with your new password.',
    };
  }

  /**
   * Returns current user's safe profile.
   */
  async getCurrentUserProfile(
    currentUser: AuthenticatedUser,
  ): Promise<UserResponseDto> {
    const user = await this.usersService.findById(currentUser.id);
    if (!user) {
      throw new UnauthorizedException('User account no longer exists');
    }
    return this.usersService.toResponseDto(user);
  }
}
