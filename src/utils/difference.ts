import type { Difference, Unwrap } from "../types";

/**
 * Computes the set difference of two arrays (subtracts B from A)
 * @param source - A the set to be subtracted from
 * @param excluded - B the set whose elements will be subtracted from A
 * @returns A tuple with all unique elements of A minus the unique elements of B
 */
export const difference = <A extends Iterable<unknown>, B extends Iterable<unknown>>(
  source: A,
  excluded: B
): Difference<A, B> => {
  type U = Unwrap<A>;
  type V = Unwrap<B>;
  return [
    ...new Set<Exclude<V, U>>(
      [...new Set<V>(excluded as Iterable<V>)].filter(
        (dependency) => !new Set<U>(source as Iterable<U>).has((dependency as unknown) as U)
      ) as Exclude<V, U>[]
    )
  ] as Difference<A, B>;
};
