import { ErrorBase } from './error.base'
import { UseCaseError } from './use-case-error'

export class ResourceNotFoundError extends ErrorBase implements UseCaseError {
  constructor(name = 'Recurso', data?: any) {
    super(`${name} não encontrado(a).`, data)
  }
}
