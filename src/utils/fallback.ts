type FallbackArrayVal<
  T extends Record<PropertyKey, unknown>,
  K extends PropertyKey,
  V
> = T[K] extends [infer U] ? U | V : V;
type FallbackReturn<T extends Record<PropertyKey, unknown>, K extends PropertyKey, V> = T & {
  [key in K]: FallbackArrayVal<T, K, V>[];
};

// Unfortunately, even with the Type Predicate return, Typescript doesn't recognize that obj has been mutated
export const fallback = <T extends Record<PropertyKey, unknown>, K extends PropertyKey, V>(
  obj: T,
  key: K,
  val: V
): obj is FallbackReturn<T, K, V> => {
  type U = FallbackArrayVal<T, K, V>;
  ((obj[key] as U[] | undefined) ??= new Array<U>()).push(val as U);
  return true;
};
