import { AuthGuard } from '@/host/security/guards/auth.guard';
import { ProfilesGuard } from '@/host/security/guards/profiles.guard';
import { AppAuthTestModule } from '@/test/app-auth-test.module';
import { initTestApp, setupTestApp } from '@/test/utils/configure-test-app';
import { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';

export async function createAuthE2ETestApp(): Promise<INestApplication> {
  const moduleRef = await Test.createTestingModule({
    imports: [AppAuthTestModule],
  }).compile();

  const app = moduleRef.createNestApplication();
  setupTestApp(app);

  app.useGlobalGuards(
    await app.resolve(AuthGuard),
    await app.resolve(ProfilesGuard),
  );

  return initTestApp(app);
}
