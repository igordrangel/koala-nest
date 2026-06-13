export abstract class EventClass<TEntity = unknown> {
  ocurredAt: Date = new Date();

  constructor(public data?: TEntity) {}
}
