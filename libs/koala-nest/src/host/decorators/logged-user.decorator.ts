import { LoggedUserInfoDto } from '@/domain/dtos/logged-user-info.dto';
import { AuthenticatedUser } from '@/core/auth/jwt-claims';
import {
  createParamDecorator,
  ExecutionContext,
  UnauthorizedException,
} from '@nestjs/common';

export const LoggedUser = createParamDecorator(
  (_data: unknown, context: ExecutionContext): LoggedUserInfoDto => {
    const user = context
      .switchToHttp()
      .getRequest<{ user?: AuthenticatedUser }>().user;

    if (!user) {
      throw new UnauthorizedException(
        'Não foi possível recuperar suas credenciais de acesso. Gentileza reautenticar.',
      );
    }

    return LoggedUserInfoDto.fromAuthenticatedUser(user);
  },
);
