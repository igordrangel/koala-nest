import { ZodType } from 'zod';

export abstract class RequestValidatorBase<
  TRequest extends Record<string, any>,
> {
  protected _request: Record<string, any>;

  constructor(request: TRequest) {
    this._request = RequestValidatorBase.toValidationInput(request);
  }

  validate(): TRequest {
    Object.keys(this._request).forEach((key) => {
      if (key.includes('[]')) {
        const newKey = key.replace('[]', '');
        const value = this._request[key];
        this._request[newKey] =
          typeof value === 'string' ? value.split(',') : value;
        delete this._request[key];
      }
    });

    const requestParsed = this.schema.safeParse(this._request);

    if (requestParsed.success) {
      return Object.assign({} as TRequest, requestParsed.data);
    }

    throw requestParsed.error;
  }

  protected abstract get schema(): ZodType;

  /**
   * Objetos plain (query HTTP) passam direto. Instâncias de classe carregam
   * defaults nos fields — removemos os que não foram alterados para o Zod
   * aplicar defaults/transforms sem sobrescrever query params explícitos.
   */
  private static toValidationInput<T extends Record<string, unknown>>(
    request: T,
  ): Record<string, unknown> {
    if (request === null || typeof request !== 'object') {
      return {};
    }

    const prototype = Object.getPrototypeOf(request);
    const isClassInstance =
      prototype !== null &&
      prototype !== Object.prototype &&
      typeof prototype.constructor === 'function';

    if (!isClassInstance) {
      return { ...request };
    }

    const Constructor = prototype.constructor as new () => T;
    const defaultValues = new Constructor() as Record<string, unknown>;
    const input: Record<string, unknown> = { ...request };

    for (const key of Object.keys(defaultValues)) {
      if (Object.is(input[key], defaultValues[key])) {
        delete input[key];
      }
    }

    return input;
  }
}
