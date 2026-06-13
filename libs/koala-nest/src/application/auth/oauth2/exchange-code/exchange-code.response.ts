import { AuthProfile } from '@/core/auth/auth-profile.enum';
import { ApiProperty } from '@nestjs/swagger';

export class OAuthExchangeCodeResponse {
  @ApiProperty()
  login: string;

  @ApiProperty()
  email: string;

  @ApiProperty({ required: false })
  name?: string;

  @ApiProperty({ enum: AuthProfile, required: false })
  profile?: AuthProfile;
}
