import { hash } from 'bcrypt';

const DEFAULT_BCRYPT_ROUNDS = 10;

export function hashPassword(
  password: string,
  rounds = Number(process.env.BCRYPT_ROUNDS) || DEFAULT_BCRYPT_ROUNDS,
): Promise<string> {
  return hash(password, rounds);
}
