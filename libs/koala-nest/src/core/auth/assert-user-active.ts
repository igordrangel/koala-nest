import { UserStatus } from '@/domain/entities/user/enums/user-status.enum';
import { ForbiddenException } from '@nestjs/common';

type UserWithStatus = { status: UserStatus };

export function assertUserIsActive(user: UserWithStatus): void {
  if (user.status === UserStatus.inactive) {
    throw new ForbiddenException('User is inactive');
  }

  if (user.status === UserStatus.blocked) {
    throw new ForbiddenException('User is blocked');
  }

  if (user.status === UserStatus.pending) {
    throw new ForbiddenException('User is pending');
  }
}
