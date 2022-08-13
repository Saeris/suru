import { log } from "../../logging";
import { MODULELOCATION } from "../../types/module";
import { importModule } from "../npm";
import { loadLocalConfig } from "./loadLocalConfig";

/**
 * Searches the filesystem for a configuration file using Cosmiconfig, conditionally
 * falling back to a default config if requested or a user's config cannot be found.
 *
 * @param cwd The current working directory from which to look for configs
 * @param name The name of the tool to load a configuration file for, eg: `babel` or `eslint`
 * @param useDefaults If true, skip searching for a user defined config and use the suru default instead.
 * This value typically comes from a CLI flag.
 * @param userConfig Path to a user defined configuration file. This value typically comes from a CLI flag. (Optional)
 */
export const getConfig = async <Config extends object>(
  cwd: string,
  name: string,
  defaultPath: string,
  useDefaults: boolean,
  userConfig?: string
): Promise<{ config?: Config; filepath?: string }> => {
  if (useDefaults) {
    log(`  Using default configuration for command`);
    const config = await importModule<Config>(defaultPath);
    const filepath = config[MODULELOCATION];
    return { config, filepath };
  }

  if (userConfig) {
    const moduleName = `${cwd}/${userConfig}`;
    log(`  Using user supplied config from ${moduleName}`);
    const config = await importModule<Config>(moduleName);
    const filepath = config[MODULELOCATION];
    return { config, filepath };
  }

  log(`  Using local configuration for command`);
  return loadLocalConfig(name, defaultPath);
};
