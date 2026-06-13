import { RequestValidatorBase } from '@/application/common/request-validator.base';
import { z } from 'zod';
import { OAuthAuthLinkRequest } from './auth-link.request';

export class OAuthAuthLinkValidator extends RequestValidatorBase<OAuthAuthLinkRequest> {
  protected get schema() {
    return z.object({
      provider: z.string().min(1),
      redirectUri: z.string().url().optional(),
    });
  }
}
