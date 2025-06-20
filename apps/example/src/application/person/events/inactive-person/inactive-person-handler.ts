import { ReadManyPersonDto } from '@/domain/dtos/read-many-person.dto'
import { IPersonRepository } from '@/domain/repositories/iperson.repository'
import { EventHandlerBase } from '@koalarx/nest/core/backgroud-services/event-service/event-handler.base'
import { Injectable } from '@nestjs/common'
import { InactivePersonEvent } from './inactive-person-event'

@Injectable()
export class InactivePersonHandler extends EventHandlerBase {
  constructor(private readonly repository: IPersonRepository) {
    super(InactivePersonEvent)
  }

  async handleEvent(): Promise<void> {
    const result = await this.repository.readMany(
      new ReadManyPersonDto({ active: true }),
    )

    for (const person of result.items) {
      person.active = false
      await this.repository.save(person)
    }

    console.log(
      'InactivePersonHandler: Registros ativos inativados com sucesso!',
    )
  }
}
