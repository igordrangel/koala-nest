import { ErrorBase } from './error.base'
import { UseCaseError } from './use-case-error'

export class BadRequestError extends ErrorBase implements UseCaseError {
  constructor(message?: string, data?: any) {
    super(message ?? 'Bad Request', data)
  }
}
