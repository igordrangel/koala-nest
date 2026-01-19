ARG BUN_VERSION=1.3.5-debian

# ====== STAGE 1: BUILDER ======
FROM oven/bun:${BUN_VERSION} AS builder

# Criando diretório de trabalho
WORKDIR /home/bun/app

# Copiando arquivos de configuração com permissões
COPY package.json bun.lock ./

# Instalando dependências
RUN bun install --frozen-lockfile

# Copiando o restante do código com permissões
COPY . .

ENV DATABASE_URL=" "

# Compilando o app
RUN bun build:prisma && bun build

# ====== STAGE 2: RUNTIME ======
FROM oven/bun:${BUN_VERSION}

# Create a non-root user and group
RUN apt-get update -y && \
  apt-get install -y openssl curl && \
  apt-get clean

# Criando diretório de trabalho
WORKDIR /home/bun/app

# Copiando apenas os arquivos necessários do builder
COPY --from=builder --chown=bun:bun --chmod=555 /home/bun/app/node_modules ./node_modules
COPY --from=builder --chown=bun:bun --chmod=555 /home/bun/app/templates ./templates
COPY --from=builder --chown=bun:bun --chmod=555 /home/bun/app/prisma ./prisma
COPY --from=builder --chown=bun:bun --chmod=555 /home/bun/app/dist ./dist
COPY --from=builder --chown=bun:bun --chmod=555 /home/bun/app/package.json ./package.json
COPY --from=builder --chown=bun:bun --chmod=555 /home/bun/app/prisma.config.ts ./prisma.config.ts

# Alterando o usuário para "bun" por segurança
USER bun

# Expondo a porta da aplicação
EXPOSE 3000

# Comando para iniciar o app
CMD ["bun", "run", "start:prod"]