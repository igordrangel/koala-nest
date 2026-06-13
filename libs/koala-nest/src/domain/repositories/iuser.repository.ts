import { User } from '@/domain/entities/user/user';

export abstract class IUserRepository {
  abstract getById(id: string): Promise<User | null>;
  abstract getByEmail(email: string): Promise<User | null>;
  abstract getByLogin(login: string): Promise<User | null>;
  abstract save(user: User): Promise<User>;
}
