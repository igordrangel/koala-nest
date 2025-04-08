import { ErrorBase } from './error.base'

export class UserAlreadyExist extends ErrorBase {
  constructor(identifier: string, data?: any) {
    super(`User ${identifier} already exists`, data)
  }
}
