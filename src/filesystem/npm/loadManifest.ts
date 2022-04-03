import { dirname } from "path";
import { analyzeProject } from "../../heuristics";
import { FILEPATH } from "../../types/jsonMeta";
import type { Package } from "../../types/package";
import { HARDDEPENDENCIES, HEURISTICS, PACKAGEROOT } from "../../types/package";
import { getConsumerRoot } from "../git/getConsumerRoot";
import { loadJson } from "../loadJson";
import { resolveAbsoluteFilepath } from "./resolveAbsoluteFilepath";

/**
 * A cache of all resolve package.json files
 *
 * Primarily this is the consumer's root package.json,
 * but it will also contain the package.json file for
 * every resolved module from the `import()` method
 */
const manifestCache: Map<string, Package> = new Map();

/**
 * Retrieves the `package.json` for the given module
 * @param moduleName Name of the module to retrieve a package manifest for
 */
export const loadManifest = async (
  moduleName: string = process.cwd(),
  {
    local = moduleName === process.cwd(),
    refresh = false,
    baseDir
  }: { local?: boolean; refresh?: boolean; baseDir?: string } = {}
): Promise<Package> => {
  const name = `${moduleName}:${local ? `local` : `internal`}`;
  try {
    if (manifestCache.has(name) && !refresh) {
      return manifestCache.get(name)!;
    }
    const consumerRoot = await getConsumerRoot();
    const absFilePath = await resolveAbsoluteFilepath(moduleName, baseDir);
    if (!absFilePath) {
      throw new Error(`Could not resolve a path for ${moduleName}/package.json`);
    }
    const manifest = await loadJson<Package>(absFilePath);
    const hardDependencies = new Map([
      ...Object.entries(manifest.dependencies ? manifest.dependencies : {}),
      ...Object.entries(manifest.devDependencies ? manifest.devDependencies : {})
    ]);
    manifest[HARDDEPENDENCIES] = hardDependencies;
    // Need to check for Yarn cache here as well
    const isNodeModule = absFilePath.includes(`/node_modules/`);
    const dependenciesToCheck = [...hardDependencies.keys()];
    const heuristics = await analyzeProject(
      isNodeModule ? absFilePath : consumerRoot,
      dependenciesToCheck
    );
    manifest[HEURISTICS] = heuristics;
    manifest[PACKAGEROOT] = dirname(manifest[FILEPATH]!);
    return manifestCache.set(name, manifest).get(name)!;
  } catch (err: unknown) {
    throw Error(`Error loading manifest for ${name}: ${(err as Error).message}`);
  }
};
