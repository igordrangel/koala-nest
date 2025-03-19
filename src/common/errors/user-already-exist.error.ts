export class UserAlreadyExist extends Error {
  constructor(identifier: string) {
    super(`User ${identifier} already exists`)
  }
}
