import { Command, Option } from "clipanion";
import execa from "execa";
import { getTSConfig } from "../filesystem/config";
import { getPath } from "../filesystem/npm";
import { mapFlags, spinner } from "../utils";
import { loadCompilerOptions } from "../utils/ts";

export class Check extends Command {
  static paths = [[`check`]];
  // eslint-disable-next-line new-cap
  static usage = Command.Usage({
    description: `Typechecks all of the files in the current project`
  });

  // eslint-disable-next-line new-cap
  project = Option.String(`-p, --project`, {
    description: `The argument can be a file path to a valid JSON configuration file, or a directory path to a directory containing a tsconfig.json file`
  });

  // eslint-disable-next-line new-cap
  files = Option.Rest();

  async execute(): Promise<void> {
    const cwd = process.cwd();
    const project = await getTSConfig(cwd, this.project);
    const compilerOptions = mapFlags(loadCompilerOptions(project));
    const args = [`--noEmit`, ...this.files, ...compilerOptions.flat()];
    const checking = spinner(`Typechecking files...\n`).start();
    try {
      await execa.node(await getPath(`typescript/bin/tsc`), args, {
        env: { FORCE_COLOR: `true` },
        cwd,
        stdio: `inherit`
      });
      checking.succeed(`Typecheck complete`);
    } catch (err: unknown) {
      checking.fail(`Typecheck failed`);
      process.exit(1);
    }
  }
}
