import { LoggedUserInfoDto } from '@/domain/dtos/logged-user-info.dto';

export abstract class ILoggedUserInfoService {
  abstract getUser(): LoggedUserInfoDto;
  abstract getToken(): string | undefined;
  abstract isAdmin(): boolean;
}
