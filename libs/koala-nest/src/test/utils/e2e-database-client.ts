export abstract class E2EDatabaseClient {
  constructor(
    protected readonly url: string,
    protected readonly schemaName: string,
  ) {}

  abstract createSchema(schemaName: string): Promise<void>;
  abstract dropSchema(): Promise<void>;
}
