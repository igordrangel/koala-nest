import { RequestValidatorBase } from '@/application/common/request-validator.base';
import z from 'zod';
import { OAuthExchangeCodeRequest } from './exchange-code.request';

export class OAuthExchangeCodeValidator extends RequestValidatorBase<OAuthExchangeCodeRequest> {
  protected get schema() {
    return z.object({
      provider: z.string().min(1),
      code: z.string().min(1),
      state: z.string().min(1),
      redirectUri: z.string().url().optional(),
    });
  }
}
