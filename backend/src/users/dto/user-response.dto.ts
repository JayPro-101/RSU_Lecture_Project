import { Exclude, Expose } from 'class-transformer';
import { UserRole, AccountStatus } from '../../common/enums/roles.enum';

export class UserResponseDto {
  @Expose()
  id: string;

  @Expose()
  email: string;

  @Expose()
  displayName: string;

  @Expose()
  role: UserRole;

  @Expose()
  accountStatus: AccountStatus;

  @Expose()
  emailVerifiedAt: Date | null;

  @Expose()
  createdAt: Date;

  @Expose()
  updatedAt: Date;

  @Exclude()
  passwordHash: string;

  constructor(partial: Partial<UserResponseDto>) {
    Object.assign(this, partial);
  }
}
