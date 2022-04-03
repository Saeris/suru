import path from "path";
import type { BabelFileResult } from "@babel/core";

export const writeTranspilationOutputs = (
  transpilationResults: (BabelFileResult | null)[],
  files: string[],
  outDir: string,
  sourceMaps = false
): Map<string, string | null | undefined> =>
  transpilationResults.reduce((results, result, i) => {
    results.set(
      path.join(outDir, files[i].replace(/\.(?<ext>[jt]sx?)$/i, `.js`)),
      result?.code ?? null
    );
    if (sourceMaps) {
      results.set(
        path.join(outDir, files[i].replace(/\.(?<ext>[jt]sx?)$/i, `.js.map`)),
        (result?.map && JSON.stringify(result.map)) || null
      );
    }
    return results;
  }, new Map<string, string | null | undefined>());
