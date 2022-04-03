import path from "path";
import { Flags } from "@oclif/core";
import execa from "execa";
import chalk from "chalk";
import inquirer from "inquirer";
import { BaseCommand } from "../BaseCommand";
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

export class Convert extends BaseCommand {
  static description = `Changes file extensions on project files to their Typescript equivalents using "git mv", preserving commit history`;

  static flags = {
    help: Flags.help({ char: `h` }),
    ignore: Flags.string({
      char: `i`,
      description: `A comma separated list of glob patterns to ignore`,
      default: ``
    }),
    dryRun: Flags.boolean({
      description: `Outputs a list of files to be renamed only`
    }),
    quiet: Flags.boolean({
      char: `q`,
      description: `Suppresses logging of file paths`
    }),
    silent: Flags.boolean({
      char: `s`,
      description: `Disables all logging except for errors`
    })
  };

  static args = [
    {
      name: `rootDir`,
      required: false,
      description: `A directory from which to look for files relative to the project root (location of your ".git" folder)`,
      default: `./src`
    }
  ];

  async run(): Promise<void> {
    const { flags: parsedFlags, argv } = await this.parse(Convert);
    const { ignore, dryRun, quiet, silent } = parsedFlags;
    const { name } = await loadManifest();

    this.spinner(`Checking commit status of ${String(name)}`, { silent }).succeed();

    try {
      // Warn the user about running this command in a dirty working directory
      if (await isWorkingDirClean()) {
        this.spinner(`Working directory is clean`, { silent }).succeed();
      } else {
        const { proceed } = await inquirer.prompt({
          type: `confirm`,
          name: `proceed`,
          message: `Working directory has uncommitted changes. You should run this command with a clean working directory for best results. Proceed anyways?`,
          default: false
        });

        if (!proceed) {
          this.spinner(`Skipped execution`, { silent }).fail();
          this.exit(0);
        }
      }
    } catch (err: unknown) {
      if (err instanceof Error) {
        error(`Error occured checking git status:`, err);
      }
    }

    const updateSpinner = this.spinner(`Searching for files to update...\n`).start();

    // Grab the root directory to glob from the CLI args
    const rootDir = argv[0];
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
      this.spinner(
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

    this.spinner(
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
      const renameSpinner = this.spinner(`Changing file extensions...\n`, { silent }).start();

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