import { Type } from '@nestjs/common'

interface KoalaAppTestDependenciesConfig {
  dependencies: any[]
}

export class KoalaAppTestDependencies {
  constructor(private readonly _config: KoalaAppTestDependenciesConfig) {}

  get<T>(objectType: Type<T>): T {
    return this._config.dependencies.find(
      (dependency) => dependency instanceof objectType,
    )
  }
}
