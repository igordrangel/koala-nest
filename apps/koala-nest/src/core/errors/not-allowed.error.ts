import { UseCaseError } from './use-case-error'

export class NotAllowedError extends Error implements UseCaseError {
  constructor(message?: string) {
    super(message ?? 'Você não tem permissão para utilizar esse recurso.')
  }
}
