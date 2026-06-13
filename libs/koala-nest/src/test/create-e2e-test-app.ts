import { AppTestModule } from '@/test/app-test.module';
import { initTestApp, setupTestApp } from '@/test/utils/configure-test-app';
import { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';

export async function createE2ETestApp(): Promise<INestApplication> {
  const moduleRef = await Test.createTestingModule({
    imports: [AppTestModule],
  }).compile();

  const app = moduleRef.createNestApplication();
  setupTestApp(app);
  return initTestApp(app);
}
