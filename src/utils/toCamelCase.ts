export const toCamelCase = (str: string): string =>
  str.replace(/[^A-Z0-9]+/gi, `_`).replace(/_(?<char>[a-z])/gi, (g) => g[1].toUpperCase());
