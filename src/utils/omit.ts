import { filterObject } from "./filterObject";

/**
 * Clones the object and returns a new object without the given keys.
 * @param obj The object to transform.
 * @param keys An array of keys belonging to the object to exclude.
 * Non-existant keys will be ignored.
 */
export const omit = <T extends Record<string, unknown>, K extends (string | number | symbol)[]>(
  obj: T = {} as T,
  keys: K = new Array() as K
): Pick<T, Exclude<keyof T, K[number]>> =>
  // Iterate only on the keys want to filter to keep the loop short
  keys.reduce(filterObject(keys), { ...obj });
