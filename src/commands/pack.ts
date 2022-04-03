import path from "path";
import { existsSync } from "fs";
import { promisify } from "util";
import { Flags } from "@oclif/core";
import type { OutputOptions } from "rollup";
import rimraf from "rimraf";
import { BaseCommand } from "../BaseCommand";
import { HEURISTICS } from "../types/package";
import { findFilesByName, copyFiles, writeFiles, writeJson } from "../filesystem";
import { loadManifest, logDependencyVersions } from "../filesystem/npm";
import { getTSConfig, emitTypes, getEmitDiagnostics } from "../utils/ts";
import {
  addEntrypoint,
  parseTargets,
  getSourceFiles,
  transpileSrc,
  generateBundle,
  writeBundles,
  writeESMBundle,
  writeUMDBundle,
  transpileCJS,
  parseSrc,
  mapTranspilationResults,
  transpileESM
} from "../utils/pack";

const EXT_REGEX = /\.(?<ext>[jt]sx?)$/i;

export class Pack extends BaseCommand {
  static description = `Runs Pika Pack`;

  static flags = {
    help: Flags.help({ char: `h` }),
    version: Flags.boolean({
      char: `v`,
      description: `Prints the semver version of the dependencies that will be used to build files.`
    }),
    config: Flags.string({
      char: `c`,
      description: `The path to a Babel config file specifying how to transpile the project`
    }),
    project: Flags.string({
      char: `p`,
      description: `The argument can be a file path to a valid JSON configuration file, or a directory path to a directory containing a tsconfig.json file`
    }),
    targets: Flags.string({
      char: `t`,
      description: `A list of module formats to build. Targets can be specified as a comma separated string from the following values: cjs, esm, umd (ex: --targets=esm,cjs)`
    }),
    bundle: Flags.boolean({
      char: `b`,
      description: `Generate minified bundles for each of the compilation targets defined by --targets`
    }),
    sourceMaps: Flags.boolean({
      char: `m`,
      description: `Generate sourcemaps for all output targets.`,
      default: false
    })
  };

  static args = [
    {
      name: `files`,
      required: false,
      description: `A list of filenames to transform`
    }
  ];

  async run(): Promise<void> {
    const cwd = process.cwd();
    const { flags: parsedFlags } = await this.parse(Pack);
    // Log out versions of related tooling versions (need to abstract this out)
    if (parsedFlags.version) {
      await logDependencyVersions(
        new Map([
          [`babel`, true],
          [`presetEnv`, true],
          [`presetTypescript`, true],
          [`rollup`, true],
          [`rollupBabel`, true],
          [`typescript`, true]
        ])
      );
      return;
    }
    const manifest = await loadManifest();
    const dist = path.join(cwd, `dist`);
    const entryPoint = manifest.main ?? `index.js`;
    const absEntryPoint = path.join(cwd, entryPoint);
    const entryFileName = path.basename(absEntryPoint);
    const basename = entryFileName.replace(EXT_REGEX, ``);
    const bundleName = entryFileName.replace(EXT_REGEX, `.js`);
    const srcDir = path.dirname(absEntryPoint);
    const files = await getSourceFiles({ cwd: srcDir });
    const sourceMaps = parsedFlags.sourceMaps;
    const targets = parseTargets(parsedFlags.targets);

    // Step 1: Clean up previous build output
    if (existsSync(dist)) {
      const cleaning = this.spinner(` Cleaning dist directory...\n`).start();
      await promisify(rimraf)(dist);
      cleaning.stopAndPersist({ symbol: `🧹`, text: `Cleaned up previous build output` });
    }

    // Step 2: Generate Transpilation Targets
    const compiling = this.spinner(` Compiling library from source using Babel...\n`).start();
    const parsed = await parseSrc(srcDir, files);
    // The order we add entrypoints matters, see:
    // https://nodejs.org/api/packages.html#conditional-exports
    if (targets.includes(`esm`)) {
      const transpiling = this.spinner(` Generating ESM build...\n`).start();
      await addEntrypoint(basename, `esm`);
      await writeFiles(
        mapTranspilationResults(
          await transpileESM(parsed, sourceMaps),
          files,
          path.join(dist, `esm`),
          sourceMaps
        )
      );
      transpiling.stopAndPersist({ symbol: `📦`, text: `Generated ESM Output` });
    }
    if (targets.includes(`cjs`)) {
      const transpiling = this.spinner(` Generating CJS build...\n`).start();
      await addEntrypoint(basename, `cjs`);
      await writeFiles(
        mapTranspilationResults(
          await transpileCJS(parsed, sourceMaps),
          files,
          path.join(dist, `cjs`),
          sourceMaps
        )
      );
      transpiling.stopAndPersist({ symbol: `📦`, text: `Generated CJS Output` });
    }

    // Step 3: Emit Type Declarations from source
    if (manifest[HEURISTICS].usesTypescript) {
      const emitting = this.spinner(` Generating Typescript type definitions...\n`).start();
      await addEntrypoint(basename, `types`);
      const ts = await import(`typescript`);
      const { results, ...rest } = emitTypes({
        ts,
        fileNames: files.map((filename) => path.join(srcDir, filename)),
        options: this.loadCompilerOptions(await getTSConfig(cwd, parsedFlags.project)),
        outDir: path.join(dist, `types`)
      });
      await writeFiles(results);
      getEmitDiagnostics({ ts, ...rest }).forEach(() => {
        // handle logging typescript emit logs here
      });
      emitting.stopAndPersist({ symbol: `📦`, text: `Generated Type Definitions` });
    }

    // Step 4: Geneate Bundles from lib
    if (targets.length && parsedFlags.bundle) {
      const bundling = this.spinner(` Generating Bundles...\n`).start();
      await writeBundles(
        await generateBundle(path.join(dist, `lib`, bundleName)),
        [
          targets.includes(`esm`) && (await writeESMBundle(basename, sourceMaps)),
          targets.includes(`umd`) && (await writeUMDBundle(basename, sourceMaps))
        ]
          .filter(Boolean)
          .flat() as OutputOptions[]
      );
      bundling.stopAndPersist({ symbol: `📦`, text: `Generated Bundles` });
    }

    // Step 5: Generate Lib Output
    const transpiling = this.spinner(` Generating Lib...\n`).start();
    await addEntrypoint(basename, `lib`);
    await writeFiles(
      mapTranspilationResults(
        await transpileSrc(parsed, sourceMaps),
        files,
        path.join(dist, `lib`),
        sourceMaps
      )
    );
    transpiling.stopAndPersist({ symbol: `📦`, text: `Generated Lib Output` });
    compiling.stopAndPersist({ symbol: `🎉`, text: `Finished compiling source files` });

    // Step 6: Copy Required Files to dist directory
    const copyReqired = this.spinner(` Copying required files...\n`).start();
    const alwaysIncluded = [
      `README`,
      `CHANGES`,
      `CHANGELOG`,
      `HISTORY`,
      `LICENSE`,
      `LICENCE`,
      `NOTICE`
    ];
    await copyFiles(
      (
        await findFilesByName(alwaysIncluded, cwd, [`dist`, `pkg`])
      ).reduce((filePaths, source) => {
        const { dir, name, ext } = path.parse(source);
        const destination = path.join(dir.replace(/^src/, `lib`), `${name.toUpperCase()}${ext}`);
        return filePaths.set(path.join(cwd, source), path.join(cwd, `dist`, destination));
      }, new Map<string, string>())
    );
    copyReqired.stopAndPersist({ symbol: `📝`, text: `Copied required files` });

    if (manifest.bin) {
      const copying = this.spinner(` Copying Bin files...\n`).start();
      await copyFiles(
        Object.values(Array.isArray(manifest.bin) ? manifest.bin : [manifest.bin]).reduce(
          (filePaths, source) =>
            filePaths.set(path.join(cwd, source), path.join(cwd, `dist`, source)),
          new Map<string, string>()
        )
      );
      copying.stopAndPersist({ symbol: `📝`, text: `Copied Bin files` });
    }

    if (manifest.files) {
      const copying = this.spinner(` Copying User Defined Files...\n`).start();
      await copyFiles(
        manifest.files.reduce(
          (filePaths, source) =>
            filePaths.set(path.join(cwd, source), path.join(cwd, `dist`, source)),
          new Map<string, string>()
        )
      );
      copying.stopAndPersist({ symbol: `📝`, text: `Copied User Defined Files` });
    }

    // Step 7: Write modified Package Manifest to dist directory
    await writeJson(path.join(cwd, `dist/package.json`), manifest);
    this.spinner(` Packaging complete! Results written to ./dist/package.json`).succeed();
  }
}
