export interface LoggingReportProps {
  loggedUsername: string
  packageName: string
  error: Error
  httpRequest?: {
    method: string
    endpoint: string
    queryParams?: string
    payload?: object
    statusCode: number
    response?: object
  }
}

export abstract class ILoggingService {
  abstract report(data: LoggingReportProps): Promise<void>
}
