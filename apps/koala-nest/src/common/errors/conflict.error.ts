export class ConflictError extends Error {
  constructor(identifier: string) {
    super(`O registro ${identifier} já existe.`)
  }
}
