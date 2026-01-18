import { AutoMap } from '@koalarx/nest/core/mapping/auto-mapping.decorator'
import { ApiProperty } from '@nestjs/swagger'

export class PersistPersonAddressRequest {
  @ApiProperty({ example: 'Street 1' })
  @AutoMap()
  address: string
}

export class PersistPersonPhoneRequest {
  @ApiProperty({ example: '22999999999' })
  @AutoMap()
  phone: string
}

export class PersistPersonRequest {
  @ApiProperty({ example: 'John Doe' })
  @AutoMap()
  name: string

  @ApiProperty({ type: [PersistPersonPhoneRequest] })
  @AutoMap({ type: () => PersistPersonPhoneRequest, isArray: { addTo: true } })
  phones: Array<PersistPersonPhoneRequest>

  @ApiProperty({ type: PersistPersonAddressRequest })
  @AutoMap({ type: () => PersistPersonAddressRequest })
  address: PersistPersonAddressRequest
}
