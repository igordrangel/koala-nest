<p align="center">
  <a href="https://nestjs.com/" target="blank"><img src="https://nestjs.com/img/logo-small.svg" width="120" alt="Nest Logo" /></a>
</p>

<h1 align="center">@koalarx/nest</h1>

<p align="center">Uma abstração <a href="https://nestjs.com" target="_blank">Nest.js</a> para APIs escaláveis.</p>

# Índice
1. [Introdução](#introdução)  
2. [Estrutura do Projeto](#estrutura-do-projeto)  
3. [Uso da CLI @koalarx/nest-cli](#uso-da-cli-koalarxnest-cli)  
4. [Recursos Optionais](#recursos-opcionais)

    4.1. [API Key Strategy](#api-key-strategy)

    4.2. [Ngrok](#ngrok)

    4.3. [ApiPropertyEnum](#apipropertyenum)

    4.4. [Upload](#upload)

---

## Introdução

Este projeto utiliza a CLI `@koalarx/nest-cli` para facilitar a criação de aplicações seguindo os princípios do Domain-Driven Design (DDD). A CLI automatiza a configuração inicial e a estruturação do projeto, permitindo que você comece rapidamente a desenvolver sua aplicação.  

---

## Estrutura do Projeto

A estrutura do projeto gerada pela CLI segue os princípios do DDD, separando as responsabilidades em camadas:  

- **application**: Contém a lógica de mapeamento e casos de uso.  
- **core**: Configurações e variáveis de ambiente.  
- **domain**: Entidades, DTOs, repositórios e serviços do domínio.  
- **host**: Controladores e ponto de entrada da aplicação.  
- **infra**: Implementações de infraestrutura, como banco de dados e serviços externos.

---

## Uso da CLI @koalarx/nest-cli

### Instalação da CLI

Certifique-se de instalar a CLI globalmente no seu ambiente:  

```bash
npm install -g @koalarx/nest-cli
```

### Criação de um Novo Projeto

Para criar um novo projeto, execute o seguinte comando:  

```bash
koala-nest new my-project
```

Este comando irá gerar um projeto com a estrutura recomendada e todas as dependências configuradas.

### Recursos Opcionais

#### API Key Strategy

Tendo em vista a falta de uma opção para o Nest 11 de estratégias de autenticação para APIKey, foi disponibilizada uma abstração para o mesmo no Koala Nest.

Abaixo está a estrutura de pastas recomendada para a implementação de segurança no diretório `host/security`:

```
host
└── security
  ├── strategies
  │   └── api-key.strategy.ts
  ├── guards
  │   └── auth.guard.ts
  └── security.module.ts
```

##### Exemplo de implementação

###### api-key.strategy.ts
```ts
import {
  DoneFn,
  ApiKeyStrategy as KoalaApiKeyStrategy,
} from '@koalarx/nest/core/security/strategies/api-key.strategy'
import { Injectable } from '@nestjs/common'
import { PassportStrategy } from '@nestjs/passport'
import { Request } from 'express'

@Injectable()
export class ApiKeyStrategy extends PassportStrategy(
  KoalaApiKeyStrategy,
  'apikey',
) {
  constructor() {
    super({ header: 'ApiKey' })
  }

  validate(apikey: string, done: DoneFn, request: Request) {
    // Valide a chave de API aqui
    // Por exemplo, verifique se ela corresponde a um valor específico
    if (apikey === 'valid-api-key') {
      // Se for válida, chame done com o objeto do usuário
      return done(null, { userId: 1, username: 'testuser' })
    } else {
      // Se for inválida, chame done com false
      return done(null, false)
    }
  }
}
```

###### auth.guard.ts
```ts
import { IS_PUBLIC_KEY } from '@koalarx/nest/decorators/is-public.decorator'
import { ExecutionContext, Injectable } from '@nestjs/common'
import { Reflector } from '@nestjs/core'
import { AuthGuard as NestAuthGuard } from '@nestjs/passport'

@Injectable()
export class AuthGuard extends NestAuthGuard(['apikey']) {
  constructor(private readonly reflector: Reflector) {
    super()
  }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ])

    const request = context.switchToHttp().getRequest()

    if (isPublic) {
      return true
    }

    const canActivate = super.canActivate(context)

    if (typeof canActivate === 'boolean') {
      return canActivate
    }

    return (canActivate as Promise<boolean>).then(async (activated) => {
      if (!request.user) {
        const user = {} // busque o usuário aqui

        if (user) {
          request.user = user
        }
      }

      return activated
    })
  }
}
```

###### security.module.ts
```ts
import { EnvService } from '@koalarx/nest/env/env.service'
import { Module } from '@nestjs/common'
import { PassportModule } from '@nestjs/passport'
import { ApiKeyStrategy } from './strategies/api-key.strategy'

@Module({
  imports: [PassportModule],
  providers: [EnvService, ApiKeyStrategy],
})
export class SecurityModule {}
```

Agora basta importar o módulo de segurança em seu `app.module.ts` e utilizar globalmente ou em um endpoint específico

###### app.module.ts
```ts
import { CreatePersonJob } from '@/application/person/create-person-job/create-person-job'
import { DeleteInactiveJob } from '@/application/person/delete-inative-job/delete-inactive-job'
import { InactivePersonHandler } from '@/application/person/events/inactive-person/inactive-person-handler'
import { env } from '@/core/env'
import { KoalaNestModule } from '@koalarx/nest/core/koala-nest.module'
import { Module } from '@nestjs/common'
import { PersonModule } from './controllers/person/person.module'
import { SecurityModule } from './security/security.module'

@Module({
  imports: [
    SecurityModule,
    KoalaNestModule.register({
      env,
      controllers: [PersonModule],
      cronJobs: [DeleteInactiveJob, CreatePersonJob],
      eventJobs: [InactivePersonHandler],
    }),
  ],
})
export class AppModule {}
```

Para configurar globalmente inclua o guard em seu arquivo `main.ts`

###### main.ts
```ts
import { CreatePersonJob } from '@/application/person/create-person-job/create-person-job'
import { DeleteInactiveJob } from '@/application/person/delete-inative-job/delete-inactive-job'
import { InactivePersonHandler } from '@/application/person/events/inactive-person/inactive-person-handler'
import { DbTransactionContext } from '@/infra/database/db-transaction-context'
import { KoalaApp } from '@koalarx/nest/core/koala-app'
import { NestFactory } from '@nestjs/core'
import { AppModule } from './app.module'
import { AuthGuard } from './security/guards/auth.guard'

async function bootstrap() {
  return NestFactory.create(AppModule).then((app) =>
    new KoalaApp(app)
      .useDoc({
        ui: 'scalar',
        endpoint: '/doc',
        title: 'API de Demonstração',
        version: '1.0',
        authorizations: [
          { name: 'ApiKey', config: { type: 'apiKey', name: 'ApiKey' } },
        ],
      })
      .addGlobalGuard(AuthGuard)
      .addCronJob(CreatePersonJob)
      .addCronJob(DeleteInactiveJob)
      .addEventJob(InactivePersonHandler)
      .setAppName('example')
      .setInternalUserName('integration.bot')
      .setDbTransactionContext(DbTransactionContext)
      .enableCors()
      .buildAndServe(),
  )
}
bootstrap()
```

#### Ngrok

[Ngrok](https://ngrok.com) é uma ferramenta que cria túneis seguros para expor servidores locais à internet. Ele é útil para testar webhooks, compartilhar aplicações em desenvolvimento ou acessar serviços locais remotamente.

##### Exemplo de implementação

Inclua seu token no arquivo `main.ts` no método `.useNgrok()` e inicie a aplicação. O servidor Ngrok será configurado automaticamente para expor sua aplicação local à internet.  

Certifique-se de substituir `'erarwrqwrqwr...'` pelo seu token de autenticação do Ngrok. Após iniciar a aplicação, você poderá acessar o endereço gerado pelo Ngrok para testar webhooks ou compartilhar sua aplicação em desenvolvimento.

###### main.ts
```ts
...
import { KoalaApp } from '@koalarx/nest/core/koala-app'
import { NestFactory } from '@nestjs/core'
import { AppModule } from './app.module'

async function bootstrap() {
  return NestFactory.create(AppModule).then((app) =>
    new KoalaApp(app)
      ...
      .useNgrok('erarwrqwrqwr...') // Inclua sua Chave do Ngrok aqui
      ...
      .buildAndServe(),
  )
}
bootstrap()
```

### ApiPropertyEnum

Um decorador para aprimorar o `@ApiProperty` do `@nestjs/swagger`, fornecendo suporte adicional para enumerações. Ele gera uma descrição para os valores do enum, incluindo suas representações numéricas e descrições, e aplica isso à propriedade na documentação.

#### Parâmetros

- **options** - Opções de configuração para o decorador.
  - **options.enum** - A enumeração a ser documentada. Deve ser um objeto onde as chaves são os nomes dos enums e os valores são suas representações numéricas.
  - **options.required** - (Opcional) Indica se a propriedade é obrigatória.

#### Exemplo de Uso

```ts
import { ApiPropertyEnum } from './decorators/api-property-enum.decorator';

enum Status {
  Ativo = 1,
  Inativo = 2,
}

class ExemploDto {
  @ApiPropertyEnum({ enum: Status, required: true })
  status: Status;
}
```

Na documentação, a propriedade `status` exibirá uma descrição com os valores do enum e suas representações numéricas correspondentes, por exemplo:

```
Ativo: 1
Inativo: 2
```

### ApiExcludeEndpointDiffDevelop

O decorator `ApiExcludeEndpointDiffDevelop` é utilizado para condicionar a exclusão de endpoints na documentação com base no ambiente de execução da aplicação. Ele utiliza a configuração de ambiente definida na classe `EnvConfig` para determinar se o endpoint será ou não excluído.

#### Como funciona

- Se o ambiente atual for de desenvolvimento (`isEnvDevelop` for `true`), o endpoint será incluído na documentação.
- Caso contrário, o endpoint será excluído da documentação.

### Upload

Um decorator personalizado para lidar com o upload de arquivos em um controlador NestJS.

@param {number} maxSizeInKb - O tamanho máximo permitido para os arquivos em kilobytes.

@param {RegExp} filetype - Um padrão de expressão regular para validar os tipos de arquivo permitidos.

@returns {MethodDecorator} - Um decorator que pode ser aplicado a métodos de controladores para processar uploads de arquivos.

Este decorator utiliza o `UploadedFiles` do NestJS para processar múltiplos arquivos enviados em uma requisição.
Ele valida os arquivos com base no tamanho máximo permitido e no tipo de arquivo especificado.

Exemplos de uso:

```ts
@Post('upload')
@UploadDecorator(1024, /\.(jpg|jpeg|png)$/)
uploadFiles(@UploadedFiles() files: Express.Multer.File[]) {
  console.log(files);
}
```

No exemplo acima, o método `uploadFiles` aceita múltiplos arquivos com tamanho máximo de 1MB (1024 KB) e tipos de arquivo `.jpg`, `.jpeg` ou `.png`.
