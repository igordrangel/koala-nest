# Integração com Prisma

## Visão Geral

A biblioteca `@koalarx/nest` foi projetada para funcionar de forma **totalmente automática e transparente** com o Prisma Client do seu projeto. Não é necessária nenhuma configuração adicional além da geração padrão do cliente Prisma.

## Configuração Automática

### Pré-requisitos

1. Você deve ter um esquema Prisma configurado (`prisma/schema.prisma`)
2. O cliente Prisma deve ser gerado:

```bash
bunx prisma generate
```

### Como Funciona

A biblioteca **resolve automaticamente** o `PrismaClient` do seu projeto através de um sistema inteligente de busca:

#### 1. Busca Automática de Caminhos

O `PrismaService` procura o cliente Prisma em múltiplos locais padrão:

- `prisma/generated/client.js` (ou `.ts`)
- `prisma/generated/index.js` (ou `.ts`)
- Diretórios relativos ao `process.cwd()`
- Diretórios relativos ao arquivo principal da aplicação

#### 2. Suporte Transparente

Uma vez encontrado, o cliente é carregado **dinamicamente** e exposto através de um `Proxy` transparente que:

- Permite acesso direto às models (ex: `prisma.person.findFirst()`)
- Preserva todos os métodos do PrismaClient (ex: `$queryRaw`, `$transaction`)
- Mantém compatibilidade total com transações

#### 3. Sem Configuração Necessária

✅ Não é necessário:
- Configurar path mappings
- Definir variáveis de ambiente de caminho
- Registrar o cliente manualmente

Tudo funciona **out-of-the-box**!

## Transações

### Usando withTransaction

```typescript
async executeTransaction() {
  return this.prisma.withTransaction(async (client) => {
    // client é um Prisma.TransactionClient
    await client.person.create({ data: {...} })
    await client.address.create({ data: {...} })
  })
}
```

### Em Repositórios

O `RepositoryBase` fornece suporte built-in para transações:

```typescript
async saveMultiple(entities: Person[]) {
  return this.withTransaction(async (client) => {
    for (const entity of entities) {
      await client.person.create({ data: this.entityToPrisma(entity) })
    }
  })
}
```

## Configuração Avançada

### Configurar Opções do PrismaClient (Opcional)

Se você precisar personalizar opções do PrismaClient (como adapters, logging, etc.):

```typescript
import { setPrismaClientOptions } from '@koalarx/nest'
import type { PrismaClientOptions } from 'prisma/generated/internal/prismaNamespace'

// Configure ANTES de inicializar a aplicação
setPrismaClientOptions({
  log: [{ emit: 'event', level: 'query' }],
  // outras opções...
} as PrismaClientOptions)

// Depois crie seu módulo
const app = await NestFactory.create(AppModule)
```

### Registrar Cliente Manualmente (Fallback)

Se por algum motivo a busca automática não encontrar o cliente, você pode registrá-lo manualmente:

```typescript
import { setPrismaClient } from '@koalarx/nest'
import { PrismaClient } from './path/to/prisma/generated/client'

// Registra manualmente como fallback
setPrismaClient(PrismaClient)
```

## Query Logging

### Ativar Logs de Queries

Configure a variável de ambiente:

```bash
PRISMA_QUERY_LOG=true
```

Ou no arquivo `.env`:

```env
PRISMA_QUERY_LOG=true
NODE_ENV=development
DATABASE_URL=postgresql://...
```

Quando ativado, todas as queries SQL executadas serão logadas no console:

```
SELECT "public"."person"."id", "public"."person"."name" FROM "public"."person" WHERE "public"."person"."id" = $1
```

## Resolução de Problemas

### Erro: "Cannot find module 'prisma/generated/client'"

**Causa**: O cliente Prisma não foi gerado.

**Solução**:
```bash
# 1. Verifique se tem schema.prisma
ls prisma/schema.prisma

# 2. Gere o cliente
bunx prisma generate

# 3. Confirme que a pasta foi criada
ls prisma/generated/
```

### Erro: "PrismaClient is not a constructor"

**Causa**: O módulo Prisma foi importado antes do NestJS inicializar.

**Solução**: Certifique-se de que `PrismaService` é injetado via NestJS dependency injection, não importado diretamente:

```typescript
// ❌ ERRADO
import { PrismaService } from '@koalarx/nest'
const prisma = new PrismaService()

// ✅ CORRETO
@Injectable()
export class MyService {
  constructor(private prisma: PrismaService) {}
}
```

### Erro: "PrismaService não está registrado"

**Causa**: O módulo `KoalaNestModule` não foi importado.

**Solução**: Importe o módulo principal:

```typescript
import { KoalaNestModule } from '@koalarx/nest'
import { Module } from '@nestjs/common'

@Module({
  imports: [
    KoalaNestModule.register({
      env: yourEnvSchema,
      // ...
    }),
  ],
})
export class AppModule {}
```

### Prisma Client não encontra a pasta gerada

Se a busca automática não encontrar seu cliente (por exemplo, em monorepos complexos):

1. Verifique o caminho exato onde o cliente foi gerado
2. Use `setPrismaClient()` com o caminho explícito
3. Ou configure `PRISMA_GENERATED_PATH` se a lib suportar

## Arquitetura Interna

### PrismaService e Proxy Transparente

`PrismaService` usa um `Proxy` JavaScript para fornecer acesso transparente:

```typescript
// Internamente
private prismaInstance: PrismaClient

// O Proxy permite:
this.prisma.person.findMany()        // ✅ Redireciona para prismaInstance
this.prisma.$transaction(fn)         // ✅ Preserva métodos especiais
this.prisma.withTransaction(fn)      // ✅ Métodos adicionados pela lib
```

### Busca de Resolução

O processo de descoberta (`prisma-resolver.ts`) funciona em etapas:

1. Tenta `process.cwd()` + `prisma/generated/client`
2. Tenta diretório do arquivo main
3. Tenta caminhos relativos diversos
4. Se nada funcionar, checa se foi registrado manualmente via `setPrismaClient()`

## Exemplo Completo

Veja a pasta `apps/example/` no repositório para um exemplo completo integrando:

- ✅ Prisma com schema definido
- ✅ Repositórios usando `RepositoryBase`
- ✅ Serviços injetando `PrismaService`
- ✅ Transações com `withTransaction`
- ✅ Query logging ativado

```bash
cd apps/example
bunx prisma generate
bun run start:debug
```
