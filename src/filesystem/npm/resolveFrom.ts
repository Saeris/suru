/* eslint-disable no-console */
import path from "path";
import Module from "module";
import fs from "fs";

export interface ModuleInternals {
  _resolveFilename(
    request: string,
    parent: { id: string; filename: string; paths: string[] }
  ): string;
  _nodeModulePaths(from: string): string[];
}

interface NotFoundError extends Error {
  code: string;
}

/**
 * Attempts to resolve a filepath to the given Module relative to the given
 * directory. Behaves similar to Node's `require.resolve()`.
 *
 * @param fromDirectory The directory from which to attempt module resolution.
 * @param moduleName The ID of the module to resolve.
 */
export const resolveFrom = (fromDirectory: string, moduleName: string): string => {
  let directory: string = fromDirectory;
  try {
    directory = fs.realpathSync(directory);
  } catch (error: unknown) {
    if ((error as NotFoundError).code === `ENOENT`) {
      directory = path.resolve(directory);
    } else {
      throw error;
    }
  }

  const paths = (Module as unknown as ModuleInternals)._nodeModulePaths(directory);
  try {
    return require.resolve(moduleName, { paths });
  } catch (err: unknown) {
    throw new Error(`Module ${moduleName} could not be resolved from ${fromDirectory}`);
  }
};
