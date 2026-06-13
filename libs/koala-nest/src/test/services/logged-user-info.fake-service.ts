import { LoggedUserInfoDto } from '@/domain/dtos/logged-user-info.dto';
import { ILoggedUserInfoService } from '@/domain/services/ilogged-user-info.service';

export class LoggedUserInfoFakeService implements ILoggedUserInfoService {
  private user: LoggedUserInfoDto | null = null;

  setContext(context: { user?: LoggedUserInfoDto | null }) {
    this.user = context.user ?? this.user;
  }

  getUser(): LoggedUserInfoDto {
    if (!this.user) {
      throw new Error('Usuário logado não configurado no fake service');
    }

    return this.user;
  }
}
