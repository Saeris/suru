import path from "path";
import { Command, Option } from "clipanion";
import execa from "execa";
import semver from "semver";
import * as dependencies from "../dependencies";
import type defaultESLintConfig from "../defaults/eslintConfig";
import { VERSION } from "../types/module";
import { log } from "../logging";
import { getConfig } from "../filesystem/config";
import { getPath } from "../filesystem/npm";
import { stylishStats } from "../utils/eslint/stylishStats";
import { spinner } from "../utils";

export class Lint extends Command {
  static paths = [[`lint`]];
  // eslint-disable-next-line new-cap
  static usage = Command.Usage({
    description: `Lints the files in the current project`
  });

  config = Option.String(`-c, --config`, {
    description: `Use this configuration, overriding .eslintrc.* config options if present`
  });

  fix = Option.Boolean(`-f, --fix`, {
    description: `Automatically apply fixes for supported linting rules`
  });

  quiet = Option.Boolean(`-q, --quiet`, {
    description: `Report errors only - default: false`
  });

  useDefaults = Option.Boolean(`-d, --useDefaults`, {
    description: `Forces the use of suru CLI's internal version of ESLint and it's default config. Useful for evaluating whether or not to migrate using \`suru lint:migrate\``
  });

  version = Option.Boolean(`-v, --version`, {
    description: `Prints the semver version of the ESLint package that will be used to lint files.`
  });

  // eslint-disable-next-line new-cap
  files = Option.Rest();

  async execute(): Promise<void> {
    const cwd = process.cwd();
    const argv = this.files.length ? this.files : [`./**/src/**/*.{j,t}s?(x)`];
    const linting = spinner(`Linting files...\n`).start();
    const { ESLint, [VERSION]: version } = await dependencies.eslint();

    if (this.version && version) {
      log(`Using ESLint v${version}`);
      return;
    }

    const { config } = await getConfig<typeof defaultESLintConfig>(
      cwd,
      `eslint`,
      path.join(__dirname, `../defaults/eslintConfig`),
      Boolean(this.useDefaults),
      this.config
    );

    if (version && semver.gt(`7.0.0`, version)) {
      log(`Older version of ESLint detected, invoking via CLI`);
      try {
        await execa.node(await getPath(`eslint/bin/eslint`, !this.useDefaults), argv, {
          env: { FORCE_COLOR: `true` },
          cwd,
          stdio: `inherit`
        });
        linting.succeed(`Linting complete`);
      } catch (err: unknown) {
        linting.fail(
          `Failed to run command Lint, unexpected error encountered: ${(err as Error).message}`
        );
        process.exit(1);
      }
    } else {
      try {
        const eslint = new ESLint({
          cwd,
          cache: true,
          fix: this.fix,
          baseConfig: config,
          // We explicitly set the config on the line above
          useEslintrc: false
        });
        //const formatter = await eslint.loadFormatter(`stylish`);
        const results = await eslint.lintFiles(argv);
        await ESLint.outputFixes(results);
        const resultText = await stylishStats(
          this.quiet ? ESLint.getErrorResults(results) : results
        );
        log(resultText.split(`\n`).join(`\n    `));
        linting.succeed(`Linting complete`);
      } catch (err: unknown) {
        linting.fail(
          `Failed to run command Lint, unexpected error encountered: ${(err as Error).message}`
        );
        process.exit(1);
      }
    }
  }
}
