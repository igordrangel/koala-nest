import { PersonQueryDto } from '@/domain/dtos/person-query.dto';
import { IPersonRepository } from '@/domain/repositories/iperson.repository';
import { ICacheService } from '@/domain/common/icache.service';
import { invalidatePersonListCache } from '@/core/utils/person-list-cache';
import { EventHandlerBase } from '@/core/background-services/event-service/event-handler.base';
import { Injectable, Logger } from '@nestjs/common';
import { InactivePersonEvent } from './inactive-person.event';

@Injectable()
export class InactivePersonHandler extends EventHandlerBase<InactivePersonEvent> {
  private readonly logger = new Logger(InactivePersonHandler.name);

  constructor(
    private readonly repository: IPersonRepository,
    private readonly cache: ICacheService,
  ) {
    super(InactivePersonEvent);
  }

  async handleEvent(_event: InactivePersonEvent): Promise<void> {
    try {
      this.logger.log('Recebido evento de inativação de pessoas.');
      this.logger.debug('Iniciando inativação de pessoas ativas...');

      const query = Object.assign(new PersonQueryDto(), {
        active: true,
        limit: 1000,
        page: 0,
      });
      const { items } = await this.repository.findMany(query);

      if (items.length === 0) {
        this.logger.log('Nenhuma pessoa ativa encontrada.');
        return;
      }

      this.logger.debug('Inativando pessoas ativas...', items.length);

      for (const person of items) {
        person.active = false;
        await this.repository.save(person);
      }

      await invalidatePersonListCache(this.cache);

      this.logger.log('Pessoas inativadas com sucesso.', items.length);
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);

      this.logger.error(`Erro ao processar evento de inativação: ${message}`);
      throw error;
    }
  }
}
