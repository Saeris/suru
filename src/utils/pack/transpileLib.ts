import presetEnv from "@babel/preset-env";
import { sharedOptions } from "./constants";
import { transpiler } from "./transpiler";

export const transpileLib = transpiler({
  presets: [
    [
      presetEnv,
      {
        ...sharedOptions,
        targets: { esmodules: true },
        useBuiltIns: `usage`,
        corejs: 3
      }
    ]
  ]
});
