import { Response as HttpResponse } from 'express'

export abstract class IController<Request, Response, Params = any> {
  abstract handle(
    request: Request,
    params?: Params,
    response?: HttpResponse,
  ): Promise<Response>
}
