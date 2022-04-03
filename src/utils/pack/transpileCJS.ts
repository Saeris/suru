import presetEnv from "@babel/preset-env";
import { transpiler } from "./transpiler";
import { sharedOptions } from "./constants";

export const transpileCJS = transpiler({
  presets: [
    [
      presetEnv,
      {
        ...sharedOptions,
        modules: `commonjs`
      }
    ]
  ]
});
