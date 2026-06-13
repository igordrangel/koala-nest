import { KoalaGlobalVars } from '@/core/koala-global-vars';
import { ILoggingService } from '@/domain/common/ilogging.service';

export async function reportErrorToLogging(
  loggingService: ILoggingService,
  error: Error,
  loggedUsername?: string,
): Promise<void> {
  try {
    await loggingService.report({
      error,
      packageName: KoalaGlobalVars.appName,
      loggedUsername: loggedUsername || KoalaGlobalVars.internalUserName,
    });
  } catch {
    console.error(error);
  }
}
