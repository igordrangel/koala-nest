import { ErrorBase } from './error.base'

export class WrongCredentialsError extends ErrorBase {
  constructor(data?: any) {
    super('Credentials are not valid', data)
  }
}
