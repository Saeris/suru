import { HARDDEPENDENCIES } from "../../types/package";
import { loadManifest } from "./loadManifest";

/**
 * Searches hard dependencies for the given dependency and
 * returns it's version if it exists
 * @param dependency The name of the dependency to check for
 * @returns A semver version `string` or null if not found
 */
export const getLocalVersion = async (dependency: string): Promise<string | null> => {
  const manifest = await loadManifest(dependency);
  // eslint-disable-next-line @typescript-eslint/prefer-nullish-coalescing
  return manifest[HARDDEPENDENCIES].get(dependency) || null;
};
