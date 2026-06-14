/// <reference types="bun-types/test-globals" />

import { createE2ETestApp } from '@/test/create-e2e-test-app';
import type { INestApplication } from '@nestjs/common';

/**
 * Estrutura mínima de E2E — use como ponto de partida no template Padrão.
 * No exemplo CRUD, veja `person.controller.e2e.spec.ts` e `auth.controller.e2e.spec.ts`.
 */
describe('App (E2E)', () => {
  let app: INestApplication;

  beforeAll(async () => {
    app = await createE2ETestApp();
  });

  afterAll(async () => {
    await app.close();
  });

  it('should bootstrap the application', () => {
    expect(app.getHttpServer()).toBeDefined();
  });
});
