import path from "path";
import { Flags } from "@oclif/core";
import execa from "execa";
import { cosmiconfig } from "cosmiconfig";
import type { TransformOptions } from "@babel/core";
import babelConfig from "../defaults/babelConfig";
import type defaultJestConfig from "../defaults/jestConfig";
import { omit, mapFlags } from "../utils";
import { BaseCommand } from "../BaseCommand";
import { error, log } from "../logging";
import { importModule } from "../filesystem/npm";

export class Test extends BaseCommand<typeof defaultJestConfig> {
  bin = `jest/bin/jest`;

  constructor(argv: string[], config: BaseCommand["config"]) {
    super(argv, config);
    this.defaultConfig = importModule(path.join(__dirname, `../defaults/jestConfig`));
  }

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
    const { filepath } = await this.getConfig(
      cwd,
      `jest`,
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

    await execa.node(await this.getBin(!parsedFlags.useDefaults), args, {
      env: { FORCE_COLOR: `true`, NODE_ENV: `test` },
      cwd,
      stdio: `inherit`
    });
  }
}
