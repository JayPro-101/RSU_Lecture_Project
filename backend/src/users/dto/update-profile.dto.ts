import { IsOptional, IsString, Length } from 'class-validator';

export class UpdateProfileDto {
  @IsOptional()
  @IsString()
  @Length(2, 60, { message: 'Display name must be between 2 and 60 characters' })
  displayName?: string;
}
