import { AutoMap } from '@koalarx/nest/core/mapping/auto-mapping.decorator'
import { ApiProperty } from '@nestjs/swagger'

export class ReadPersonAddressResponse {
  @ApiProperty()
  @AutoMap()
  id: number

  @ApiProperty({ example: 'Street 1' })
  @AutoMap()
  address: string
}

export class ReadPersonPhoneResponse {
  @ApiProperty()
  @AutoMap()
  id: number

  @ApiProperty({ example: '22999999999' })
  @AutoMap()
  phone: string
}

export class ReadPersonResponse {
  @ApiProperty()
  @AutoMap()
  id: number

  @ApiProperty({ example: 'John Doe' })
  @AutoMap()
  name: string

  @ApiProperty({ type: [ReadPersonPhoneResponse] })
  @AutoMap({ type: ReadPersonPhoneResponse, isArray: true })
  phones: Array<ReadPersonPhoneResponse>

  @ApiProperty({ type: ReadPersonAddressResponse })
  @AutoMap({ type: ReadPersonAddressResponse })
  address: ReadPersonAddressResponse

  @ApiProperty()
  @AutoMap()
  active: boolean
}
