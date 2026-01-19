# Decoradores Disponíveis

## @IsPublic()

Marca um endpoint como público, ignorando guards globais de autenticação que você implementar.

```typescript
import { IsPublic } from '@koalarx/nest/decorators/is-public.decorator'

@Controller('auth')
export class AuthController {
  @Post('login')
  @IsPublic()
  async login(@Body() credentials: LoginDto) {
    // Endpoint público
    return { token: 'jwt-token' }
  }

  @Post('register')
  @IsPublic()
  async register(@Body() data: RegisterDto) {
    // Também público
    return { id: 'user-id' }
  }
}
```

**Comportamento**: Quando seu guard global verifica `IS_PUBLIC_KEY`, ele permite acesso sem validação.

> **Dica**: Registre seus guards usando `.addGlobalGuard()` no `KoalaApp` builder em `main.ts`. O decorador `@IsPublic()` funciona junto com qualquer guard que você implementar que verifique a chave `IS_PUBLIC_KEY`.

## @ApiPropertyEnum()

Decorador para documentar propriedades enum no Swagger/Scalar.

```typescript
import { ApiPropertyEnum } from '@koalarx/nest/decorators/api-property-enum.decorator'

enum UserRole {
  ADMIN = 'admin',
  USER = 'user',
  MODERATOR = 'moderator',
}

export class UserDto {
  @ApiPropertyEnum(UserRole)
  role: UserRole
}
```

**Comportamento**: Documenta o enum no Swagger com todas as opções disponíveis.

## @ApiPropertyOnlyDevelop()

Documenta uma propriedade apenas em ambiente de desenvolvimento.

```typescript
import { ApiPropertyOnlyDevelop } from '@koalarx/nest/decorators/api-property-only-develop.decorator'

export class UserDto {
  @ApiProperty()
  name: string

  @ApiPropertyOnlyDevelop()
  internalNotes?: string
}
```

**Comportamento**: A propriedade `internalNotes` aparecerá no Swagger apenas se `NODE_ENV === 'develop'`.

## @Upload()

Decorador para documentar upload de arquivos.

```typescript
import { Upload } from '@koalarx/nest/decorators/upload.decorator'

@Controller('files')
export class FileController {
  @Post('upload')
  @Upload()
  async uploadFile(@UploadedFile() file: Express.Multer.File) {
    return {
      filename: file.filename,
      size: file.size,
      mimetype: file.mimetype,
    }
  }
}
```

**Comportamento**: Configura a documentação do Swagger para aceitar upload de arquivo.

## @Cookies()

Decorador para extrair cookies da requisição.

```typescript
import { Cookies } from '@koalarx/nest/decorators/cookies.decorator'

@Controller('auth')
export class AuthController {
  @Get('profile')
  async getProfile(@Cookies() cookies: Record<string, string>) {
    const sessionId = cookies.sessionId
    // Buscar dados do usuário usando sessionId
    return { user: 'data' }
  }

  @Get('check-consent')
  async checkConsent(
    @Cookies('gdpr-consent') gdprConsent: string,
  ) {
    return { hasConsent: gdprConsent === 'true' }
  }
}
```

**Comportamento**: 
- Sem parâmetro: Extrai todos os cookies
- Com nome: Extrai um cookie específico

> **Nota**: A biblioteca fornece o decorador. A implementação do guard é sua responsabilidade. Veja exemplos em [05-features-avancadas.md](05-features-avancadas.md).

## @ApiExcludeEndpointDiffDevelop()

Exclui um endpoint da documentação exceto em desenvolvimento.

```typescript
import { ApiExcludeEndpointDiffDevelop } from '@koalarx/nest/decorators/api-exclude-endpoint-diff-develop.decorator'

@Controller('debug')
export class DebugController {
  @Get('internal-state')
  @ApiExcludeEndpointDiffDevelop()
  async getInternalState() {
    // Apenas visível em desenvolvimento
    return { internals: 'data' }
  }
}
```

**Comportamento**: O endpoint é documentado no Swagger apenas se `NODE_ENV === 'develop'`.

## Exemplo Completo

```typescript
import { Controller, Get, Post, Body, UseInterceptors, UploadedFile, Delete, Param } from '@nestjs/common'
import { FileInterceptor } from '@nestjs/platform-express'
import { ApiProperty, ApiTags } from '@nestjs/swagger'
import { IsPublic } from '@koalarx/nest/decorators/is-public.decorator'
import { ApiPropertyEnum } from '@koalarx/nest/decorators/api-property-enum.decorator'
import { Upload } from '@koalarx/nest/decorators/upload.decorator'
import { Cookies } from '@koalarx/nest/decorators/cookies.decorator'
import { ApiExcludeEndpointDiffDevelop } from '@koalarx/nest/decorators/api-exclude-endpoint-diff-develop.decorator'
import { RestrictByProfile } from '@/host/decorators/restriction-by-profile.decorator'
import { UserProfileEnum } from '@/domain/entities/user/enums/user-profile.enum'

enum FileType {
  PDF = 'pdf',
  IMAGE = 'image',
  VIDEO = 'video',
}

@ApiTags('Public API')
@Controller('public')
export class PublicController {
  // Endpoint público
  @Get('status')
  @IsPublic()
  async status() {
    return { status: 'running' }
  }

  // Upload com documentação
  @Post('upload')
  @IsPublic()
  @Upload()
  @UseInterceptors(FileInterceptor('file'))
  async uploadFile(@UploadedFile() file: Express.Multer.File) {
    return {
      filename: file.filename,
      size: file.size,
    }
  }

  // Usando cookies
  @Get('user-prefs')
  async getUserPreferences(@Cookies('preferences') prefs: string) {
    return { preferences: JSON.parse(prefs || '{}') }
  }

  // Endpoint apenas para desenvolvimento
  @Get('debug-info')
  @ApiExcludeEndpointDiffDevelop()
  async getDebugInfo() {
    return { debug: 'info' }
  }
}

@ApiTags('Admin API')
@Controller('admin')
export class AdminController {
  // Endpoint restrito a admin
  @Delete('users/:id')
  @RestrictByProfile([UserProfileEnum.ADMIN])
  async deleteUser(@Param('id') id: number) {
    return { success: true }
  }

  // Endpoint para múltiplos perfis
  @Get('reports')
  @RestrictByProfile([UserProfileEnum.ADMIN, UserProfileEnum.MANAGER])
  async getReports() {
    return { reports: [] }
  }
}
```

Todos esses decoradores facilitam a documentação, autenticação e autorização de APIs robustas e bem documentadas!
