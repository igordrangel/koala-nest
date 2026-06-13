import { ApiProperty } from '@nestjs/swagger';

export class AuthTokenResponse {
  @ApiProperty()
  accessToken: string;

  @ApiProperty({ name: 'access_token' })
  access_token: string;

  @ApiProperty()
  refreshToken: string;

  @ApiProperty({ name: 'refresh_token' })
  refresh_token: string;
}
