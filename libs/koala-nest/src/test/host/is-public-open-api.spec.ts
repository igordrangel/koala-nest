import { describe, expect, it } from 'bun:test';
import {
  applyAuthSecurityToProtectedRoutes,
  IsPublic,
  syncIsPublicRoutesInOpenApi,
} from '@/host/decorators/is-public.decorator';
import { Controller, Get, Module } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { Test } from '@nestjs/testing';

@Controller('auth')
class AuthController {
  @Get('login')
  @IsPublic()
  login() {
    return {};
  }

  @Get('profile')
  profile() {
    return {};
  }
}

@Module({ controllers: [AuthController] })
class AuthModule {}

describe('IsPublic OpenAPI', () => {
  it('protege todas as rotas e libera só as marcadas com @IsPublic', async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [AuthModule],
    }).compile();
    const app = moduleRef.createNestApplication();
    await app.init();

    const schemeNames = ['JWT', 'Google'];

    const document = SwaggerModule.createDocument(
      app,
      new DocumentBuilder()
        .addBearerAuth({ type: 'oauth2' } as never, 'JWT')
        .addSecurityRequirements('JWT')
        .addBearerAuth({ type: 'oauth2' } as never, 'Google')
        .addSecurityRequirements('Google')
        .build(),
    );

    syncIsPublicRoutesInOpenApi(document);
    applyAuthSecurityToProtectedRoutes(document, schemeNames);

    expect(document.paths?.['/auth/login']?.get?.security).toEqual([]);
    expect(document.paths?.['/auth/profile']?.get?.security).toEqual([
      { JWT: [] },
      { Google: [] },
    ]);
    expect(document.security).toEqual([{ JWT: [] }, { Google: [] }]);

    await app.close();
  });
});
