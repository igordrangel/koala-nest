import { Injectable } from '@nestjs/common'
import { ILoggingService, LoggingReportProps } from './ilogging.service'

@Injectable()
export class LoggingService implements ILoggingService {
  async report(data: LoggingReportProps): Promise<void> {
    console.log(JSON.stringify({ ...data, error: undefined }, null, 2))
    console.error(data.error)
  }
}
