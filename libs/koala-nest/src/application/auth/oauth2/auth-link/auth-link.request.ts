import { ObjectClass } from '@/core/base/object-class';
import { ApiProperty } from '@nestjs/swagger';

export class OAuthAuthLinkRequest extends ObjectClass<OAuthAuthLinkRequest> {
  @ApiProperty({ example: 'google' })
  provider: string;

  @ApiProperty({ required: false })
  redirectUri?: string;
}
