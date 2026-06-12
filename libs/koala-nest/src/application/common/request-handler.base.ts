export abstract class RequestHandlerBase<TRequest, TResponse> {
  abstract handle(req: TRequest): Promise<TResponse>;
}
