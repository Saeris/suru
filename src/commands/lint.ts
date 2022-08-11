import path from "path";
import { Command, Flags } from "@oclif/core";
import execa from "execa";
import semver from "semver";
import * as dependencies from "../dependencies";
import type defaultESLintConfig from "../defaults/eslintConfig";
import { VERSION } from "../types/module";
import { error, log } from "../logging";
import { getConfig } from "../filesystem/config";
import { getPath } from "../filesystem/npm";
import { stylishStats } from "../utils/eslint/stylishStats";

export class Lint extends Command {
  static description = `Lints the files in the current project`;

  static flags = {
    help: Flags.help({ char: `h` }),
    config: Flags.string({
      char: `c`,
      description: `Use this configuration, overriding .eslintrc.* config options if present`
    }),
    fix: Flags.boolean({
      description: `Automatically apply fixes for supported linting rules`
    }),
    quiet: Flags.boolean({
      description: `Report errors only - default: false`
    }),
    version: Flags.boolean({
      char: `v`,
      description: `Prints the semver version of the ESLint package that will be used to lint files.`
    }),
    useDefaults: Flags.boolean({
      description: `Forces the use of suru CLI's internal version of ESLint and it's default config. Useful for evaluating whether or not to migrate using \`suru lint:migrate\``
    })
  };

  // Allow a variable number of arguments
  static strict = false;
  static args = [
    {
      name: `files`,
      required: false,
      description: `list of glob patterns of files to lint`,
      default: `./**/src/**/*.{j,t}s?(x)`
    }
  ];

  async run(): Promise<void> {
    const cwd = process.cwd();
    const { flags: parsedFlags, argv } = await this.parse(Lint);
    const { ESLint, [VERSION]: version } = await dependencies.eslint();

    if (parsedFlags.version && version) {
      log(`Using ESLint v${version}`);
      return;
    }

    const { config } = await getConfig<typeof defaultESLintConfig>(
      cwd,
      `eslint`,
      path.join(__dirname, `../defaults/eslintConfig`),
      Boolean(parsedFlags.useDefaults),
      parsedFlags.config
    );

    if (version && semver.gt(`7.0.0`, version)) {
      log(`Older version of ESLint detected, invoking via CLI`);
      await execa.node(await getPath(`eslint/bin/eslint`, !parsedFlags.useDefaults), argv, {
        env: { FORCE_COLOR: `true` },
        cwd,
        stdio: `inherit`
      });
    } else {
      try {
        const eslint = new ESLint({
          cwd,
          cache: true,
          fix: parsedFlags.fix,
          baseConfig: config,
          // We explicitly set the config on the line above
          useEslintrc: false
        });
        //const formatter = await eslint.loadFormatter(`stylish`);
        const results = await eslint.lintFiles(argv);
        await ESLint.outputFixes(results);
        const resultText = await stylishStats(
          parsedFlags.quiet ? ESLint.getErrorResults(results) : results
        );
        log(resultText.split(`\n`).join(`\n    `));
      } catch (err: unknown) {
        error(
          `Failed to run command Lint, unexpected error encountered: ${(err as Error).message}`,
          { exit: 1 }
        );
      }
    }
  }
}
