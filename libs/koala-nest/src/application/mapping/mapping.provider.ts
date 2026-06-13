import { Injectable } from '@nestjs/common';
import { PersonMapper } from './person.mapper';

@Injectable()
export class MappingProvider {
  constructor() {
    PersonMapper.createMap();
  }
}
