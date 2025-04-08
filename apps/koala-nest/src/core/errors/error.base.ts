export abstract class ErrorBase extends Error {
  constructor(message: string, public readonly data?: any) {
    super(message)
  }
}
