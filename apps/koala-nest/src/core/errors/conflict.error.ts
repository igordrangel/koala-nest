import { ErrorBase } from './error.base'

export class ConflictError extends ErrorBase {
  constructor(identifier: string, data?: any) {
    super(`O registro ${identifier} já existe.`, data)
  }
}
