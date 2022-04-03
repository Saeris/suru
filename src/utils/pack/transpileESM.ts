import { transformFromAstAsync } from "@babel/core";
import type { BabelFileResult } from "@babel/core";
import presetEnv from "@babel/preset-env";
import { sharedOptions } from "./constants";

export const transpileESM = async (
  parsedASTs: (BabelFileResult | null)[],
  sourceMaps = false
): Promise<(BabelFileResult | null)[]> =>
  Promise.all(
    parsedASTs.map(async (result) =>
      result?.ast
        ? transformFromAstAsync(result.ast, ``, {
            sourceMaps,
            presets: [
              [
                presetEnv,
                {
                  ...sharedOptions,
                  targets: { esmodules: true },
                  modules: false
                }
              ]
            ]
          })
        : null
    )
  );
