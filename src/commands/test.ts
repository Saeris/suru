import path from "path";
import { Command, Flags } from "@oclif/core";
import execa from "execa";
import { cosmiconfig } from "cosmiconfig";
import type { TransformOptions } from "@babel/core";
import babelConfig from "../defaults/babelConfig";
import type defaultJestConfig from "../defaults/jestConfig";
import { omit, mapFlags } from "../utils";
import { error, log } from "../logging";
import { getConfig } from "../filesystem/config";
import { getPath } from "../filesystem/npm";

export class Test extends Command {
  static description = `Runs Jest`;

  static strict = false;
  static flags = {
    help: Flags.help({ char: `h` }),
    config: Flags.string({
      char: `c`,
      description: `The path to a Jest config file specifying how to find and execute tests`
    }),
    useDefaults: Flags.boolean({
      description: `Forces the use of suru CLI's internal version of ESLint and it's default config. Useful for evaluating whether or not to migrate using \`suru lint:migrate\``
    })
  };

  modifyTransform = (): void => {};

  getBabelConfig = async (): Promise<TransformOptions | undefined> => {
    const findBabelConfig = cosmiconfig(`babel`);
    try {
      const result = await findBabelConfig.search();
      if (result) {
        const { config, filepath } = result;
        log(`Transforming test files using babel-jest with configuration found in: ${filepath}`);
        return config;
      }
      log(`Unable to find a Babel config, loading a default instead`);
      return babelConfig;
    } catch (err: unknown) {
      error(
        `Unexpected occurred while searching for a config for babel-jest: \n\n    ${
          (err as Error).message
        }`
      );
    }
  };

  async run(): Promise<void> {
    const cwd = process.cwd();
    const { flags: parsedFlags, argv } = await this.parse(Test);
    const { filepath } = await getConfig<typeof defaultJestConfig>(
      cwd,
      `jest`,
      path.join(__dirname, `../defaults/jestConfig`),
      Boolean(parsedFlags.useDefaults),
      parsedFlags.config
    );
    const options = mapFlags(
      Object.assign(omit(parsedFlags, [`help`, `useDefaults`]), {
        config: filepath
      })
    );
    const args = [...argv, ...options.flat()];
    log(`Running Jest tests...`);

    await execa.node(await getPath(`jest/bin/jest`, !parsedFlags.useDefaults), args, {
      env: { FORCE_COLOR: `true`, NODE_ENV: `test` },
      cwd,
      stdio: `inherit`
    });
  }
}
