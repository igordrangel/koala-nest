export type ObjectClassProps<T> = {
  [K in keyof T as T[K] extends Function ? never : K]: T[K];
};

export abstract class ObjectClass<T = object> {
  declare protected readonly _propsType?: ObjectClassProps<T>;

  static from<This extends new () => object>(
    this: This,
    props: ObjectClassProps<InstanceType<This>>,
  ): InstanceType<This> {
    return Object.assign(new this(), props) as InstanceType<This>;
  }
}
