import { ZodType } from 'zod'

export abstract class RequestValidatorBase<
  TRequest extends Record<string, any>,
> {
  private _request: Record<string, any>

  constructor(request: TRequest) {
    this._request = { ...request }
  }

  validate(): TRequest {
    Object.keys(this._request).forEach((key) => {
      if (key.includes('[]')) {
        const newKey = key.replace('[]', '')
        const value = this._request[key]
        this._request[newKey] =
          typeof value === 'string' ? value.split(',') : value
        delete this._request[key]
      }
    })

    const requestParsed = this.schema.safeParse(this._request)

    if (requestParsed.success) {
      return Object.assign(this._request as any, requestParsed.data)
    }

    throw requestParsed.error
  }

  protected abstract get schema(): ZodType
}
