export abstract class EventClass<TEventJob> {
  ocurredAt: Date = new Date()

  constructor(public eventJob: TEventJob) {}
}
