import { UseCaseError } from './use-case-error'

export class NoContentError extends Error implements UseCaseError {
  constructor(message?: string) {
    super(message ?? 'No Content')
  }
}
