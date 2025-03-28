import { Injectable } from '@nestjs/common'
import { ILoggingService, LoggingReportProps } from './ilogging.service'
import { EnvService } from '@koalarx/nest/env/env.service'

@Injectable()
export class LoggingService implements ILoggingService {
  constructor(private readonly envService: EnvService) {}

  async report(data: LoggingReportProps): Promise<void> {
    console.log(JSON.stringify({ ...data, error: undefined }, null, 2))
    console.error(data.error)
  }
}
