import { describe, expect, it, mock } from 'bun:test';
import { ArgumentsHost, HttpStatus } from '@nestjs/common';
import { ErrorsFilter } from '@/host/filters/errors.filter';
import { ILoggingService } from '@/domain/common/ilogging.service';
import { z } from 'zod';

function createHost() {
  const json = mock(() => undefined);
  const status = mock(() => ({ json }));

  return {
    host: {
      switchToHttp: () => ({
        getResponse: () => ({ status }),
        getRequest: () => ({
          method: 'POST',
          url: '/person',
          body: {},
          headers: {},
          ip: '127.0.0.1',
        }),
      }),
    } as unknown as ArgumentsHost,
    status,
    json,
  };
}

describe('ErrorsFilter', () => {
  it('formata ZodError como HTTP 400', async () => {
    const loggingService = {
      report: mock(async () => undefined),
    } as unknown as ILoggingService;
    const filter = new ErrorsFilter(undefined, loggingService);
    const { host, status, json } = createHost();

    await filter.catch(
      z.object({ name: z.string() }).safeParse({}).error!,
      host,
    );

    expect(status).toHaveBeenCalledWith(HttpStatus.BAD_REQUEST);
    expect(json).toHaveBeenCalledWith(
      expect.objectContaining({
        statusCode: HttpStatus.BAD_REQUEST,
        errors: expect.arrayContaining([
          expect.objectContaining({ field: 'name' }),
        ]),
      }),
    );
  });

  it('reporta erros internos via ILoggingService', async () => {
    const report = mock(async () => undefined);
    const loggingService = { report } as unknown as ILoggingService;
    const filter = new ErrorsFilter(undefined, loggingService);
    const { host, status, json } = createHost();
    const error = new Error('falha inesperada');

    await filter.catch(error, host);

    expect(report).toHaveBeenCalledWith(
      expect.objectContaining({
        error,
        packageName: expect.any(String),
        loggedUsername: expect.any(String),
      }),
    );
    expect(status).toHaveBeenCalledWith(HttpStatus.INTERNAL_SERVER_ERROR);
    expect(json).toHaveBeenCalledWith({
      statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
      message: 'Erro interno do servidor.',
    });
  });
});
