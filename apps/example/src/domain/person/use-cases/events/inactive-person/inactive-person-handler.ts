import { IPersonRepository } from '@/domain/person/repositories/iperson.repository'
import { EventHandler } from '@koalarx/nest/core/backgroud-services/event-service/event-handler'
import { Injectable } from '@nestjs/common'
import { ReadManyPersonRequest } from '../../read-many/read-many-person.request'
import { InactivePersonEvent } from './inactive-person-event'

@Injectable()
export class InactivePersonHandler extends EventHandler<InactivePersonEvent> {
  constructor(private readonly repository: IPersonRepository) {
    super()
  }

  async handleEvent(): Promise<void> {
    const result = await this.repository.readMany(
      new ReadManyPersonRequest({ active: true }),
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
