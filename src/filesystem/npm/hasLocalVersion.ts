import { HARDDEPENDENCIES } from "../../types/package";
import { loadManifest } from "./loadManifest";

/**
 * Checks the Consumer's local hard dependencies for the
 * existance of the given dependency
 * @param dependency The name of the dependency to check for
 * @returns `true` of the dependency is installed, `false` if it is not
 */
export const hasLocalVersion = async (dependency: string): Promise<boolean> => {
  const manifest = await loadManifest();
  return manifest[HARDDEPENDENCIES].has(dependency);
};
