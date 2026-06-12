# Getting Started — Koala Nest CLI

Guia para desenvolver a CLI interativa do Koala Nest com [`@clack/prompts`](https://www.npmjs.com/package/@clack/prompts).

## Instalação

```bash
bun install
```

Dependências de UI da CLI:

```bash
bun add @clack/prompts picocolors
```

## Comandos disponíveis

| Comando   | Descrição                                      |
|-----------|------------------------------------------------|
| `example` | Referência de prompts, cores, ícones e loaders |
| `version` | Versão da CLI                                  |
| `help`    | Ajuda                                          |

```bash
bun run kl-nest example
bun run kl-nest version
bun run kl-nest --help
```

## Comando `example`

O arquivo `libs/cli/commands/example.ts` concentra todos os padrões de UI que você vai reutilizar ao criar `new`, `add` e demais comandos:

| Recurso       | API Clack              | Uso                          |
|---------------|------------------------|------------------------------|
| Cabeçalho     | `p.intro()`            | Início do fluxo              |
| Encerramento  | `p.outro()`            | Fim do fluxo                 |
| Texto livre   | `p.text()`             | Nome, paths, valores         |
| Escolha única | `p.select()`           | Opções com ↑↓                |
| Multi-escolha | `p.multiselect()`      | Várias opções com espaço     |
| Sim/não       | `p.confirm()`          | Confirmações                 |
| Senha         | `p.password()`         | Entrada oculta               |
| Grupo         | `p.group()`            | Prompts agrupados            |
| Nota          | `p.note()`             | Bloco informativo            |
| Logs          | `p.log.*`              | info, success, warn, error   |
| Loader        | `p.spinner()`          | Operações assíncronas        |
| Etapas        | `p.tasks()`            | Lista de passos com spinner  |
| Cancelamento  | `assertNotCancel()`    | Trata Ctrl+C                 |
| Cores extras  | `picocolors`           | Customização de texto        |

Execute para ver tudo funcionando:

```bash
bun libs/cli/index.ts example
```

## Estrutura da CLI

```
libs/cli/
├── index.ts              # Entry point e roteamento
├── commands/
│   ├── example.ts        # Referência de UI (copie daqui)
│   ├── help.ts
│   └── version.ts
├── constants/
│   └── version.ts
└── utils/
    └── cancel.ts         # Tratamento de cancelamento (Ctrl+C)
```

## Criando novos comandos

1. Crie `libs/cli/commands/<nome>.ts` copiando trechos de `example.ts`
2. Registre o comando em `libs/cli/index.ts`
3. Adicione na ajuda em `libs/cli/commands/help.ts`

Documentação para agentes de IA: [nest.koalarx.com/llm.txt](http://nest.koalarx.com/llm.txt)
