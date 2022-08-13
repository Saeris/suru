import { findConfig } from "../../heuristics/findConfig";
import { error, log } from "../../logging";
import { MODULELOCATION } from "../../types/module";
import { getConsumerRoot } from "../git";
import { importModule } from "../npm";

/**
 * Used to retrieve a Cosmiconfig Configuration file from the consumer's project.
 *
 * It will search from the current working directory upwards until it finds a matching
 * config.
 *
 * ### Parameters
 *
 * @param name Name of the tool of which you want to search for a corresponding config
 *
 * ### Returns
 *
 * A Promise resolving to the discovered config as a parsed JSON object. If no configuration
 * can be found, the command's default config is returned instead.
 */
export const loadLocalConfig = async <Config extends object>(
  name: string,
  defaultPath: string
): Promise<{ config?: Config; filepath?: string }> => {
  try {
    const result = await findConfig(name, { gitRoot: await getConsumerRoot() });
    if (result) {
      const { config, filepath } = result;
      log(`  Using configuration found in: ${filepath}`);
      return { config, filepath };
    }
    log(`  Unable to find a config for ${name} in project, loading a default for command instead`);
    const config = await importModule<Config>(defaultPath);
    const filepath = config[MODULELOCATION];
    return { config, filepath };
  } catch (err: unknown) {
    error(
      `  Unexpected error occurred while searching for a config for ${name}: \n\n    ${
        (err as Error).message
      }`
    );
    process.exit(1);
  }
};
