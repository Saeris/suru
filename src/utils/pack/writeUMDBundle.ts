import path from "path";
import type { OutputOptions } from "rollup";
import { getBabelOutputPlugin } from "@rollup/plugin-babel";
import { default as presetEnv } from "@babel/preset-env";
import type { Options } from "@babel/preset-env";
import { terser } from "rollup-plugin-terser";
import { moduleNameToPascalCase } from "../../filesystem/npm";
import { log } from "../../logging";
import { addEntrypoint } from "./addEntrypoint";

export const writeUMDBundle = async (
  fileName: string,
  sourceMaps = false
): Promise<OutputOptions[]> => {
  log(`Generating UMD build`);
  const manifest = await addEntrypoint(fileName, `umd`, true);

  const babelPlugin = getBabelOutputPlugin({
    presets: [[presetEnv, { modules: `umd` }], {} as Options]
  });

  return [
    {
      name: moduleNameToPascalCase(manifest.name ?? ``),
      file: path.join(`dist`, manifest.exports.browser.default.development),
      format: `esm`,
      plugins: [babelPlugin],
      sourcemap: sourceMaps
    },
    {
      name: moduleNameToPascalCase(manifest.name ?? ``),
      file: path.join(`dist`, manifest.exports.browser.default.production),
      format: `esm`,
      plugins: [babelPlugin, terser()],
      sourcemap: sourceMaps
    }
  ];
};
