import { HARDDEPENDENCIES } from "../../types/package";
import { loadManifest } from "./loadManifest";

/**
 * Returns a Map of the consumer's locally installed `dependencies`
 * and `devDependencies`, otherwise known as their project's Hard
 * Dependencies.
 */
export const getInstalledDependencies = async (): Promise<Map<string, unknown>> => {
  const manifest = await loadManifest();
  return manifest[HARDDEPENDENCIES];
};
