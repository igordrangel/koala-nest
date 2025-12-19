# Configurando @koalarx/nest em seu projeto

A biblioteca `@koalarx/nest` foi projetada para funcionar de forma totalmente automática e transparente com o Prisma Client do seu projeto.

## Passo 1: Instale a lib

```bash
bun add @koalarx/nest
```

## Passo 2: Gere o cliente Prisma (Obrigatório)

Você precisa ter um esquema Prisma configurado e gerar o cliente:

```bash
bunx prisma generate
```

Isso criará a pasta `prisma/generated/` com os tipos e cliente do Prisma automaticamente.

## Pronto! ✨

A lib agora funcionará automaticamente. Não há configuração adicional necessária!

### Como funciona

A lib resolve automaticamente o `PrismaClient` do seu projeto através de:

1. **Busca automática**: Procura no diretório `prisma/generated/client` do seu projeto
2. **Múltiplos caminhos**: Tenta vários caminhos possíveis onde o Prisma pode estar
3. **Sem configuração**: Nenhuma configuração de path mapping ou arquivo extra necessário

## Uso avançado (Opcional)

Se por algum motivo você precisar registrar manualmente o `PrismaClient`, você pode fazer:

```typescript
import { setPrismaClient } from '@koalarx/nest'
import { PrismaClient } from './prisma/generated/client'

// Registra manualmente (opcional)
setPrismaClient(PrismaClient)

// ... resto da sua aplicação
```

## Resolução de problemas

Se você receber um erro `Cannot find module 'prisma/generated/client'`:

1. Verifique se executou `bunx prisma generate`
2. Confirme que a pasta `prisma/generated/` existe
3. Certifique-se de que tem um arquivo `schema.prisma` válido
4. Se o problema persistir, use `setPrismaClient()` para registrar manualmente (veja acima)
