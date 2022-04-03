export const dependsOn = (matchList: string[]) => (dependencies: string[]): boolean =>
  dependencies.some((dependency) => matchList.includes(dependency));
