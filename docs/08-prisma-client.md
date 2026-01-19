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

### Acessar Tipos do DBContext em Repositórios

Ao estender `RepositoryBase`, você pode acessar o `DBContext` (que pode ser `PrismaClient` ou `DbTransactionContext` em transações) de duas formas:

#### Via Construtor com Configuração

Passe o DBContext e uma string indicando qual model Prisma usar. Para ter type safety completo com os tipos do DBContext, use 3 type parameters:

```typescript
import { RepositoryBase } from '@koalarx/nest/core/database/repository.base'
import { Person } from '@/domain/entities/person/person'
import { IPersonRepository } from '@/domain/repositories/iperson.repository'
import { DbTransactionContext } from '../db-transaction-context'
import { PRISMA_TOKEN } from '@koalarx/nest/core/koala-nest-database.module'
import { Inject, Injectable } from '@nestjs/common'

@Injectable()
export class PersonRepository
  extends RepositoryBase<Person, DbTransactionContext, 'person'>
  implements IPersonRepository
{
  constructor(
    @Inject(PRISMA_TOKEN)
    prisma: DbTransactionContext,
  ) {
    super({
      modelName: Person,           // Seu modelo/entidade
      context: prisma,             // DBContext injetado
      include: {                   // Includes opcionais
        phones: true,
        address: true,
      },
    })
  }

  // Seus métodos de repositório
}
```

**Type Parameters do RepositoryBase**:
- `Person` - Tipo da entidade
- `DbTransactionContext` - Tipo do DBContext (PrismaClient ou DbTransactionContext)
- `'person'` - String literal do model Prisma (deve corresponder ao nome da tabela/model)

#### Acessar o Contexto dentro de Métodos

Use `this.context()` para acessar o DBContext dentro de qualquer método. Com os 3 type parameters, você terá type safety completo:

```typescript
@Injectable()
export class PersonRepository
  extends RepositoryBase<Person, DbTransactionContext, 'person'>
  implements IPersonRepository
{
  constructor(
    @Inject(PRISMA_TOKEN)
    prisma: DbTransactionContext,
  ) {
    super({
      modelName: Person,
      context: prisma,
      include: { phones: true, address: true },
    })
  }

  async findByNameWithDetails(name: string): Promise<Person | null> {
    // this.context() retorna DbTransactionContext com type safety
    // Intellisense mostrará: person, personPhone, personAddress
    const person = await this.context().person.findFirst({
      where: { name },
      include: { phones: true, address: true },
    })

    return person ? this.mapToDomain(person) : null
  }

  async complexOperation(): Promise<void> {
    // Dentro de transações, this.context() retorna o client transacional
    // Os tipos são preservados automáticamente
    const result = await this.context().personPhone.createMany({
      data: [
        { personId: 1, phone: '123456' },
        { personId: 1, phone: '789012' },
      ],
    })
  }
}
```

**Comportamento Automático com Type Safety**:
- **Fora de transações**: `this.context()` retorna `DbTransactionContext` com acesso tipado aos models
- **Dentro de transações**: `this.context()` retorna o cliente transacional preservando os tipos
- **Intellisense**: Com os 3 type parameters, o IDE autocompleta todos os models disponíveis

Isso garante que suas queries sempre executem no contexto correto com segurança de tipos.

### Método `remove()` com Orphan Removal

O método `remove()` herdado de `RepositoryBase` possui internamente uma função de `orphanRemoval` que remove automaticamente todas as entidades associadas (relacionamentos) quando a entidade principal é deletada.

```typescript
// Exemplo: Deletar uma Pessoa
await this.repository.delete(personId)

// Internamente, o RepositoryBase.remove() executará:
// 1. Remove PersonPhones associados (orphanRemoval)
// 2. Remove PersonAddress associado (orphanRemoval)
// 3. Remove Person
```

**Para evitar deletar entidades associadas**, passe um array de relacionamentos que devem ser **preservados** como segundo parâmetro:

```typescript
@Injectable()
export class PersonRepository
  extends RepositoryBase<Person, DbTransactionContext, 'person'>
  implements IPersonRepository
{
  // ... constructor ...

  delete(id: number): Promise<void> {
    // 'address' não será deletado, apenas desvínculado
    return this.remove<Prisma.PersonWhereUniqueInput>(
      { id },
      ['address']  // Preservar relacionamento
    )
  }
}
```

**Sintaxe completa do método `remove()`**:
```typescript
protected remove<TWhere = any>(
  where: TWhere,
  notCascadeEntityProps?: Array<keyof TEntity>,  // Relacionamentos a preservar
  externalServices?: Promise<any>                // Promises dentro da transação
): Promise<void>
```

**Exemplos práticos**:

```typescript
// ❌ Deleta tudo (Person, Phones, Address)
await this.remove({ id: 1 })

// ✅ Deleta Person e Phones, mas preserva Address
await this.remove({ id: 1 }, ['address'])

// ✅ Deleta Person, mas preserva Phones e Address
await this.remove({ id: 1 }, ['phones', 'address'])

// ✅ Deleta Person e Address, mas preserva Phones
await this.remove({ id: 1 }, ['phones'])
```

### Método `removeMany()` com Orphan Removal

Similar ao `remove()`, mas deleta múltiplas entidades em uma única operação transacional.

```typescript
@Injectable()
export class PersonRepository
  extends RepositoryBase<Person, DbTransactionContext, 'person'>
  implements IPersonRepository
{
  // ... constructor ...

  async deleteInactive(): Promise<void> {
    // Deleta múltiplas pessoas inativas
    return this.removeMany<Prisma.PersonWhereInput>(
      { active: false },
      ['address']  // Preservar addresses mesmo ao deletar múltiplas pessoas
    )
  }
}
```

**Sintaxe completa do método `removeMany()`**:
```typescript
protected removeMany<TWhere = any>(
  where: TWhere,
  notCascadeEntityProps?: Array<keyof TEntity>,  // Relacionamentos a preservar
  externalServices?: Promise<any>                // Promises dentro da transação
): Promise<void>
```

### Parâmetro `externalServices` para Transações

Ambos os métodos `remove()` e `removeMany()` possuem um terceiro parâmetro `externalServices` que aceita uma `Promise`. Essa promise é **executada dentro da transação aberta**, permitindo que você execute operações externas de forma atômica.

```typescript
@Injectable()
export class PersonRepository
  extends RepositoryBase<Person, DbTransactionContext, 'person'>
  implements IPersonRepository
{
  constructor(
    @Inject(PRISMA_TOKEN) prisma: DbTransactionContext,
    private readonly auditService: AuditService,
    private readonly notificationService: NotificationService,
  ) {
    super({
      modelName: Person,
      context: prisma,
    })
  }

  async deleteWithAudit(id: number, userId: string): Promise<void> {
    // Executar auditoria dentro da transação
    const auditPromise = this.auditService.logDeletion(id, userId)

    return this.remove<Prisma.PersonWhereUniqueInput>(
      { id },
      [],
      auditPromise  // Executado dentro da transação
    )
  }

  async deleteInactiveWithNotification(): Promise<void> {
    // Executar múltiplas operações externas
    const externalOps = Promise.all([
      this.auditService.logBulkDeletion('inactive_persons'),
      this.notificationService.notifyAdmins('Deleted inactive persons'),
    ])

    return this.removeMany<Prisma.PersonWhereInput>(
      { active: false },
      ['address'],
      externalOps  // Ambas as operações dentro da transação
    )
  }
}
```

**Comportamento do `externalServices`**:
- A promise é executada **antes** do delete/deleteMany acontecer
- Se a promise falhar, a transação inteira é revertida
- Todas as operações (incluindo a promise) são executadas de forma **atômica**
- Se não informar `externalServices`, o delete acontece normalmente sem dependências

**Caso de Uso**:
Use `externalServices` para operações que devem ser garantidas atomicamente com a deleção:
- Auditoria de exclusões
- Notificações
- Atualização de contadores
- Invalidação de cache
- Sincronização com sistemas externos

**Caso de Uso**:
Use `skipOrphanRemovalOn` quando você quer transferir relacionamentos para outro registro ou manter histórico antes de deletar a entidade principal.

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
