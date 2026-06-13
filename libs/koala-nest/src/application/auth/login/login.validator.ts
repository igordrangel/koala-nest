import { RequestValidatorBase } from '@/application/common/request-validator.base';
import { z } from 'zod';
import { LoginRequest } from './login.request';

export class LoginValidator extends RequestValidatorBase<LoginRequest> {
  protected get schema() {
    return z.object({
      username: z.string().email(),
      password: z.string().min(1),
    });
  }
}
