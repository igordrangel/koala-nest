import { ObjectClass } from '@/core/base/object-class';
import { ApiProperty } from '@nestjs/swagger';

export class IssueTokenRequest extends ObjectClass<IssueTokenRequest> {
  @ApiProperty({ example: 'f47ac10b-58cc-4372-a567-0e02b2c3d479' })
  sub: string;

  @ApiProperty({ example: 'user', required: false })
  profile?: string;

  @ApiProperty({ example: 'john.doe', required: false })
  login?: string;

  @ApiProperty({ example: 'john.doe@example.com', required: false })
  email?: string;
}
