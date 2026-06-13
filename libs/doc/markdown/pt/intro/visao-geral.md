---
title: Visão geral
slug: visao-geral
category: intro
docKey: intro/visao-geral
order: 1
description: O que é o Koala Nest e como ele se encaixa em projetos NestJS com DDD.
---

# Visão geral

O **Koala Nest** é um facilitador para criar APIs NestJS com arquitetura DDD. Em vez de depender de uma biblioteca opaca, a CLI copia módulos prontos para dentro do projeto — abordagem semelhante ao [shadcn/ui](https://ui.shadcn.com). O código gerado fica no seu repositório, pronto para leitura, adaptação e manutenção.

## Core (sempre instalado)

Ao rodar `kl-nest new`, a CLI instala automaticamente:

- validação de variáveis de ambiente com **Zod**;
- **TypeORM** com PostgreSQL e scripts de migration;
- documentação OpenAPI em `/doc` via **Scalar**;
- filtro global de erros (Zod, TypeORM e exceções HTTP);
- bases reutilizáveis para controllers, handlers, validators e repositórios;
- sistema de mapeamento entre entidades, requests e responses;
- **[`@koalarx/utils`](../core/koala-utils.md)** — delay, CPF/CNPJ, strings, datas e arrays.

## Funcionalidades opcionais

Escolha no `kl-nest new` ou adicione depois com `kl-nest add`:

| Feature | Comando | Descrição |
| --- | --- | --- |
| Autenticação JWT/OAuth2 | `kl-nest add auth jwt` / `oauth2` | Guards globais, Scalar OAuth |
| Cache Redis | `kl-nest add cache` | `ICacheService` + `ioredis` |
| Health check | `kl-nest add health` | `GET /health` com Terminus |
| Cron jobs | `kl-nest add cron` | `CronJobHandlerBase` + bootstrap |
| Event jobs | `kl-nest add events` | `EventJob` + handlers em memória |

OAuth2 e cron jobs instalam **cache em memória** automaticamente quando Redis não foi selecionado (sem `ioredis`).

## Templates

| Template | Conteúdo |
| --- | --- |
| **Padrão** | Apenas core — sem código de exemplo |
| **Exemplo de CRUD** | Módulo `Person` completo **com auth, cache Redis, cron e event jobs** |

No template CRUD, auth, cache e jobs são **incluídos automaticamente** para demonstrar o fluxo completo. Apenas **health check** permanece opcional na criação (ou via `kl-nest add health`).

## Estrutura de pastas

Projetos gerados seguem esta organização:

```
src/
├── application/   # casos de uso, validadores, mapeamentos
├── core/          # utilitários, env, ferramentas compartilhadas
├── domain/        # entidades, DTOs, contratos de repositório
├── host/          # controllers, módulos Nest, filtros, OpenAPI
├── infra/         # banco de dados, repositórios, serviços externos
└── test/          # testes unitários
```

## Próximos passos

- [Guia de instalação](../inicio/guia-de-instalacao.md) — `kl-nest new` e `kl-nest add`
- [Arquitetura DDD](./arquitetura-ddd.md) — camadas e responsabilidades
- [Estrutura do projeto](../inicio/estrutura-do-projeto.md) — bootstrap e módulos Nest
- [Fluxo CRUD Person](../guias/fluxo-crud-person.md) — exemplo ponta a ponta (template CRUD)
- [Health check](../host/health-check.md) — monitoramento com Terminus
- [Cache (Redis)](../core/cache.md) — cache distribuído
- [Cron e Event Jobs](../core/cron-event-jobs.md) — jobs em background
