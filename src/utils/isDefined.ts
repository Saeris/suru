/** Typeguard which checks if the given value is not undefined */
export const isDefined = <T>(val: T): val is Exclude<T, undefined> => typeof val !== `undefined`;
