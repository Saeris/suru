import path from "path";

export const changeExtension = (filePath: string, ext: string): string =>
  // eslint-disable-next-line no-undefined
  path.format({ ...path.parse(filePath), base: undefined, ext });
