export abstract class RouterConfigBase {
  protected constructor(
    private readonly _tag: string,
    private readonly _group: string,
  ) {}

  get group() {
    return this._group
  }

  get tag() {
    return this._tag
  }
}
