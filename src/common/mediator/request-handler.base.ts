import { RequestResult } from '../../common/mediator/request-result'

export abstract class RequestHandlerBase<
  TRequest,
  TResponse extends RequestResult<Error, any>,
> {
  abstract handle(req: TRequest): Promise<TResponse>
}
