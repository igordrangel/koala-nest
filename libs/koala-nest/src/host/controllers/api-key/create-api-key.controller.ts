import { CreateApiKeyHandler } from '@/application/api-key/create/create-api-key.handler';
import { CreateApiKeyRequest } from '@/application/api-key/create/create-api-key.request';
import { CreateApiKeyResponse } from '@/application/api-key/create/create-api-key.response';
import { Controller } from '@/host/decorators/controller.decorator';
import { Body, HttpCode, HttpStatus, Post } from '@nestjs/common';
import { ApiCreatedResponse } from '@nestjs/swagger';
import { IController } from '../common/controller.base';
import { API_KEY_ROUTER_CONFIG } from './router.config';

@Controller(API_KEY_ROUTER_CONFIG)
export class CreateApiKeyController implements IController<
  CreateApiKeyRequest,
  CreateApiKeyResponse
> {
  constructor(private readonly handler: CreateApiKeyHandler) {}

  @Post()
  @ApiCreatedResponse({ type: CreateApiKeyResponse })
  @HttpCode(HttpStatus.CREATED)
  handle(@Body() request: CreateApiKeyRequest): Promise<CreateApiKeyResponse> {
    return this.handler.handle(request);
  }
}
