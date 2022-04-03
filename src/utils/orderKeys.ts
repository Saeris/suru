export const orderKeys = <T extends object>(obj: T): T =>
  // eslint-disable-next-line @typescript-eslint/require-array-sort-compare
  Object.keys(obj)
    .sort()
    .reduce(
      (acc, key) => ({
        ...acc,
        [key]: obj[key]
      }),
      {}
    ) as T;
