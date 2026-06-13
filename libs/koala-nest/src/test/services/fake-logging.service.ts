import {
  ILoggingService,
  LoggingReportProps,
} from '@/domain/common/ilogging.service';

export class FakeLoggingService implements ILoggingService {
  reports: LoggingReportProps[] = [];

  report(data: LoggingReportProps): Promise<void> {
    this.reports.push(data);
    return Promise.resolve();
  }
}
