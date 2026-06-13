import { AuthProfile } from '@/core/auth/auth-profile.enum';
import { LoggedUserInfoDto } from '@/domain/dtos/logged-user-info.dto';
import { ILoggedUserInfoService } from '@/domain/services/ilogged-user-info.service';

export class LoggedUserInfoFakeService implements ILoggedUserInfoService {
  private user: LoggedUserInfoDto | null = null;
  private token: string | undefined;

  setContext(context: { user?: LoggedUserInfoDto | null; token?: string }) {
    this.user = context.user ?? this.user;
    this.token = context.token ?? this.token;
  }

  getUser(): LoggedUserInfoDto {
    if (!this.user) {
      throw new Error('Usuário logado não configurado no fake service');
    }

    return this.user;
  }

  getToken(): string | undefined {
    return this.token;
  }

  isAdmin(): boolean {
    return this.getUser().profile === AuthProfile.admin;
  }
}
