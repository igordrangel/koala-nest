import { AutoMap } from '@koalarx/nest/core/mapping/auto-mapping.decorator'
import { ApiProperty } from '@nestjs/swagger'
import {
  PersistPersonAddressRequest,
  PersistPersonPhoneRequest,
} from '../common/persist-person.request'

export class UpdatePersonAddressRequest extends PersistPersonAddressRequest {
  @ApiProperty()
  @AutoMap()
  id: number
}

export class UpdatePersonPhoneRequest extends PersistPersonPhoneRequest {
  @ApiProperty({ required: false })
  @AutoMap()
  id?: number
}

export class UpdatePersonRequest {
  @ApiProperty({ example: 'Mark Willians' })
  @AutoMap()
  name: string

  @ApiProperty({ example: false })
  @AutoMap()
  active: boolean

  @ApiProperty({ type: [UpdatePersonPhoneRequest] })
  @AutoMap({ type: () => UpdatePersonPhoneRequest, isArray: true })
  phones: Array<UpdatePersonPhoneRequest>

  @ApiProperty({ type: UpdatePersonAddressRequest })
  @AutoMap({ type: () => UpdatePersonAddressRequest })
  address: UpdatePersonAddressRequest
}
