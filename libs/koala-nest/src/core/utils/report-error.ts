import packageJson from '../../../package.json';
import { ILoggingService } from '@/domain/common/ilogging.service';

export async function reportErrorToLogging(
  loggingService: ILoggingService,
  error: Error,
  loggedUsername?: string,
): Promise<void> {
  try {
    await loggingService.report({
      error,
      packageName: packageJson.name,
      loggedUsername: loggedUsername ?? 'system',
    });
  } catch {
    console.error(error);
  }
}
