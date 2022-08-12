import path from "path";
import { Command, Option } from "clipanion";
import execa from "execa";
import chalk from "chalk";
import inquirer from "inquirer";
import {
  filterFilesByExtensions,
  findFilesByExtension,
  findJSXFiles,
  changeExtension
} from "../filesystem";
import {
  getConsumerRoot,
  getDirtyFiles,
  getNewUntrackedFiles,
  isWorkingDirClean
} from "../filesystem/git";
import { loadManifest } from "../filesystem/npm";
import { error } from "../logging";
import { spinner } from "../utils";

export class Convert extends Command {
  static paths = [[`convert`]];
  // eslint-disable-next-line new-cap
  static usage = Command.Usage({
    description: `Changes file extensions on project files to their Typescript equivalents using "git mv", preserving commit history`
  });

  ignore = Option.String(`-i, --ignore`, ``, {
    description: `A comma separated list of glob patterns to ignore`
  });

  dryRun = Option.Boolean(`--dryRun`, {
    description: `Outputs a list of files to be renamed only`
  });

  quiet = Option.Boolean(`-q, --quiet`, {
    description: `Suppresses logging of file paths`
  });

  silent = Option.Boolean(`-s, --silent`, {
    description: `Disables all logging except for errors`
  });

  rootDir = Option.String(`-r, --rootDir`, `./src`, {
    description: `A directory from which to look for files relative to the project root (location of your ".git" folder)`
  });

  async execute(): Promise<void> {
    const { ignore, dryRun, quiet, silent, rootDir } = this;
    const { name } = await loadManifest();

    spinner(`Checking commit status of ${String(name)}`, { silent }).succeed();

    try {
      // Warn the user about running this command in a dirty working directory
      if (await isWorkingDirClean()) {
        spinner(`Working directory is clean`, { silent }).succeed();
      } else {
        const { proceed } = await inquirer.prompt({
          type: `confirm`,
          name: `proceed`,
          message: `Working directory has uncommitted changes. You should run this command with a clean working directory for best results. Proceed anyways?`,
          default: false
        });

        if (!proceed) {
          spinner(`Skipped execution`, { silent }).fail();
          process.exit(0);
        }
      }
    } catch (err: unknown) {
      if (err instanceof Error) {
        error(`Error occured checking git status:`, err);
        process.exit(1);
      }
    }

    const updateSpinner = spinner(`Searching for files to update...\n`).start();

    // Grab the root directory to glob from the CLI args
    const consumerRoot = await getConsumerRoot();
    const sourceDir = path.join(consumerRoot, rootDir);
    const ignored = ignore.length ? ignore.split(`,`) : [];
    // We have to skip all new files because `git mv` will fail if run
    // on an untracked file
    const newUntrackedFiles = filterFilesByExtensions(
      (await getNewUntrackedFiles()).map((filepath) => path.join(consumerRoot, filepath)),
      [`.js`, `.jsx`]
    );
    // We also want to skip all files with any modifications because
    // even after running `git mv`, git will still treat the renamed file
    // as being new and the old extension as being deleted
    const dirtyFiles = filterFilesByExtensions(
      (await getDirtyFiles()).map((filepath) => path.join(consumerRoot, filepath)),
      [`.js`, `.jsx`]
    );
    // Glob all of the files in the user's rootDir
    const projectFiles = (await findFilesByExtension([`js`, `jsx`], sourceDir, ignored)).map(
      (filepath) => path.join(sourceDir, filepath)
    );
    const skipped = projectFiles.filter((filepath) =>
      [...newUntrackedFiles, ...dirtyFiles].includes(filepath)
    );
    const included = projectFiles.filter((filepath) => !skipped.includes(filepath));
    const jsxFiles = await findJSXFiles(included);
    const tsFiles = included.filter((filepath) => !jsxFiles.includes(filepath));
    const toTS = tsFiles.map<[string, string]>((filePath) => [
      filePath,
      changeExtension(filePath, `.ts`)
    ]);
    const toTSX = jsxFiles.map<[string, string]>((filePath) => [
      filePath,
      changeExtension(filePath, `.tsx`)
    ]);

    const updateFilepaths = new Map<string, string>([...toTS, ...toTSX]);

    updateSpinner.stopAndPersist({
      symbol: `🔎`,
      text: `Found ${chalk.bold(included.length)} files in directory ${String(rootDir)}.\n`
    });

    if (skipped.length) {
      spinner(
        `${chalk.bold(
          `${skipped.length} files`
        )} are new or have been modified and will be skipped${
          quiet
            ? ``
            : `:\n\n  ${chalk.dim(
                skipped.map((filepath) => filepath.replace(consumerRoot, `.`)).join(`\n  `)
              )}`
        }\n`,
        { silent }
      ).info();
    }

    spinner(
      `${chalk.bold(`${updateFilepaths.size} files`)} will be renamed${
        quiet
          ? ``
          : `:\n\n  ${chalk.dim(
              [...updateFilepaths.entries()]
                .map(
                  ([src, dest]) =>
                    `${src.replace(consumerRoot, `.`)} => ${dest.replace(consumerRoot, `.`)}`
                )
                .join(`\n  `)
            )}`
      }\n`,
      { silent }
    ).succeed();

    if (!dryRun) {
      const renameSpinner = spinner(`Changing file extensions...\n`, { silent }).start();

      for await (const [src, dest] of updateFilepaths) {
        await execa(`git`, [`mv`, src, dest], {
          env: { FORCE_COLOR: `true` },
          cwd: consumerRoot,
          stdio: `inherit`
        });
      }

      renameSpinner.stopAndPersist({
        text: `Changed extensions for ${chalk.bold(projectFiles.length)} files.\n`
      });
    }
  }
}
