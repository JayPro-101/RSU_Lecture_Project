import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { User } from '@prisma/client';
import { UserResponseDto } from './dto/user-response.dto';
import { plainToInstance } from 'class-transformer';
import { AccountStatus, UserRole } from '../common/enums/roles.enum';

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  toResponseDto(user: User): UserResponseDto {
    return plainToInstance(UserResponseDto, user, {
      excludeExtraneousValues: true,
    });
  }

  async findById(id: string): Promise<User | null> {
    return this.prisma.user.findUnique({
      where: { id },
    });
  }

  async findByEmail(email: string): Promise<User | null> {
    return this.prisma.user.findUnique({
      where: { email: email.toLowerCase().trim() },
    });
  }

  async createUser(data: {
    email: string;
    displayName: string;
    passwordHash: string;
    role?: UserRole;
    accountStatus?: AccountStatus;
  }): Promise<User> {
    const normalizedEmail = data.email.toLowerCase().trim();

    const existing = await this.findByEmail(normalizedEmail);
    if (existing) {
      throw new ConflictException(
        'A user with this email address already exists',
      );
    }

    return this.prisma.user.create({
      data: {
        email: normalizedEmail,
        displayName: data.displayName.trim(),
        passwordHash: data.passwordHash,
        role: data.role || UserRole.STUDENT,
        accountStatus: data.accountStatus || AccountStatus.PENDING_VERIFICATION,
      },
    });
  }

  async updateProfile(
    userId: string,
    data: { displayName?: string },
  ): Promise<UserResponseDto> {
    const user = await this.findById(userId);
    if (!user) {
      throw new NotFoundException('User not found');
    }

    const updated = await this.prisma.user.update({
      where: { id: userId },
      data: {
        ...(data.displayName ? { displayName: data.displayName.trim() } : {}),
      },
    });

    return this.toResponseDto(updated);
  }

  async updateAccountStatus(
    userId: string,
    status: AccountStatus,
  ): Promise<UserResponseDto> {
    const user = await this.findById(userId);
    if (!user) {
      throw new NotFoundException('User not found');
    }

    const updated = await this.prisma.user.update({
      where: { id: userId },
      data: {
        accountStatus: status,
      },
    });

    return this.toResponseDto(updated);
  }

  async markEmailAsVerified(userId: string): Promise<User> {
    return this.prisma.user.update({
      where: { id: userId },
      data: {
        emailVerifiedAt: new Date(),
        accountStatus: AccountStatus.ACTIVE,
      },
    });
  }

  async updatePassword(userId: string, newPasswordHash: string): Promise<User> {
    return this.prisma.user.update({
      where: { id: userId },
      data: {
        passwordHash: newPasswordHash,
      },
    });
  }
}
