import { RequestResult } from './request-result'

export abstract class RequestHandlerBase<
  TRequest,
  TResponse extends RequestResult<Error, any>,
> {
  abstract handle(req: TRequest): Promise<TResponse>
}
