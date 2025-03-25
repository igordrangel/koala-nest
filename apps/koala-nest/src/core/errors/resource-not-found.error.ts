import { UseCaseError } from './use-case-error'

export class ResourceNotFoundError extends Error implements UseCaseError {
  constructor(name = 'Recurso') {
    super(`${name} não encontrado(a).`)
  }
}
