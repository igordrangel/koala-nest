import { ILoggingService } from '../../services/logging/ilogging.service'

export class FakeLoggingService implements ILoggingService {
  async report(data) {
    console.log('FakeLoggingService.report', data)
  }
}
