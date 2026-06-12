---
title: Visão geral
slug: visao-geral
category: intro
order: 1
description: O que é o Koala Nest e como ele se encaixa em projetos NestJS com DDD.
---

# Visão geral

O **Koala Nest** é um facilitador para criar APIs NestJS com arquitetura DDD. Em vez de depender de uma biblioteca opaca, a CLI copia módulos prontos para dentro do projeto — abordagem semelhante ao [shadcn/ui](https://ui.shadcn.com). O código gerado fica no seu repositório, pronto para leitura, adaptação e manutenção.

## O que o template inclui

Ao criar um projeto com o módulo **core**, você recebe:

- validação de variáveis de ambiente com **Zod**;
- **TypeORM** com PostgreSQL e scripts de migration;
- documentação OpenAPI em `/doc` via **Scalar**;
- filtro global de erros (Zod, TypeORM e exceções HTTP);
- bases reutilizáveis para controllers, handlers, validators e repositórios;
- sistema de mapeamento entre entidades, requests e responses.

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

## Template de referência: Person

O template **Exemplo de CRUD** inclui um módulo completo de `Person` — entidades com relacionamentos, repositório, handlers, controllers e mapeamentos — que serve de referência para novos recursos.

## Próximos passos

- [Arquitetura DDD](./arquitetura-ddd.md) — camadas e responsabilidades
- [Estrutura do projeto](../inicio/estrutura-do-projeto.md) — bootstrap e módulos Nest
- [Fluxo CRUD Person](../guias/fluxo-crud-person.md) — exemplo ponta a ponta
