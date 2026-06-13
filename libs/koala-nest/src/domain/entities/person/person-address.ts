import { EntityBase } from '@/core/base/entity.base';
import { AutoMap } from '@/core/tools/mapping';
import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity('person_address')
export class PersonAddress extends EntityBase<PersonAddress> {
  @PrimaryGeneratedColumn()
  @AutoMap()
  id: number;

  @Column()
  @AutoMap()
  address: string;
}
