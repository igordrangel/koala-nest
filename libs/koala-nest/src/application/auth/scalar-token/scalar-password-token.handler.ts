import { IssueTokenHandler } from '@/application/auth/issue-token/issue-token.handler';
import { AuthProfile } from '@/core/auth/auth-profile.enum';
import { RequestHandlerBase } from '@/application/common/request-handler.base';
import { IssueTokenResponse } from '@/application/auth/issue-token/issue-token.response';
import { ScalarTokenBody } from '@/application/auth/scalar-token/scalar-token.types';
import { BadRequestException, Injectable } from '@nestjs/common';

@Injectable()
export class ScalarPasswordTokenHandler extends RequestHandlerBase<
  ScalarTokenBody,
  IssueTokenResponse
> {
  constructor(private readonly issueToken: IssueTokenHandler) {
    super();
  }

  handle(body: ScalarTokenBody): IssueTokenResponse {
    const sub = body.sub ?? body.username;

    if (!sub?.trim()) {
      throw new BadRequestException('Campo sub ou username é obrigatório');
    }

    const profileValue = body.profile ?? body.password;
    const profile =
      profileValue && profileValue in AuthProfile
        ? (profileValue as AuthProfile)
        : undefined;

    return this.issueToken.handle({
      sub: sub.trim(),
      profile,
      email: body.email,
      login: body.login,
    });
  }
}
