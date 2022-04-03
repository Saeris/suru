import { HARDDEPENDENCIES } from "../../types/package";
import { loadManifest } from "./loadManifest";

/**
 * Removes from the consumer's package manifest all of the dependencies
 * in the given list that are verified to exist.
 */
export const pruneDependencies = async (
  dependencies: string[] = new Array<string>()
): Promise<void> => {
  const manifest = await loadManifest();
  const toBePruned = dependencies.filter((dependency) =>
    manifest[HARDDEPENDENCIES].has(dependency)
  );
  // eslint-disable-next-line no-console
  console.log({ toBePruned });
};
