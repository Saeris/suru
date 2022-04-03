import { existsSync } from "fs";
import { debug } from "../../logging";
import { getPath } from "../../filesystem/npm/getPath";

export const getTSConfig = async (cwd: string, userConfig?: string): Promise<string> => {
  if (userConfig) {
    const path = `${cwd}/${userConfig}`;
    debug(`   Using user supplied Typescript project from ${path}`);
    return getPath(path, true);
  }
  const projectConfig = `${cwd}/tsconfig.json`;
  if (existsSync(projectConfig)) {
    debug(`    Importing Typescript project from ${projectConfig}`);
    return getPath(projectConfig, true);
  }
  debug(`    Using default Typescript config`);
  return getPath(`../defaults/typescriptConfig`);
};
