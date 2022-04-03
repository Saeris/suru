import { filterObject } from "./filterObject";

/**
 * Clones the object and returns a new object with only the given keys.
 * @param obj The object to transform.
 * @param keys An array of keys belonging to the object to include.
 * Non-existant keys will be ignored.
 */
export const pick = <T extends Record<string, unknown>, K extends (string | number | symbol)[]>(
  obj: T,
  keys: K = new Array() as K
): Omit<T, Extract<keyof T, K[number]>> =>
  // To pick from obj, we need to iterate over all of it's keys, deleted unwanted keys
  Object.keys(obj).reduce(filterObject(keys, true), { ...obj });
