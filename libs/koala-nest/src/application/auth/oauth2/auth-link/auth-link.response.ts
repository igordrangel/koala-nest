import { ApiProperty } from '@nestjs/swagger';

export class OAuthAuthLinkResponse {
  @ApiProperty()
  url: string;
}
