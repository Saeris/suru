/**
 * A reducer which can be used to filter keys from an object.
 *
 * @param keys A list of key names to include or exclude.
 * @param include Boolean which determines whether to keep or remove the keys.
 * (Optional, defaults to `false`, meaning the list of keys will be deleted)
 */
export const filterObject = (keys: (string | number | symbol)[], include = false) => <T>(prev: T, key: keyof T): T => {
  if (include ? !keys.includes(key) : keys.includes(key)) {
    // eslint-disable-next-line @typescript-eslint/no-dynamic-delete
    delete prev[key];
  }
  return prev;
};
