import { ApiProperty } from '@nestjs/swagger';

export class OAuthExchangeCodeResponse {
  @ApiProperty()
  login: string;

  @ApiProperty()
  email: string;

  @ApiProperty({ required: false })
  name?: string;

  @ApiProperty({ required: false })
  profile?: string;
}
