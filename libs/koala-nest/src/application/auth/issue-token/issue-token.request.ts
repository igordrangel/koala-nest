import { AuthProfile } from '@/core/auth/auth-profile.enum';
import { ObjectClass } from '@/core/base/object-class';
import { ApiPropertyEnum } from '@/host/decorators/api-property-enum.decorator';
import { ApiProperty } from '@nestjs/swagger';

export class IssueTokenRequest extends ObjectClass<IssueTokenRequest> {
  @ApiProperty({ example: 'f47ac10b-58cc-4372-a567-0e02b2c3d479' })
  sub: string;

  @ApiPropertyEnum({ enum: AuthProfile, required: false })
  profile?: AuthProfile;

  @ApiProperty({ example: 'john.doe', required: false })
  login?: string;

  @ApiProperty({ example: 'john.doe@example.com', required: false })
  email?: string;
}
