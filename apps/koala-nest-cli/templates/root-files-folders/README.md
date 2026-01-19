# [projectName]

Projeto criado com [Koala Nest](https://github.com/igordrangel/koala-nest)

## 🚀 Quick Start

```bash
# Instalar dependências
bun install

# Configurar banco de dados
cp .env.example .env
bun prisma:migrate

# Iniciar em desenvolvimento
bun start:dev
```

## 📚 Documentação

- [Koala Nest Docs](https://github.com/igordrangel/koala-nest#readme)
- [NestJS Documentation](https://docs.nestjs.com)
- [Prisma Documentation](https://www.prisma.io/docs)

## 🏗️ Estrutura

```
src/
├── domain/          # Regras de negócio
├── application/     # Casos de uso
├── infra/          # Implementação técnica
└── host/           # Configuração (Controllers, Módulos)
```
