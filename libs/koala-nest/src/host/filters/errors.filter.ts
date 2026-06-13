import { FilterRequestParams } from '@/core/utils/filter-request-params';
import {
  formatTypeOrmError,
  isTypeOrmError,
} from '@/core/utils/format-typeorm-error';
import { formatZodError, ZodFieldError } from '@/core/utils/format-zod-error';
import { ILoggingService } from '@/domain/common/ilogging.service';
import { reportErrorToLogging } from '@/core/utils/report-error';
import {
  ArgumentsHost,
  Catch,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { BaseExceptionFilter, AbstractHttpAdapter } from '@nestjs/core';
import { ZodError } from 'zod';

interface ErrorResponse {
  statusCode: HttpStatus;
  message: string;
  errors?: ZodFieldError[];
}

@Catch()
export class ErrorsFilter extends BaseExceptionFilter {
  private readonly logger = new Logger(ErrorsFilter.name);

  constructor(
    httpAdapter: AbstractHttpAdapter | undefined,
    private readonly loggingService: ILoggingService,
  ) {
    super(httpAdapter);
  }

  private handleZodError(exception: ZodError): ErrorResponse {
    const formatted = formatZodError(exception);

    return {
      statusCode: HttpStatus.BAD_REQUEST,
      message: formatted.message,
      errors: formatted.errors,
    };
  }

  private handleTypeOrmError(exception: Error): ErrorResponse {
    const formatted = formatTypeOrmError(exception);

    return {
      statusCode: formatted.statusCode,
      message: formatted.message,
      errors: formatted.errors,
    };
  }

  private sendErrorResponse(host: ArgumentsHost, errorResponse: ErrorResponse) {
    return FilterRequestParams.get(host)
      .response.status(errorResponse.statusCode)
      .json(errorResponse);
  }

  private async reportError(error: Error, host: ArgumentsHost): Promise<void> {
    const { loggedUserName } = FilterRequestParams.get(host);

    try {
      await reportErrorToLogging(
        this.loggingService,
        error,
        loggedUserName || undefined,
      );
    } catch {
      this.logger.error(error.message, error.stack);
    }
  }

  async catch(exception: unknown, host: ArgumentsHost) {
    if (exception instanceof ZodError) {
      return this.sendErrorResponse(host, this.handleZodError(exception));
    }

    if (exception instanceof Error && isTypeOrmError(exception)) {
      return this.sendErrorResponse(host, this.handleTypeOrmError(exception));
    }

    if (exception instanceof HttpException) {
      return super.catch(exception, host);
    }

    const error =
      exception instanceof Error ? exception : new Error(String(exception));

    await this.reportError(error, host);

    return this.sendErrorResponse(host, {
      statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
      message: 'Erro interno do servidor.',
    });
  }
}
