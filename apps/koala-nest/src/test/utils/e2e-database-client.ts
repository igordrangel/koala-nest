export abstract class E2EDatabaseClient {
  constructor(
    protected readonly url: string,
    protected readonly schemaName: string,
  ) {}

  abstract createDatabase(schemaName: string): Promise<void>
  abstract dropDatabase(): Promise<void>
}
