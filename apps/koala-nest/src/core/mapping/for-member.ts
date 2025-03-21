export type ForMemberResult<TTarget, TSource> = {
  [Key in keyof TTarget]: (source: TSource) => TTarget[Key]
}

export type ForMemberDefinition<TTarget, TSource> = Array<
  Partial<ForMemberResult<TTarget, TSource>>
>

export function forMember<TTarget, TSource>(
  targetProp: keyof TTarget,
  map: (source: TSource) => TTarget[keyof TTarget],
): Partial<ForMemberResult<TTarget, TSource>> {
  return {
    [targetProp]: map,
  } as Partial<ForMemberResult<TTarget, TSource>>
}
