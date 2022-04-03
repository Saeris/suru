import { transformFromAstAsync } from "@babel/core";
import type { BabelFileResult } from "@babel/core";
import presetEnv from "@babel/preset-env";

export const transpileSrc = async (
  parsedASTs: (BabelFileResult | null)[],
  sourceMaps = false
): Promise<(BabelFileResult | null | undefined)[]> =>
  Promise.all(
    parsedASTs.map(
      async (result) =>
        result?.ast &&
        transformFromAstAsync(result.ast, ``, {
          sourceMaps,
          presets: [
            [
              presetEnv,
              {
                targets: { esmodules: true },
                modules: false,
                loose: true,
                bugfixes: true,
                useBuiltIns: `usage`,
                corejs: 3,
                exclude: [`transform-async-to-generator`, `transform-regenerator`]
              }
            ]
          ]
        })
    )
  );
