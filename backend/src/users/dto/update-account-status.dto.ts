import { IsEnum, IsNotEmpty } from 'class-validator';
import { AccountStatus } from '../../common/enums/roles.enum';

export class UpdateAccountStatusDto {
  @IsNotEmpty()
  @IsEnum(AccountStatus, {
    message: `accountStatus must be one of: ${Object.values(AccountStatus).join(', ')}`,
  })
  status: AccountStatus;
}
