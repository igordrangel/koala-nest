import { ArgumentsHost } from '@nestjs/common/interfaces'
import { Request, Response } from 'express'

export class FilterRequestParams {
  static get(host: ArgumentsHost) {
    console.log(host)
    const ctx = host.switchToHttp()
    const response = ctx.getResponse<Response>()
    const request = ctx.getRequest<Request & { user?: { login: string } }>()
    const method = request.method
    const isGetMethod = method === 'GET'
    console.log('ctx', ctx)
    console.log('response', response)
    console.log('request', request)
    console.log('method', isGetMethod)
    console.log('isGetMethod', isGetMethod)

    return {
      response,
      loggedUserName:
        request?.user?.login ?? request.headers.origin ?? request.ip ?? '',
      filterParams: {
        method,
        payload: !isGetMethod ? request.body : undefined,
        endpoint: request.url,
      },
    }
  }
}
