import { LoggedUserInfoDto } from '@/domain/dtos/logged-user-info.dto';

export abstract class ILoggedUserInfoService {
  abstract getUser(): LoggedUserInfoDto;
}
