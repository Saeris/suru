import path from "path";
import { rollup } from "rollup";
import type { RollupBuild } from "rollup";
import rollupBabel from "@rollup/plugin-babel";
import peerDepsExternal from "rollup-plugin-peer-deps-external";
import { PACKAGEROOT } from "../../types/package";
import { loadManifest } from "../../filesystem/npm";

export const generateBundle = async (input: string): Promise<RollupBuild> => {
  const { [PACKAGEROOT]: root } = await loadManifest();

  return rollup({
    input,
    plugins: [
      peerDepsExternal({
        packageJsonPath: path.resolve(root, `package.json`)
      }),
      rollupBabel({
        babelrc: false,
        babelHelpers: `bundled`
      })
    ],
    onwarn: (warning, defaultOnWarnHandler) => {
      // Unresolved external imports are expected
      if (
        warning.code === `UNRESOLVED_IMPORT` &&
        !(warning.source && (warning.source.startsWith(`./`) || warning.source.startsWith(`../`)))
      ) {
        return;
      }
      defaultOnWarnHandler(warning);
    }
  });
};
