export let e2eDatabaseUrl: string | undefined;

export function setE2EDatabaseUrl(url: string) {
  e2eDatabaseUrl = url;
  process.env.DATABASE_URL = url;
  process.env.NODE_ENV = 'test';
}
