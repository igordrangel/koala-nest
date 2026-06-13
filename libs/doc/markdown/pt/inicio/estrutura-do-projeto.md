---
title: Estrutura do projeto
slug: estrutura-do-projeto
category: inicio
docKey: inicio/estrutura-do-projeto
order: 2
description: Bootstrap da aplicação, módulos principais e ponto de entrada.
---

# Estrutura do projeto

Este guia descreve como a aplicação NestJS é inicializada e como os módulos se conectam.

## Ponto de entrada

O arquivo `src/host/main.ts` configura CORS, documentação OpenAPI, filtro global de erros e inicia o servidor. O `nest-cli.json` aponta `entryFile` para `host/main`, e o script `start:prod` executa `node dist/host/main`.

```typescript
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { defineDocumentation } from './open-api/define-documentation';
import { ErrorsFilter } from './filters/errors.filter';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.enableCors({
    credentials: true,
    origin: true,
    optionsSuccessStatus: 200,
  });

  defineDocumentation(app);

  app.useGlobalFilters(new ErrorsFilter());

  await app.listen(process.env.PORT || 3000);

  console.log(`Server is running on port ${process.env.PORT || 3000}`);
  console.log(
    `Documentation is available at http://localhost:${process.env.PORT || 3000}/doc`,
  );
}

bootstrap();
```

## Módulo raiz

O `AppModule` importa a validação de ambiente e os módulos de feature. No template **Exemplo de CRUD**, o `PersonModule` já vem registrado; no template **Padrão**, você adiciona módulos conforme criar recursos.

```typescript
@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      validate: (config) => envSchema.parse(config),
    }),
    PersonModule,
  ],
})
export class AppModule {}
```

## Hierarquia de módulos

```
AppModule
└── PersonModule
    └── ControllerModule
        ├── MappingProvider (registra mapeamentos na inicialização)
        └── InfraModule
            └── RepositoryModule
                └── DatabaseModule (DataSource TypeORM)
```

O `MappingProvider` garante que todos os mapeamentos estejam registrados antes de qualquer handler executar:

```typescript
@Injectable()
export class MappingProvider {
  constructor() {
    PersonMapper.createMap();
  }
}
```

## Alias de importação

Projetos gerados usam o alias `@/` apontando para `src/`. Exemplo real de import:

```typescript
import { Person } from '@/domain/entities/person/person';
import { AutoMapper } from '@/core/tools/mapping';
import { IPersonRepository } from '@/domain/repositories/iperson.repository';
```

## Scripts úteis

**Bun**

```bash
bun run start:dev
bun run start:prod
bun run test
bun run test:watch
bun run migration:generate
bun run migration:run
bun run migration:revert
```

**npm / pnpm** — use `npm run` ou `pnpm run` nos mesmos nomes. O `kl-nest new` adiciona `bun` em `devDependencies` para testes locais. `migration:generate` usa `node --import ts-node/register/transpile-only`.
