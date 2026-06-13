/// <reference types="bun-types/test-globals" />

import { createAuthE2ETestApp } from '@/test/create-auth-e2e-test-app';
import { AUTH_ROUTER_CONFIG } from '@/host/controllers/auth/router.config';
import { PERSON_ROUTER_CONFIG } from '@/host/controllers/person/router.config';
import type { INestApplication } from '@nestjs/common';
import request from 'supertest';

describe('Auth (E2E)', () => {
  let app: INestApplication;
  let accessToken: string;
  let refreshToken: string;

  beforeAll(async () => {
    app = await createAuthE2ETestApp();
  });

  afterAll(async () => {
    await app.close();
  });

  it('emite par de tokens em rota pública', async () => {
    const response = await request(app.getHttpServer())
      .post(`${AUTH_ROUTER_CONFIG.group}/token`)
      .send({ sub: 'user-e2e', profile: 'admin' });

    expect(response.statusCode).toBe(201);
    expect(response.body.accessToken).toEqual(expect.any(String));
    expect(response.body.refreshToken).toEqual(expect.any(String));

    accessToken = response.body.accessToken;
    refreshToken = response.body.refreshToken;
  });

  it('renova tokens via refresh token no header Authorization', async () => {
    const response = await request(app.getHttpServer())
      .post(`${AUTH_ROUTER_CONFIG.group}/refresh`)
      .set('Authorization', `Bearer ${refreshToken}`);

    expect(response.statusCode).toBe(200);
    expect(response.body.accessToken).toEqual(expect.any(String));
    expect(response.body.refreshToken).toEqual(expect.any(String));
    expect(response.body.accessToken).not.toBe(accessToken);

    accessToken = response.body.accessToken;
  });

  it('renova tokens via cookie refreshToken em /auth/refresh', async () => {
    const response = await request(app.getHttpServer())
      .post(`${AUTH_ROUTER_CONFIG.group}/refresh`)
      .set('Cookie', [`refreshToken=${refreshToken}`]);

    expect(response.statusCode).toBe(200);
    expect(response.body.accessToken).toEqual(expect.any(String));
    expect(response.body.refreshToken).toEqual(expect.any(String));
  });

  it('bloqueia rota protegida sem token', async () => {
    const response = await request(app.getHttpServer()).get(
      PERSON_ROUTER_CONFIG.group,
    );

    expect(response.statusCode).toBe(401);
  });

  it('permite rota protegida com token válido', async () => {
    const response = await request(app.getHttpServer())
      .get(PERSON_ROUTER_CONFIG.group)
      .set('Authorization', `Bearer ${accessToken}`);

    expect(response.statusCode).toBe(200);
    expect(response.body).toEqual({
      items: expect.any(Array),
      count: expect.any(Number),
    });
  });
});
