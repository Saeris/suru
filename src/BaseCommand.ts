import { Command } from "@oclif/core";
import ora from "ora";
import { findConfig } from "./heuristics/findConfig";
import type { PickKnown } from "./types";
import type { NormalizedCompilerOptions } from "./utils/ts";
import { normalizeCompilerOptions, loadCompilerOptions } from "./utils/ts";
import { log, error } from "./logging";
import { getPath, importModule } from "./filesystem/npm";
import { getConsumerRoot } from "./filesystem/git";
import type { ImportedModuleMeta } from "./types/module";
import { MODULELOCATION } from "./types/module";

export abstract class BaseCommand<C extends object = {}> extends Command {
  bin: string;
  defaultConfig?: Promise<C & ImportedModuleMeta>;
  /**
   * The resolved Typescript compiler options for the
   * consumer's project
   */
  #compilerOptions?: PickKnown<NormalizedCompilerOptions>;

  spinner = (
    text: string,
    { silent, prefix }: { silent?: boolean; prefix?: string } = {
      silent: false
    }
  ): ReturnType<typeof ora> =>
    ora({
      prefixText: prefix,
      text,
      isSilent: silent
    });

  /**
   * Searches dependencies for the path to the command's underlying CLI binary
   * @param useLocal - Search for a consumer's local binary to invoke, defaults
   * to suru's internal  version if one is not found
   * @returns The path to the requested binary
   */
  getBin = async (useLocal = false): Promise<string> => {
    if (!this.bin) {
      throw new Error(`Property 'bin' must be defined with a string path to a module's bin file`);
    }
    return getPath(this.bin, useLocal);
  };

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
  loadLocalConfig = async <
    Class extends BaseCommand,
    Config extends Awaited<Class["defaultConfig"]>
  >(
    name: string
  ): Promise<{ config?: Config; filepath?: string }> => {
    try {
      const result = await findConfig(name, { gitRoot: await getConsumerRoot() });
      if (result) {
        const { config, filepath } = result;
        log(`Using configuration found in: ${filepath}`);
        return { config, filepath };
      }
      log(`Unable to find a config for ${name} in project, loading a default for command instead`);
      const config = (await this.defaultConfig) as Config;
      const filepath = config?.[MODULELOCATION];
      return { config, filepath };
    } catch (err: unknown) {
      error(
        `Unexpected error occurred while searching for a config for ${name}: \n\n    ${
          (err as Error).message
        }`
      );
    }
  };

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
  getConfig = async <Config extends NonNullable<C>>(
    cwd: string,
    name: string,
    useDefaults: boolean,
    userConfig?: string
  ): Promise<{ config?: Config; filepath?: string }> => {
    if (useDefaults) {
      log(`  Using default configuration for command`);
      const config = (await this.defaultConfig) as Config;
      const filepath = config[MODULELOCATION];
      return { config, filepath };
    }

    if (userConfig) {
      const moduleName = `${cwd}/${userConfig}`;
      log(`   Using user supplied config from ${moduleName}`);
      const config = await importModule<Config>(moduleName);
      const filepath = config[MODULELOCATION];
      return { config, filepath };
    }

    log(`  Using local configuration for command`);
    return this.loadLocalConfig(name);
  };

  loadCompilerOptions = (project: string): PickKnown<NormalizedCompilerOptions> => {
    if (this.#compilerOptions) return this.#compilerOptions;
    const options = loadCompilerOptions(project);
    const normalized = normalizeCompilerOptions(options);
    this.#compilerOptions = normalized;
    return normalized;
  };
}
