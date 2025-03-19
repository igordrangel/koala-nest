export class Failure<L, R> {
  readonly value: L

  constructor(value: L) {
    this.value = value
  }

  isFailure(): this is Failure<L, R> {
    return true
  }

  isOk(): this is Ok<L, R> {
    return false
  }
}

export class Ok<L, R> {
  readonly value: R

  constructor(value: R) {
    this.value = value
  }

  isFailure(): this is Failure<L, R> {
    return false
  }

  isOk(): this is Ok<L, R> {
    return true
  }
}

export type RequestResult<L, R> = Failure<L, R> | Ok<L, R>

export const failure = <L, R>(value: L): RequestResult<L, R> => {
  return new Failure(value)
}

export const ok = <L, R>(value: R): RequestResult<L, R> => {
  return new Ok(value)
}
