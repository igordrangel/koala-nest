---
title: Estrutura do projeto
slug: estrutura-do-projeto
category: inicio
order: 2
description: Bootstrap da aplicação, módulos principais e ponto de entrada.
---

# Estrutura do projeto

Este guia descreve como a aplicação NestJS é inicializada e como os módulos se conectam.

## Ponto de entrada

O arquivo `src/host/main.ts` configura CORS, documentação OpenAPI, filtro global de erros e inicia o servidor:

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

```bash
bun run start:dev          # servidor em modo watch
bun run migration:generate # gera migration a partir das entidades
bun run migration:run      # aplica migrations pendentes
bun run migration:revert   # reverte a última migration
```
