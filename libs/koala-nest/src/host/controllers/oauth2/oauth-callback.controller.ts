import { OAuthCallbackResponse } from '@/application/auth/oauth2/callback/oauth-callback.response';
import { ApiExcludeEndpointDiffDevelop } from '@/host/decorators/api-exclude-endpoint-diff-develop.decorator';
import { IsPublic } from '@/host/decorators/is-public.decorator';
import { Controller, Get, HttpCode, HttpStatus, Query } from '@nestjs/common';
import { ApiExcludeEndpoint, ApiOkResponse, ApiTags } from '@nestjs/swagger';

@Controller()
@ApiTags('OAuth2')
export class OAuthCallbackController {
  @Get('sso/callback')
  @IsPublic()
  @HttpCode(HttpStatus.OK)
  @ApiExcludeEndpointDiffDevelop()
  @ApiOkResponse({ type: OAuthCallbackResponse })
  handle(@Query() query: OAuthCallbackResponse): OAuthCallbackResponse {
    return query;
  }

  /** Alias legado — não documentado (Scalar usa `/sso/callback`). */
  @Get('oauth2/callback')
  @IsPublic()
  @HttpCode(HttpStatus.OK)
  @ApiExcludeEndpoint()
  @ApiOkResponse({ type: OAuthCallbackResponse })
  handleLegacy(@Query() query: OAuthCallbackResponse): OAuthCallbackResponse {
    return query;
  }
}
