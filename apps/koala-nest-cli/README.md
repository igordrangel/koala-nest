# @koalarx/nest-cli

CLI oficial para criar projetos utilizando **Koala Nest** - uma abstração robusta do NestJS seguindo princípios de Domain-Driven Design (DDD).

## 📦 Instalação

```bash
npm install -g @koalarx/nest-cli
# ou
bun add -g @koalarx/nest-cli
```

## 🚀 Uso

### Criar Novo Projeto

```bash
koala-nest new meu-projeto
```

Ou de forma interativa:

```bash
koala-nest new
```

Isso criará um novo projeto com:
- ✅ Estrutura DDD completa (Domain, Application, Host, Infra)
- ✅ Configuração do Prisma
- ✅ Exemplo de CRUD com Person
- ✅ Testes unitários e E2E configurados
- ✅ Bun configurado
- ✅ Dockerfile
- ✅ ESLint e Prettier
- ✅ AutoMapping
- ✅ Validação com Zod
- ✅ Swagger/Scalar

## 📁 Estrutura Gerada

```
meu-projeto/
├── src/
│   ├── application/      # Handlers, Validators, Mapping
│   ├── core/            # Configurações e variáveis globais
│   ├── domain/          # Entities, DTOs, Repositories
│   ├── host/            # Controllers e Modules
│   ├── infra/           # Database e implementações
│   └── test/            # Configurações de teste
├── prisma/
│   ├── schema.prisma
│   └── migrations/
├── .env
├── Dockerfile
├── package.json
└── tsconfig.json
```

## 🔗 Links Úteis

- [Documentação Koala Nest](https://github.com/igordrangel/koala-nest)
- [Exemplo Completo](https://github.com/igordrangel/koala-nest/blob/main/docs/EXAMPLE.md)
- [NPM Package](https://www.npmjs.com/package/@koalarx/nest)

## 🤝 Contribuindo

Contribuições são bem-vindas! Veja o [repositório principal](https://github.com/igordrangel/koala-nest) para mais informações.

## 📄 Licença

ISC © Igor D. Rangel
