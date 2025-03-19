import { ApiProperty } from '@nestjs/swagger'

export abstract class CreatedRegistreResponseBase {
  @ApiProperty()
  id: string
}
