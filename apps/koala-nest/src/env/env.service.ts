import { Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { Env } from './env'

@Injectable()
export class EnvService<TEnv extends Env = Env> {
  constructor(private readonly configService: ConfigService<TEnv, true>) {}

  get<T extends keyof TEnv>(key: T) {
    return this.configService.get(key as any, { infer: true })
  }
}
