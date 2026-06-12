import { Body, HttpCode, HttpStatus, Post } from '@nestjs/common';
import { ApiCreatedResponse } from '@nestjs/swagger';
import { PERSON_ROUTER_CONFIG } from './router.config';
import { Controller } from '@/host/decorators/controller.decorator';
import { IController } from '../common/controller.base';
import { CreatePersonRequest } from '@/application/person/create/create-person.request';
import { CreatePersonResponse } from '@/application/person/create/create-person.response';
import { CreatePersonHandler } from '@/application/person/create/create-person.handler';

@Controller(PERSON_ROUTER_CONFIG)
export class CreatePersonController implements IController<
  CreatePersonRequest,
  CreatePersonResponse
> {
  constructor(private readonly handler: CreatePersonHandler) {}

  @Post()
  @ApiCreatedResponse({ type: CreatePersonResponse })
  @HttpCode(HttpStatus.CREATED)
  handle(@Body() request: CreatePersonRequest): Promise<CreatePersonResponse> {
    return this.handler.handle(request);
  }
}
