import { ZodType } from 'zod'

export abstract class RequestValidatorBase<TRequest> {
  constructor(private _request: TRequest) {}

  validate(): TRequest {
    const requestParsed = this.schema.safeParse(this._request)

    if (requestParsed.success) {
      return Object.assign(this._request as any, requestParsed.data)
    }

    throw requestParsed.error
  }

  protected abstract get schema(): ZodType
}
