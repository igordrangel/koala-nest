import { INestApplication } from '@nestjs/common'

export function instanciateClassWithDependenciesInjection(
  app: INestApplication,
  Target: any,
) {
  const dependencies = Reflect.getMetadata('design:paramtypes', Target)
  const injections = dependencies.map((dependency: any) => {
    return app.get(dependency)
  })
  return new Target(...injections)
}
