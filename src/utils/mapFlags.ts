import type { Mutable, ExcludeValues, IncludeValues, ExtractKeysOfValueType, Entries, ToString } from "../types";

/** Removes properties with values that are empty strings (`""`) or nullish values from the object `T`  */
type WithoutEmpty<T> = Mutable<ExcludeValues<T, "" | undefined | null>>;

/** Creates a union of key:value pairs made up of all properties in object `T` with a string-like value */
type StringLikeEntries<T> = Entries<IncludeValues<WithoutEmpty<T>, string | number | (string | number)[]>>;

/** Creates a union of all property keys from object `T` that have a boolean value */
type BooleanKeys<T, U extends boolean = boolean> = ExtractKeysOfValueType<T, U> & string;

type FlagKey<K extends string> = `--${K}`; // K = foo | bar | baz => --foo | --bar | --baz

/** Creates a union of stringified key:value pairs from the string-like properties in object `T` */
type StringFlags<T> = T extends [key: string, value: string | number | (string | number)[]]
  ? [FlagKey<T[0]>, ToString<T[1]>]
  : never;

/** Creates a union of stringified boolean flags from the bolean properties of object `T` */
type BooleanFlags<T> = FlagKey<BooleanKeys<T, true>> | BooleanKeys<T, false> extends never
  ? never
  : [FlagKey<BooleanKeys<T, false>>, `false`];

/** Used to transform a configuration object into an array of CLI flags */
export const mapFlags = <
  T extends Record<
    string,
    string | number | (string | number)[] | readonly (string | number)[] | boolean | undefined | null
  >
>(
  options: T = {} as T
): (StringFlags<StringLikeEntries<T>[number]> | BooleanFlags<T>)[] => {
  const args: (StringFlags<StringLikeEntries<T>[number]> | BooleanFlags<T>)[] = [];
  for (const [key, value] of Object.entries(options)) {
    if (
      // value is an non-empty string
      (typeof value === `string` && value.length) ||
      // or is an array of strings or numbers
      (Array.isArray(value) && (typeof value[0] === `string` || typeof value[0] === `number`)) ||
      // or is a number
      typeof value === `number`
    ) {
      const strValue = Array.isArray(value)
        ? value.reduce<string>((prev, curr) => {
            // Skip casting to String if the current value is nullish or empty string
            if (typeof curr === `undefined` || (curr as string | number | null) === null || curr === ``) {
              return prev;
            }
            // convert the value to a string
            const str = String(curr);
            // if prev is a non-empty string, add a comma and join
            return `${prev}${prev.length ? `,` : ``}${str}`;
          }, ``)
        : String(value);
      // and if our stringified flag parameter is a non-empty string
      if (strValue) {
        // Add it to our list of flags
        args.push([`--${key}`, strValue] as StringFlags<StringLikeEntries<T>[number]>);
      }
    }

    if (typeof value === `boolean`) {
      args.push((value ? `--${key}` : [`--${key}`, `false`]) as BooleanFlags<T>);
    }
    // any other value types will be omitted
  }
  return args;
};
