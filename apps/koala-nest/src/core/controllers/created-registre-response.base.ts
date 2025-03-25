import { ApiProperty } from '@nestjs/swagger'
import { IComparableId } from '../../core/utils/interfaces/icomparable'

export abstract class CreatedRegistreResponseBase<TId = IComparableId> {
  @ApiProperty({ type: 'string' })
  id: TId
}
