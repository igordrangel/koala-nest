import { ErrorBase } from './error.base'
import { UseCaseError } from './use-case-error'

export class NoContentError extends ErrorBase implements UseCaseError {
  constructor(message?: string, data?: any) {
    super(message ?? 'No Content', data)
  }
}
