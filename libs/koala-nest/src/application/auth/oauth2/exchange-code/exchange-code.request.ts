import { ObjectClass } from '@/core/base/object-class';
import { ApiProperty } from '@nestjs/swagger';

export class OAuthExchangeCodeRequest extends ObjectClass<OAuthExchangeCodeRequest> {
  @ApiProperty({ example: 'google' })
  provider: string;

  @ApiProperty()
  code: string;

  @ApiProperty({ required: false })
  redirectUri?: string;
}
