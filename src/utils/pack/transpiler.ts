import type { BabelFileResult, TransformOptions } from "@babel/core";
import { transformFromAstAsync } from "@babel/core";

export const transpiler =
  (config: TransformOptions) =>
  async (
    parsedASTs: (BabelFileResult | null)[],
    sourceMaps = false
  ): Promise<(BabelFileResult | null | undefined)[]> =>
    Promise.all(
      parsedASTs.map(
        async (result) =>
          result?.ast &&
          transformFromAstAsync(result.ast, ``, Object.assign(config, { sourceMaps }))
      )
    );
