import { z } from 'zod';

const OAUTH2_ENV_FIELD = {
  DOMAIN: 'domain',
  CLIENT_ID: 'clientId',
  CLIENT_SECRET: 'clientSecret',
  SCOPE: 'scope',
  REDIRECT_PATH: 'redirectPath',
  AUTHORIZATION_URL: 'authorizationUrl',
  TOKEN_URL: 'tokenUrl',
  USERINFO_URL: 'userInfoUrl',
} as const;

const OAUTH2_ENV_PATTERN =
  /^OAUTH2_([A-Z0-9_]+)_(DOMAIN|CLIENT_ID|CLIENT_SECRET|SCOPE|REDIRECT_PATH|AUTHORIZATION_URL|TOKEN_URL|USERINFO_URL)$/;

export const oauth2ProviderEnvEntrySchema = z.object({
  domain: z.string().optional(),
  clientId: z.string().optional(),
  clientSecret: z.string().optional(),
  scope: z.string().optional(),
  redirectPath: z.string().optional(),
  authorizationUrl: z.string().optional(),
  tokenUrl: z.string().optional(),
  userInfoUrl: z.string().optional(),
});

export type OAuth2ProviderEnvEntry = z.infer<
  typeof oauth2ProviderEnvEntrySchema
>;

export function parseOAuth2ProviderEnv(
  config: Record<string, unknown>,
): Record<string, OAuth2ProviderEnvEntry> {
  const providers: Record<string, OAuth2ProviderEnvEntry> = {};

  for (const [key, value] of Object.entries(config)) {
    if (typeof value !== 'string' || !value) {
      continue;
    }

    const match = key.match(OAUTH2_ENV_PATTERN);

    if (!match) {
      continue;
    }

    const providerKey = match[1].toLowerCase();
    const field = OAUTH2_ENV_FIELD[match[2] as keyof typeof OAUTH2_ENV_FIELD];

    providers[providerKey] ??= {};
    providers[providerKey][field] = value;
  }

  return providers;
}
