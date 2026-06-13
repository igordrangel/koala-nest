import { AuthProfile } from '@/core/auth/auth-profile.enum';
import { ApiPropertyEnum } from '@/host/decorators/api-property-enum.decorator';
import { ApiProperty } from '@nestjs/swagger';

export class UserInfoResponse {
  @ApiProperty()
  id: string;

  @ApiProperty()
  name: string;

  @ApiProperty()
  email: string;

  @ApiProperty()
  login: string;

  @ApiPropertyEnum({ enum: AuthProfile })
  profile: AuthProfile;
}
