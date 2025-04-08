import { ErrorBase } from './error.base'
import { UseCaseError } from './use-case-error'

export class NotAllowedError extends ErrorBase implements UseCaseError {
  constructor(message?: string, data?: any) {
    super(message ?? 'Você não tem permissão para utilizar esse recurso.', data)
  }
}
