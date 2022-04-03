import type { Options } from "@babel/preset-env";

export const sharedOptions: Options = {
  loose: true,
  bugfixes: true,
  useBuiltIns: false,
  modules: false,
  exclude: [`transform-async-to-generator`, `transform-regenerator`]
};
