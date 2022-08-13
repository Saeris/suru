import path from "path";
import { findConfigFile, readConfigFile, parseJsonConfigFileContent, sys } from "typescript";
import { debug } from "../../logging";
import type { PickKnown } from "../../types";
import type { NormalizedCompilerOptions } from "./normalizeCompilerOptions";
import { normalizeCompilerOptions } from "./normalizeCompilerOptions";

/**
 * Used to load the Typescript Compiler Options for a given project. First
 * it will load the `tsconfig.json` file, then it will try to resolve all
 * of the configs which it extends, which will result in the final list of
 * compiler options.
 *
 * @param project An absolute filepath for a Typescript `tsconfig.json` file.
 */
export const loadCompilerOptions = (project: string): PickKnown<NormalizedCompilerOptions> => {
  const baseDir = path.dirname(project); //?
  const fileName = path.basename(project); //?
  const tsconfigPath = findConfigFile(baseDir, sys.fileExists.bind(null), fileName);

  if (!tsconfigPath) {
    throw new Error(`Unable to find a configuration file in path ${baseDir} named: ${fileName}`);
  }

  const { config, error } = readConfigFile(tsconfigPath, sys.readFile.bind(null));

  if (error) {
    // eslint-disable-next-line no-console
    debug({ error });
    throw new Error(`Error reading typescript configration: ${fileName}`);
  }

  const { options } = parseJsonConfigFileContent(config, sys, baseDir);

  return normalizeCompilerOptions(options);
};
