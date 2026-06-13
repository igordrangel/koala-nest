import { Env } from '@/core/env';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class EnvService {
  constructor(private readonly configService: ConfigService<Env, true>) {}

  get<T extends keyof Env>(key: T) {
    return this.configService.get(key, { infer: true });
  }

  /** Variáveis dinâmicas fora do schema Zod (ex.: OAUTH2_{PROVIDER}_*). */
  getDynamic(key: string): string | undefined {
    return process.env[key];
  }
}
