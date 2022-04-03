import { difference } from "../../utils";
import { getInstalledDependencies } from "./getInstalledDependencies";

export const diffDependencies = async (
  dependencies: Iterable<string> = new Array<string>()
): Promise<string[]> => {
  const dependenciesToCheck = new Set(dependencies);
  const installedDependencies = await getInstalledDependencies();
  const diff = difference(installedDependencies, dependenciesToCheck);
  // eslint-disable-next-line no-console
  console.log({ dependenciesToCheck, installedDependencies, diff });
  return diff;
};
