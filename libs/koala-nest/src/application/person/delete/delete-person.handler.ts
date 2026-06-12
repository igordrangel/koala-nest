import { RequestHandlerBase } from '@/application/common/request-handler.base';
import { IPersonRepository } from '@/domain/repositories/iperson.repository';
import { Injectable, NotFoundException } from '@nestjs/common';

@Injectable()
export class DeletePersonHandler implements RequestHandlerBase<number, void> {
  constructor(private readonly repository: IPersonRepository) {}

  async handle(id: number): Promise<void> {
    const person = await this.repository.findById(id);

    if (!person) {
      throw new NotFoundException('Pessoa não encontrada');
    }

    await this.repository.delete(person);
  }
}
