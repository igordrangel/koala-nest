import { ArgumentsHost } from '@nestjs/common/interfaces';
import { Request, Response } from 'express';

type RequestUser = { login?: string; sub?: string };

export class FilterRequestParams {
  static get(host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request & { user?: RequestUser }>();
    const method = request.method;
    const isGetMethod = method === 'GET';

    return {
      response,
      loggedUserName:
        request?.user?.login ??
        request?.user?.sub ??
        request.headers.origin ??
        request.ip ??
        '',
      filterParams: {
        method,
        payload: !isGetMethod ? request.body : undefined,
        endpoint: request.url,
      },
    };
  }
}
