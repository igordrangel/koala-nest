import { ZodType } from 'zod'

export abstract class RequestValidatorBase<TRequest> {
  constructor(private _request: TRequest) {}

  validate() {
    const requestParsed = this.schema.safeParse(this._request)

    if (requestParsed.success) {
      return requestParsed.data
    }

    throw requestParsed.error
  }

  protected abstract get schema(): ZodType
}
