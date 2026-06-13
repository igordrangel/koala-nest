import {
  ILoggingService,
  LoggingReportProps,
} from '@/domain/common/ilogging.service';
import { Injectable, Logger } from '@nestjs/common';

@Injectable()
export class LoggingService implements ILoggingService {
  private readonly logger = new Logger(LoggingService.name);

  report(data: LoggingReportProps): Promise<void> {
    this.logger.error(
      `[${data.packageName}] ${data.loggedUsername}: ${data.error.message}`,
      data.error.stack,
    );

    return Promise.resolve();
  }
}
