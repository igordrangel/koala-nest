export abstract class EventClass<TEntity> {
  ocurredAt: Date = new Date()

  constructor(public data: TEntity) {}
}
