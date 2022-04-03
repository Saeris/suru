import { Command, Flags } from "@oclif/core";
import execa from "execa";
import { fetch } from "cross-fetch";
import chalk from "chalk";
import inquirer from "inquirer";
import type { Package } from "../types/package";
import { PACKAGEROOT } from "../types/package";
import { findFilesByExtension } from "../filesystem";
import { getConsumerRoot } from "../filesystem/git";
import { getWorkspaces, loadManifest, scopeToSnakeCase } from "../filesystem/npm";
import { spinner } from "../utils";

export class Find extends Command {
  static description = `Checks for available type definition packages and installs them.`;

  static flags = {
    help: Flags.help({ char: `h` }),
    dryRun: Flags.boolean({
      description: `Searches for available type definitions but skips installation.`
    })
  };

  hasTypes = async (
    packageName: string,
    baseDir?: string
  ): Promise<"native" | "declarations" | false> => {
    const manifest = await loadManifest(packageName, {
      local: true,
      baseDir: baseDir ? `${baseDir}/` : baseDir
    });

    if (
      (manifest.types || manifest.typings,
      (await findFilesByExtension([`d.ts`], manifest[PACKAGEROOT])).length)
    ) {
      return `native`;
    }

    const { status } = await fetch(
      `https://registry.npmjs.org/@types/${scopeToSnakeCase(packageName)}/`
    );

    return status === 200 ? `declarations` : false;
  };

  findTypes = async (manifest: Package): Promise<void> => {
    const { flags: parsedFlags } = await this.parse(Find);
    const searching = spinner(`Searching for types...\n`).start();
    const { dependencies = {}, devDependencies = {}, name, [PACKAGEROOT]: root } = manifest;
    const dependencyNames = Object.keys(dependencies);
    const devDependencyNames = Object.keys(devDependencies).filter(
      (dependency) =>
        !Object.keys(devDependencies).includes(`@types/${scopeToSnakeCase(dependency)}`)
    );
    const filtered = dependencyNames.filter(
      (dependency) =>
        !/^@types\/[a-z\d][\w-.]*$/.test(dependency) &&
        !devDependencyNames.includes(`@types/${scopeToSnakeCase(dependency)}`)
    );
    const typesForDependencies = await Promise.all(
      filtered.map(
        async (
          packageName
        ): Promise<[packageName: string, hasTypes: false | `native` | `declarations`]> => {
          const hasTypes = await this.hasTypes(packageName, root);
          return [packageName, hasTypes];
        }
      )
    );
    const typesToInstall = typesForDependencies.reduce(
      (arr, [packageName, hasTypes]) =>
        hasTypes === `declarations` ? [...arr, `@types/${scopeToSnakeCase(packageName)}`] : arr,
      []
    );

    searching.stopAndPersist({
      symbol: `🔎`,
      text: `Inspected ${chalk.bold(filtered.length)} dependencies of ${String(name)}.\n`
    });

    const [noTypes, hasNativeTypes, hasDeclarations] = typesForDependencies.reduce<string[][]>(
      (categories, [packageName, hasTypes]) => {
        switch (hasTypes) {
          case `native`: {
            categories[1].push(packageName);
            break;
          }
          case `declarations`: {
            categories[2].push(`@types/${scopeToSnakeCase(packageName)}`);
            break;
          }
          default: {
            categories[0].push(packageName);
            break;
          }
        }
        return categories;
      },
      [[], [], []]
    );

    if (hasNativeTypes.length) {
      spinner(
        `${chalk.bold(`${hasNativeTypes.length} modules`)} have native types available.\n`
      ).succeed();
    }

    if (noTypes.length) {
      spinner(
        `${chalk.bold(`${noTypes.length} modules`)} do not have types available:\n\n  ${chalk.dim(
          noTypes.join(`\n  `)
        )}\n`
      ).fail();
    }

    if (hasDeclarations.length) {
      spinner(
        `${chalk.bold(
          `${hasDeclarations.length} modules`
        )} have declarations available via a separate package:\n\n  ${chalk.dim(
          hasDeclarations.join(`\n  `)
        )}\n`
      ).info();
    }

    if (!parsedFlags.dryRun && typesToInstall.length) {
      const { installTypes } = await inquirer.prompt({
        type: `confirm`,
        name: `installTypes`,
        message: `Install available type definitions now?`,
        default: true
      });

      if (installTypes) {
        await this.installTypes(root, typesToInstall);
      }
    }
  };

  installTypes = async (pacakgeDir: string, typesToInstall: string[]): Promise<void> => {
    await execa(`yarn`, [`add`, `-D`, ...typesToInstall], {
      env: { FORCE_COLOR: `true` },
      cwd: pacakgeDir,
      stdio: `inherit`
    });
  };

  async run(): Promise<void> {
    const rootManifest = await loadManifest(await getConsumerRoot(), { local: true });
    const workspaces = await getWorkspaces();

    if (workspaces.length) {
      const { findTypesForWorkspaces } = await inquirer.prompt({
        type: `confirm`,
        name: `findTypesForWorkspaces`,
        message: `${workspaces.length} Workspaces were found, find types for all of them?`,
        default: true
      });

      if (findTypesForWorkspaces) {
        for await (const workspace of [rootManifest, ...workspaces]) {
          await this.findTypes(workspace);
        }
      }
    } else {
      await this.findTypes(rootManifest);
    }
  }
}
