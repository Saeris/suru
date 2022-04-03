export const scopeToSnakeCase = (name: string): string => {
  const match = /^@(?<scope>[a-z\d][\w-.]+)\/(?<pkgName>[a-z\d][\w-.]*)$/.exec(name);
  if (match?.groups) {
    return `${match.groups.scope}__${match.groups.pkgName}`;
  }
  return name;
};
