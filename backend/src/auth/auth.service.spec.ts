import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { PrismaService } from '../prisma/prisma.service';
import { UsersService } from '../users/users.service';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { MailService } from '../mail/mail.service';
import { UserRole, AccountStatus } from '../common/enums/roles.enum';
import {
  UnauthorizedException,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import { hashToken } from '../common/utils/crypto.util';

describe('AuthService', () => {
  let authService: AuthService;
  let prismaService: any;
  let usersService: any;
  let jwtService: any;
  let configService: any;
  let mailService: any;

  beforeEach(async () => {
    prismaService = {
      user: {
        create: jest.fn(),
        update: jest.fn(),
      },
      emailVerificationToken: {
        create: jest.fn(),
        findUnique: jest.fn(),
        findFirst: jest.fn(),
        update: jest.fn(),
        updateMany: jest.fn(),
      },
      refreshSession: {
        create: jest.fn(),
        findUnique: jest.fn(),
        update: jest.fn(),
        updateMany: jest.fn(),
      },
      passwordResetToken: {
        create: jest.fn(),
        findUnique: jest.fn(),
        update: jest.fn(),
        updateMany: jest.fn(),
      },
      $transaction: jest.fn((promises) => Promise.all(promises)),
    };

    usersService = {
      findByEmail: jest.fn(),
      findById: jest.fn(),
      toResponseDto: jest.fn((u) => {
        const { passwordHash, ...safe } = u;
        return safe;
      }),
    };

    jwtService = {
      sign: jest.fn(() => 'mock-access-token'),
    };

    configService = {
      get: jest.fn((key: string, defaultVal: any) => defaultVal),
    };

    mailService = {
      sendVerificationEmail: jest.fn().mockResolvedValue(true),
      sendPasswordResetEmail: jest.fn().mockResolvedValue(true),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: PrismaService, useValue: prismaService },
        { provide: UsersService, useValue: usersService },
        { provide: JwtService, useValue: jwtService },
        { provide: ConfigService, useValue: configService },
        { provide: MailService, useValue: mailService },
      ],
    }).compile();

    authService = module.get<AuthService>(AuthService);
  });

  describe('Password Hashing with Argon2id', () => {
    it('should hash and verify passwords correctly using Argon2id', async () => {
      const password = 'StrongPassword123!';
      const hash = await authService.hashPassword(password);

      expect(hash).toContain('$argon2id$');
      const isValid = await authService.verifyPassword(hash, password);
      expect(isValid).toBe(true);

      const isInvalid = await authService.verifyPassword(
        hash,
        'WrongPassword!',
      );
      expect(isInvalid).toBe(false);
    });
  });

  describe('Registration', () => {
    it('should register a new user as STUDENT and send verification email', async () => {
      usersService.findByEmail.mockResolvedValue(null);
      prismaService.user.create.mockImplementation((args: any) => ({
        id: 'user-123',
        ...args.data,
      }));

      const result = await authService.register({
        email: 'Student@RSU.EDU.NG',
        displayName: 'John Doe',
        password: 'SecurePassword123!',
      });

      expect(usersService.findByEmail).toHaveBeenCalledWith(
        'student@rsu.edu.ng',
      );
      expect(prismaService.user.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            email: 'student@rsu.edu.ng',
            role: UserRole.STUDENT,
            accountStatus: AccountStatus.PENDING_VERIFICATION,
          }),
        }),
      );
      expect(prismaService.emailVerificationToken.create).toHaveBeenCalled();
      expect(mailService.sendVerificationEmail).toHaveBeenCalled();
      expect(result).not.toHaveProperty('passwordHash');
    });

    it('should throw ConflictException if user already exists', async () => {
      usersService.findByEmail.mockResolvedValue({ id: 'existing-id' });

      await expect(
        authService.register({
          email: 'exists@rsu.edu.ng',
          displayName: 'Jane Doe',
          password: 'SecurePassword123!',
        }),
      ).rejects.toThrow(ConflictException);
    });
  });

  describe('Login & Security Checks', () => {
    it('should throw UnauthorizedException if account is pending verification and unverified', async () => {
      const passwordHash = await authService.hashPassword('MySecret123!');
      usersService.findByEmail.mockResolvedValue({
        id: 'u-1',
        email: 'student@rsu.edu.ng',
        passwordHash,
        role: UserRole.STUDENT,
        accountStatus: AccountStatus.PENDING_VERIFICATION,
        emailVerifiedAt: null,
      });

      await expect(
        authService.login({
          email: 'student@rsu.edu.ng',
          password: 'MySecret123!',
        }),
      ).rejects.toThrow('Please verify your email address before logging in');
    });

    it('should throw UnauthorizedException if account is suspended', async () => {
      const passwordHash = await authService.hashPassword('MySecret123!');
      usersService.findByEmail.mockResolvedValue({
        id: 'u-1',
        email: 'suspended@rsu.edu.ng',
        passwordHash,
        role: UserRole.STUDENT,
        accountStatus: AccountStatus.SUSPENDED,
        emailVerifiedAt: new Date(),
      });

      await expect(
        authService.login({
          email: 'suspended@rsu.edu.ng',
          password: 'MySecret123!',
        }),
      ).rejects.toThrow('account has been suspended');
    });

    it('should login active verified user and return tokens', async () => {
      const passwordHash = await authService.hashPassword('ValidSecret123!');
      const mockUser = {
        id: 'u-1',
        email: 'active@rsu.edu.ng',
        displayName: 'Active User',
        passwordHash,
        role: UserRole.STUDENT,
        accountStatus: AccountStatus.ACTIVE,
        emailVerifiedAt: new Date(),
      };
      usersService.findByEmail.mockResolvedValue(mockUser);
      prismaService.refreshSession.create.mockResolvedValue({
        id: 'session-1',
      });

      const result = await authService.login({
        email: 'active@rsu.edu.ng',
        password: 'ValidSecret123!',
      });

      expect(result.tokens.accessToken).toBe('mock-access-token');
      expect(result.tokens.refreshToken).toBeDefined();
      expect(prismaService.refreshSession.create).toHaveBeenCalled();
    });
  });

  describe('Refresh Token Rotation & Reuse Detection', () => {
    it('should detect reuse of a revoked token and revoke entire family', async () => {
      const rawToken = 'revoked-token-123';
      const tokenHash = hashToken(rawToken);

      prismaService.refreshSession.findUnique.mockResolvedValue({
        id: 's-1',
        userId: 'u-1',
        familyId: 'family-xyz',
        isRevoked: true, // Already revoked!
        expiresAt: new Date(Date.now() + 100000),
        user: { id: 'u-1', accountStatus: AccountStatus.ACTIVE },
      });

      await expect(authService.refresh(rawToken)).rejects.toThrow(
        'Session compromise detected',
      );

      // Verify all sessions in that family were revoked
      expect(prismaService.refreshSession.updateMany).toHaveBeenCalledWith({
        where: { familyId: 'family-xyz' },
        data: { isRevoked: true },
      });
    });

    it('should rotate valid refresh token successfully', async () => {
      const rawToken = 'valid-token-123';
      const tokenHash = hashToken(rawToken);

      prismaService.refreshSession.findUnique.mockResolvedValue({
        id: 's-1',
        userId: 'u-1',
        familyId: 'family-xyz',
        isRevoked: false,
        expiresAt: new Date(Date.now() + 100000),
        user: {
          id: 'u-1',
          email: 'test@rsu.edu.ng',
          role: UserRole.STUDENT,
          accountStatus: AccountStatus.ACTIVE,
        },
      });

      prismaService.refreshSession.create.mockResolvedValue({ id: 's-2' });

      const result = await authService.refresh(rawToken);

      expect(prismaService.refreshSession.update).toHaveBeenCalledWith({
        where: { id: 's-1' },
        data: { isRevoked: true },
      });
      expect(result.accessToken).toBeDefined();
      expect(result.refreshToken).toBeDefined();
    });
  });

  describe('Email Verification', () => {
    it('should verify email and mark account active', async () => {
      const rawToken = 'token-123';
      const tokenHash = hashToken(rawToken);

      prismaService.emailVerificationToken.findUnique.mockResolvedValue({
        id: 'token-rec-1',
        userId: 'u-1',
        isUsed: false,
        expiresAt: new Date(Date.now() + 100000),
        user: {
          id: 'u-1',
          accountStatus: AccountStatus.PENDING_VERIFICATION,
        },
      });

      const res = await authService.verifyEmail({ token: rawToken });
      expect(res.verified).toBe(true);
      expect(prismaService.$transaction).toHaveBeenCalled();
    });

    it('should reject already used verification token', async () => {
      prismaService.emailVerificationToken.findUnique.mockResolvedValue({
        id: 'token-rec-1',
        userId: 'u-1',
        isUsed: true,
        expiresAt: new Date(Date.now() + 100000),
        user: { id: 'u-1' },
      });

      await expect(
        authService.verifyEmail({ token: 'used-token' }),
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe('Password Reset', () => {
    it('should reset password with Argon2id and revoke all active user sessions', async () => {
      const rawToken = 'reset-token-123';
      const tokenHash = hashToken(rawToken);

      prismaService.passwordResetToken.findUnique.mockResolvedValue({
        id: 'pr-1',
        userId: 'u-1',
        isUsed: false,
        expiresAt: new Date(Date.now() + 100000),
        user: { id: 'u-1' },
      });

      await authService.resetPassword({
        token: rawToken,
        newPassword: 'NewSecurePassword123!',
      });

      expect(prismaService.$transaction).toHaveBeenCalled();
      expect(prismaService.refreshSession.updateMany).toHaveBeenCalledWith({
        where: { userId: 'u-1', isRevoked: false },
        data: { isRevoked: true },
      });
    });
  });
});
