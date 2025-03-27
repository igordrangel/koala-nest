import { RouterConfigBase } from './router-config.base'
import { Controller as NestController } from '@nestjs/common'
import { ApiTags } from '@nestjs/swagger'

export function Controller(config: RouterConfigBase) {
  return function (target: any) {
    NestController(config.group)(target)
    ApiTags(config.tag)(target)
  }
}
