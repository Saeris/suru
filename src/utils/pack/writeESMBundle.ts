import path from "path";
import type { OutputOptions } from "rollup";
import { getBabelOutputPlugin } from "@rollup/plugin-babel";
import { default as presetEnv } from "@babel/preset-env";
import type { Options } from "@babel/preset-env";
import { terser } from "rollup-plugin-terser";
import { addEntrypoint } from "./addEntrypoint";
import { log } from "../../logging";

export const writeESMBundle = async (
  fileName: string,
  sourceMaps = false
): Promise<OutputOptions[]> => {
  log(`Generating ESM build`);
  const manifest = await addEntrypoint(fileName, `esm`, true);

  const babelPlugin = getBabelOutputPlugin({
    presets: [presetEnv, {} as Options]
  });

  return [
    {
      file: path.join(`dist`, manifest.exports.browser.import.development),
      format: `esm`,
      plugins: [babelPlugin],
      sourcemap: sourceMaps
    },
    {
      file: path.join(`dist`, manifest.exports.browser.import.production),
      format: `esm`,
      plugins: [babelPlugin, terser()],
      sourcemap: sourceMaps
    }
  ];
};
