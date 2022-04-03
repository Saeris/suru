import semver from "semver";
import { getInstalledDependencies } from "./getInstalledDependencies";

/**
 * Diffs the consumer's local Hard Dependencies against a Map of
 * required dependency names and their minimum versions. If a
 * dependency in `requiredVersionsMap` does not exist in the
 * consumer's Hard Dependencies, or it exists but does not meet
 * the minimum version required, the name of each of those
 * dependencies will be returned in the result array.
 *
 * The resulting list can then be used to determine which
 * dependencies need to be upgraded or installed.
 *
 * @param requiredVersionsMap A Map consisting of dependency name
 * and minimum version string pairs.
 */
export const getDependenciesToUpdate = async (
  requiredVersionsMap: Map<string, string> = new Map<string, string>()
): Promise<string[]> => {
  const installedDependencies = await getInstalledDependencies();
  const toUpdate = [...requiredVersionsMap].reduce((list, [dependency, range]) => {
    const installed = installedDependencies.get(dependency);
    if (!installed) {
      // Required dependency is not installed
      list.add(dependency);
    } else if (!semver.satisfies(semver.minVersion(installed as string)!, range)) {
      // Required dependency needs to be updated
      list.add(dependency);
    }
    return list;
  }, new Set<string>());
  return [...toUpdate];
};
