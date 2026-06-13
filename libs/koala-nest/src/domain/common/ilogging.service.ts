export interface LoggingReportProps {
  loggedUsername: string;
  packageName: string;
  error: Error;
}

export abstract class ILoggingService {
  abstract report(data: LoggingReportProps): Promise<void>;
}
