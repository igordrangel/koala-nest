import { ApiProperty } from '@nestjs/swagger'
import { IComparableId } from '../../core/utils/interfaces/icomparable'

export abstract class CreatedRegistreResponseBase {
  @ApiProperty({ type: 'string' })
  id: IComparableId
}
