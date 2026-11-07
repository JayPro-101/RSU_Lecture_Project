import {
  Controller,
  Get,
  Patch,
  Body,
  Param,
  UseGuards,
  ForbiddenException,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { UserResponseDto } from './dto/user-response.dto';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { UpdateAccountStatusDto } from './dto/update-account-status.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import type { AuthenticatedUser } from '../common/decorators/current-user.decorator';
import { UserRole } from '../common/enums/roles.enum';
import { ApiResponseDto } from '../common/dto/api-response.dto';

@Controller('users')
@UseGuards(JwtAuthGuard, RolesGuard)
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get('me')
  async getProfile(
    @CurrentUser() currentUser: AuthenticatedUser,
  ): Promise<ApiResponseDto<UserResponseDto>> {
    const user = await this.usersService.findById(currentUser.id);
    if (!user) {
      throw new ForbiddenException('User record no longer exists');
    }
    const profile = this.usersService.toResponseDto(user);
    return ApiResponseDto.success('User profile retrieved', profile);
  }

  @Patch('me')
  async updateProfile(
    @CurrentUser('id') userId: string,
    @Body() dto: UpdateProfileDto,
  ): Promise<ApiResponseDto<UserResponseDto>> {
    const updated = await this.usersService.updateProfile(userId, dto);
    return ApiResponseDto.success('Profile updated successfully', updated);
  }

  @Get(':id')
  @Roles(UserRole.PLATFORM_ADMIN, UserRole.STUDENT_MODERATOR)
  async getUserById(
    @Param('id') id: string,
  ): Promise<ApiResponseDto<UserResponseDto>> {
    const user = await this.usersService.findById(id);
    if (!user) {
      throw new ForbiddenException('User not found');
    }
    const profile = this.usersService.toResponseDto(user);
    return ApiResponseDto.success('User details retrieved', profile);
  }

  @Patch(':id/status')
  @Roles(UserRole.PLATFORM_ADMIN)
  async updateStatus(
    @Param('id') id: string,
    @Body() dto: UpdateAccountStatusDto,
  ): Promise<ApiResponseDto<UserResponseDto>> {
    const updated = await this.usersService.updateAccountStatus(id, dto.status);
    return ApiResponseDto.success(
      'User account status updated successfully',
      updated,
    );
  }
}
