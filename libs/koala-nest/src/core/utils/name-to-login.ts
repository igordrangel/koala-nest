import { IUserRepository } from '@/domain/repositories/iuser.repository';
import { randomString } from '@koalarx/utils';

export async function nameToLogin(
  value: string,
  userRepository: IUserRepository,
) {
  const firstNameAndLast = value.split(/(\s).+\s/).join('');
  const username = firstNameAndLast.toLowerCase().replace(/ /g, '.');

  let usernameExists = false;
  let result = username;

  do {
    usernameExists = await userRepository
      .getByLogin(result)
      .then((user) => !!user);

    if (usernameExists) {
      result = username.concat('#').concat(randomString(4, { numbers: true }));
    }
  } while (usernameExists);

  return result;
}
