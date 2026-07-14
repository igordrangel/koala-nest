import { Injectable } from '@nestjs/common';
import { ApiKeyMapper } from './api-key.mapper';
import { PersonMapper } from './person.mapper';

@Injectable()
export class MappingProvider {
  constructor() {
    PersonMapper.createMap();
    ApiKeyMapper.createMap();
  }
}
