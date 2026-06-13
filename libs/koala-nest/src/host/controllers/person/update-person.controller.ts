import { UpdatePersonHandler } from '@/application/person/update/update-person.handler';
import { UpdatePersonRequest } from '@/application/person/update/update-person.request';
import { Controller } from '@/host/decorators/controller.decorator';
import { Body, HttpCode, HttpStatus, Put } from '@nestjs/common';
import { ApiOkResponse } from '@nestjs/swagger';
import { IController } from '../common/controller.base';
import { PERSON_ROUTER_CONFIG } from './router.config';

@Controller(PERSON_ROUTER_CONFIG)
export class UpdatePersonController implements IController<
  UpdatePersonRequest,
  void
> {
  constructor(private readonly handler: UpdatePersonHandler) {}

  @Put()
  @ApiOkResponse()
  @HttpCode(HttpStatus.OK)
  handle(@Body() request: UpdatePersonRequest): Promise<void> {
    return this.handler.handle(request);
  }
}
