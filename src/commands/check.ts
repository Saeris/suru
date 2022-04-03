import { Flags } from "@oclif/core";
import execa from "execa";
import { BaseCommand } from "../BaseCommand";
import { mapFlags } from "../utils";
import { getTSConfig } from "../utils/ts";

export class Check extends BaseCommand {
  bin = `typescript/bin/tsc`;

  static description = `Typechecks all of the files in the current project`;

  static strict = false;

  static flags = {
    help: Flags.help({ char: `h` }),
    project: Flags.string({
      char: `p`,
      description: `The argument can be a file path to a valid JSON configuration file, or a directory path to a directory containing a tsconfig.json file`
    })
  };

  static args = [
    {
      name: `files`,
      required: false,
      description: `list of glob patterns of files to lint`
    }
  ];

  async run(): Promise<void> {
    const cwd = process.cwd();
    const { flags: parsedFlags, argv } = await this.parse(Check);
    const project = await getTSConfig(cwd, parsedFlags.project);
    const compilerOptions = mapFlags(this.loadCompilerOptions(project));
    const args = [`--noEmit`, ...argv, ...compilerOptions.flat()];
    const spinner = this.spinner(`Typechecking files...\n`).start();
    await execa.node(await this.getBin(), args, {
      env: { FORCE_COLOR: `true` },
      cwd,
      stdio: `inherit`
    });
    spinner.succeed(`Typecheck complete`);
  }
}
