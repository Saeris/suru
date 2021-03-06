import presetEnv from "@babel/preset-env";
import { transpiler } from "./transpiler";
import { sharedOptions } from "./constants";

export const transpileESM = transpiler({
  presets: [
    [
      presetEnv,
      {
        ...sharedOptions,
        targets: { esmodules: true }
      }
    ]
  ]
});
