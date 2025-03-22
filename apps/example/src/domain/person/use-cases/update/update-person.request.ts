import { AutoMap } from '@koalarx/nest/core/mapping/auto-mapping.decorator'
import { ApiProperty } from '@nestjs/swagger'

export class UpdatePersonPhoneRequest {
  @ApiProperty({required: false})
  @AutoMap()
  id?: number

  @ApiProperty()
  @AutoMap()
  phone: string
}

export class UpdatePersonRequest {
  @ApiProperty()
  @AutoMap()
  name: string

  @ApiProperty()
  @AutoMap()
  active: boolean

  @ApiProperty({ type: [UpdatePersonPhoneRequest] })
  @AutoMap({ type: UpdatePersonPhoneRequest, isArray: true })
  phones: Array<UpdatePersonPhoneRequest>
}
