import { ApiProperty } from '@nestjs/swagger';

export class IssueTokenResponse {
  @ApiProperty()
  accessToken: string;

  @ApiProperty()
  refreshToken: string;
}
