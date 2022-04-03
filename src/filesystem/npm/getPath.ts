import { debug, log } from "../../logging";
import { resolveFrom } from "./resolveFrom";
import { getConsumerRoot } from "../git/getConsumerRoot";

/**
 * Resolves the path to a module
 * @param moduleName Name of the module to resolve
 * @param useLocal Resolve relative to the Consumer's package.json,
 * defaults to suru's internal version if not found (Default: false)
 */
export const getPath = async (moduleName: string, useLocal: boolean = false): Promise<string> => {
  try {
    try {
      const paths = require.resolve.paths(moduleName) ?? [];
      if (useLocal) {
        try {
          return resolveFrom(await getConsumerRoot(), moduleName);
        } catch {
          debug(
            `Could not resolve module ${moduleName} locally, attempting to resolve internally instead`
          );
          log(`${moduleName} ${String(useLocal)}`);
          return require.resolve(`${moduleName}/package.json`, { paths });
        }
      }
      return require.resolve(`${moduleName}/package.json`, { paths });
    } catch {
      debug(
        `Could not resolve module ${moduleName}'s package.json, attempting to resolve package entrypoint instead`
      );
      // eslint-disable-next-line no-undefined
      return require.resolve(moduleName);
    }
  } catch (err: unknown) {
    throw new Error(
      `Unable to resolve a path to module "${moduleName}": ${(err as Error).message}`
    );
  }
};
