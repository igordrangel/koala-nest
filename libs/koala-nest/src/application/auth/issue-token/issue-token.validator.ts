import { RequestValidatorBase } from '@/application/common/request-validator.base';
import { AuthProfile } from '@/core/auth/auth-profile.enum';
import { z } from 'zod';
import { IssueTokenRequest } from './issue-token.request';

export class IssueTokenValidator extends RequestValidatorBase<IssueTokenRequest> {
  protected get schema() {
    return z.object({
      sub: z.string().min(1),
      profile: z.nativeEnum(AuthProfile).optional(),
      login: z.string().optional(),
      email: z.string().email().optional(),
    });
  }
}
