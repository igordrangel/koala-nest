import { IsPublic } from '@koalarx/nest/decorators/is-public.decorator'
import { Controller, Get } from '@nestjs/common'
import { ApiExcludeEndpoint } from '@nestjs/swagger'

@Controller('health')
export class HealthCheckController {
  @Get()
  @IsPublic()
  @ApiExcludeEndpoint()
  healthCheck() {
    return { status: 'ok' }
  }
}
