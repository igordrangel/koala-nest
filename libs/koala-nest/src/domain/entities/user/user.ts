import { AuthProfile } from '@/core/auth/auth-profile.enum';
import { EntityBase } from '@/core/base/entity.base';
import { AutoMap } from '@/core/tools/mapping';
import { UserStatus } from '@/domain/entities/user/enums/user-status.enum';
import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('users')
export class User extends EntityBase<User> {
  @PrimaryGeneratedColumn('uuid')
  @AutoMap()
  id: string;

  @Column()
  @AutoMap()
  name: string;

  @Column({ unique: true })
  @AutoMap()
  email: string;

  @Column({ unique: true })
  @AutoMap()
  login: string;

  @Column()
  password: string;

  @Column({ type: 'varchar' })
  @AutoMap()
  profile: AuthProfile;

  @Column({ type: 'varchar', default: UserStatus.active })
  @AutoMap()
  status: UserStatus;

  @CreateDateColumn()
  @AutoMap()
  createdAt: Date;

  @UpdateDateColumn()
  @AutoMap()
  updatedAt: Date;
}
