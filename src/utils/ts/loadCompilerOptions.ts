import path from "path";
import ts from "typescript";

/**
 * Used to load the Typescript Compiler Options for a given project. First
 * it will load the `tsconfig.json` file, then it will try to resolve all
 * of the configs which it extends, which will result in the final list of
 * compiler options.
 *
 * @param project An absolute filepath for a Typescript `tsconfig.json` file.
 */
export const loadCompilerOptions = (project: string): ts.CompilerOptions => {
  const baseDir = path.dirname(project); //?
  const fileName = path.basename(project); //?
  const tsconfigPath = ts.findConfigFile(baseDir, ts.sys.fileExists.bind(null), fileName);

  if (!tsconfigPath) {
    throw new Error(`Unable to find a configuration file in path ${baseDir} named: ${fileName}`);
  }

  const { config, error } = ts.readConfigFile(tsconfigPath, ts.sys.readFile.bind(null));

  if (error) {
    // eslint-disable-next-line no-console
    console.debug({ error });
    throw new Error(`Error reading typescript configration: ${fileName}`);
  }

  const { options } = ts.parseJsonConfigFileContent(config, ts.sys, baseDir);

  return options;
};
