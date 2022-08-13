import path from "path";
import { existsSync } from "fs";
import { promisify } from "util";
import { Command, Option } from "clipanion";
import type { OutputOptions } from "rollup";
import rimraf from "rimraf";
import { HEURISTICS } from "../types/package";
import { findFilesByName, copyFiles, writeFiles, writeJson } from "../filesystem";
import { loadManifest, logDependencyVersions } from "../filesystem/npm";
import { emitTypes, getEmitDiagnostics, loadCompilerOptions } from "../utils/ts";
import {
  addEntrypoint,
  getTargets,
  getSourceFiles,
  transpileLib,
  generateBundle,
  writeBundles,
  writeESMBundle,
  writeUMDBundle,
  transpileCJS,
  parseSrc,
  mapTranspilationResults,
  transpileESM
} from "../utils/pack";
import { spinner } from "../utils";
import { getTSConfig } from "../filesystem/config";

const EXT_REGEX = /\.(?<ext>[jt]sx?)$/i;

export class Pack extends Command {
  static paths = [[`pack`]];
  // eslint-disable-next-line new-cap
  static usage = Command.Usage({
    description: `Bundles project source files for distribution on NPM.`
  });

  config = Option.String(`-c, --config`, {
    description: `The path to a Babel config file specifying how to transpile the project`
  });

  project = Option.String(`-p, --project`, {
    description: `The argument can be a file path to a valid JSON configuration file, or a directory path to a directory containing a tsconfig.json file`
  });

  targets = Option.Array(`-t, --targets`, {
    description: `A list of module formats to build. Targets can be specified as a comma separated string from the following values: cjs, esm, umd (ex: --targets=esm,cjs)`
  });

  bundle = Option.Boolean(`-b, --bundle`, {
    description: `Generate minified bundles for each of the compilation targets defined by --targets`
  });

  sourceMaps = Option.Boolean(`-m, --sourceMaps`, false, {
    description: `Generate sourcemaps for all output targets.`
  });

  version = Option.Boolean(`-v, --version`, {
    description: `Prints the semver version of the dependencies that will be used to build files.`
  });

  // eslint-disable-next-line new-cap
  files = Option.Rest();

  async execute(): Promise<void> {
    const cwd = process.cwd();
    // Log out versions of related tooling versions (need to abstract this out)
    if (this.version) {
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
    const files = this.files.length ? this.files : await getSourceFiles({ cwd: srcDir });
    const sourceMaps = this.sourceMaps;
    const targets = getTargets(this.targets?.join(``));

    // Step 1: Clean up previous build output
    if (existsSync(dist)) {
      const cleaning = spinner(` Cleaning dist directory...\n`).start();
      await promisify(rimraf)(dist);
      cleaning.stopAndPersist({ symbol: `🧹`, text: `Cleaned up previous build output` });
    }

    // Step 2: Generate Transpilation Targets
    const compiling = spinner(` Compiling library from source using Babel...\n`).start();
    const parsed = await parseSrc(srcDir, files);
    // The order we add entrypoints matters, see:
    // https://nodejs.org/api/packages.html#conditional-exports
    if (targets.includes(`esm`)) {
      const transpiling = spinner(` Generating ESM build...\n`).start();
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
      const transpiling = spinner(` Generating CJS build...\n`).start();
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
      const emitting = spinner(` Generating Typescript type definitions...\n`).start();
      await addEntrypoint(basename, `types`);
      const ts = await import(`typescript`);
      const { results, ...rest } = emitTypes({
        ts,
        fileNames: files.map((filename) => path.join(srcDir, filename)),
        options: loadCompilerOptions(await getTSConfig(cwd, this.project)),
        outDir: path.join(dist, `types`)
      });
      await writeFiles(results);
      getEmitDiagnostics({ ts, ...rest }).forEach(() => {
        // handle logging typescript emit logs here
      });
      emitting.stopAndPersist({ symbol: `📦`, text: `Generated Type Definitions` });
    }

    // Step 4: Geneate Bundles from lib
    if (targets.length && this.bundle) {
      const bundling = spinner(` Generating Bundles...\n`).start();
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
    const transpiling = spinner(` Generating Lib...\n`).start();
    await addEntrypoint(basename, `lib`);
    await writeFiles(
      mapTranspilationResults(
        await transpileLib(parsed, sourceMaps),
        files,
        path.join(dist, `lib`),
        sourceMaps
      )
    );
    transpiling.stopAndPersist({ symbol: `📦`, text: `Generated Lib Output` });
    compiling.stopAndPersist({ symbol: `🎉`, text: `Finished compiling source files` });

    // Step 6: Copy Required Files to dist directory
    const copyReqired = spinner(` Copying required files...\n`).start();
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
      const copying = spinner(` Copying Bin files...\n`).start();
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
      const copying = spinner(` Copying User Defined Files...\n`).start();
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
    spinner(` Packaging complete! Results written to ./dist/package.json`).succeed();
  }
}
