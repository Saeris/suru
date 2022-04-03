import { toCamelCase } from "../../utils";

export const moduleNameToPascalCase = (name: string): string => {
  const match = /^@(?<scope>[a-z\d][\w-.]+)\/(?<pkgName>[a-z\d][\w-.]*)$/.exec(name);
  if (match?.groups) {
    return `${toCamelCase(match.groups.scope)}__${toCamelCase(match.groups.pkgName)}`;
  }
  return toCamelCase(name);
};
