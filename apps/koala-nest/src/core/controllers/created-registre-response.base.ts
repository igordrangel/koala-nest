import { ApiProperty } from '@nestjs/swagger'
import { IComparableId } from '../../core/utils/interfaces/icomparable'

export abstract class CreatedRegistreResponseBase<TId = IComparableId> {
  @ApiProperty()
  id: TId
}

export abstract class CreatedRegistreWithUUIDResponse extends CreatedRegistreResponseBase<string> {
  @ApiProperty({ type: 'string', format: 'uuid' })
  declare id: string
}

export abstract class CreatedRegistreWithIdResponse extends CreatedRegistreResponseBase<number> {
  @ApiProperty()
  declare id: number
}
