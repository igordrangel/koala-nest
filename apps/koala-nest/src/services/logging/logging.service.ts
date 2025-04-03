import { Injectable } from '@nestjs/common'
import { ILoggingService, LoggingReportProps } from './ilogging.service'
import consola from 'consola'

@Injectable()
export class LoggingService implements ILoggingService {
  async report(data: LoggingReportProps): Promise<void> {
    consola.error(data.error)
  }
}
