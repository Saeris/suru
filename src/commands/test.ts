import path from "path";
import { Command, Option } from "clipanion";
import execa from "execa";
import { cosmiconfig } from "cosmiconfig";
import type { TransformOptions } from "@babel/core";
import babelConfig from "../defaults/babelConfig";
import type defaultJestConfig from "../defaults/jestConfig";
import { mapFlags } from "../utils";
import { error, log } from "../logging";
import { getConfig } from "../filesystem/config";
import { getPath } from "../filesystem/npm";

export class Test extends Command {
  static paths = [[`test`]];
  // eslint-disable-next-line new-cap
  static usage = Command.Usage({
    description: `Runs Jest`
  });

  config = Option.String(`-c, --config`, {
    description: `The path to a Jest config file specifying how to find and execute tests`
  });

  useDefaults = Option.Boolean(`-d, --useDefaults`, {
    description: `Forces the use of suru CLI's internal version of ESLint and it's default config.`
  });

  // eslint-disable-next-line new-cap
  files = Option.Rest();

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
      process.exit(1);
    }
  };

  async execute(): Promise<void> {
    const cwd = process.cwd();
    const { filepath } = await getConfig<typeof defaultJestConfig>(
      cwd,
      `jest`,
      path.join(__dirname, `../defaults/jestConfig`),
      Boolean(this.useDefaults),
      this.config
    );
    const options = mapFlags({
      config: filepath
    });
    const args = [...this.files, ...options.flat()];
    log(`Running Jest tests...`);

    try {
      await execa.node(await getPath(`jest/bin/jest`, !this.useDefaults), args, {
        env: { FORCE_COLOR: `true`, NODE_ENV: `test` },
        cwd,
        stdio: `inherit`
      });
    } catch (err: unknown) {
      process.exit(1);
    }
  }
}
