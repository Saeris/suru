import path from "path";
import type { PluginItem, BabelFileResult } from "@babel/core";
import { transformFileAsync } from "@babel/core";
import pluginExternalHelpers from "@babel/plugin-external-helpers";
import presetReact from "@babel/preset-react";
import presetTypescript from "@babel/preset-typescript";
import { getConsumerRoot } from "../../filesystem/git";
import { getInstalledDependencies } from "../../filesystem/npm";
import { analyzeProject } from "../../heuristics";

export const parseSrc = async (
  srcDir: string,
  files: string[]
): Promise<(BabelFileResult | null)[]> => {
  const { usesTypescript, usesReact } = await analyzeProject(await getConsumerRoot(), [
    ...(await getInstalledDependencies()).keys()
  ]);

  return Promise.all(
    files.map(async (filename) =>
      transformFileAsync(path.join(srcDir, filename), {
        babelrc: false,
        code: false,
        ast: true,
        plugins: [pluginExternalHelpers],
        presets: [
          usesTypescript && [presetTypescript],
          usesReact && [presetReact, { useBuiltIns: true }]
        ].filter(Boolean) as PluginItem[]
      })
    )
  );
};
