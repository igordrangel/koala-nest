import { CreateApiKeyHandler } from '@/application/api-key/create/create-api-key.handler';
import { DeleteApiKeyHandler } from '@/application/api-key/delete/delete-api-key.handler';
import { ReadManyApiKeyHandler } from '@/application/api-key/read-many/read-many-api-key.handler';
import { ReadApiKeyHandler } from '@/application/api-key/read/read-api-key.handler';
import { UpdateApiKeyHandler } from '@/application/api-key/update/update-api-key.handler';
import { Module } from '@nestjs/common';
import { ControllerModule } from '../common/controller.module';
import { CreateApiKeyController } from './create-api-key.controller';
import { DeleteApiKeyController } from './delete-api-key.controller';
import { ReadManyApiKeyController } from './read-many-api-key.controller';
import { ReadApiKeyController } from './read-api-key.controller';
import { UpdateApiKeyController } from './update-api-key.controller';

@Module({
  imports: [ControllerModule],
  controllers: [
    CreateApiKeyController,
    ReadManyApiKeyController,
    ReadApiKeyController,
    UpdateApiKeyController,
    DeleteApiKeyController,
  ],
  providers: [
    CreateApiKeyHandler,
    ReadApiKeyHandler,
    ReadManyApiKeyHandler,
    UpdateApiKeyHandler,
    DeleteApiKeyHandler,
  ],
})
export class ApiKeyModule {}
