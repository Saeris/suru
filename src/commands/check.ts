import { Command, Flags } from "@oclif/core";
import execa from "execa";
import { getTSConfig } from "../filesystem/config";
import { getPath } from "../filesystem/npm";
import { mapFlags, spinner } from "../utils";
import { loadCompilerOptions } from "../utils/ts";

export class Check extends Command {
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
    const compilerOptions = mapFlags(loadCompilerOptions(project));
    const args = [`--noEmit`, ...argv, ...compilerOptions.flat()];
    const checking = spinner(`Typechecking files...\n`).start();
    await execa.node(await getPath(`typescript/bin/tsc`), args, {
      env: { FORCE_COLOR: `true` },
      cwd,
      stdio: `inherit`
    });
    checking.succeed(`Typecheck complete`);
  }
}
