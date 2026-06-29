export let e2eDatabaseUrl: string | undefined;
export let e2eSchemaName: string | undefined;

export function setE2EDatabaseContext(url: string, schemaName: string) {
  e2eDatabaseUrl = url;
  e2eSchemaName = schemaName;
  process.env.DATABASE_URL = url;
  process.env.DATABASE_SCHEMA = schemaName;
  process.env.NODE_ENV = 'test';
}
