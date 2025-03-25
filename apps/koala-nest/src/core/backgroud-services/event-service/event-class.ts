
export abstract class EventClass<TEntity = any> {
  ocurredAt: Date = new Date()

  constructor(public data?: TEntity) {}
}
