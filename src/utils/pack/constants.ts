import type { Options } from "@babel/preset-env";

export const sharedOptions: Options = {
  loose: true,
  bugfixes: true,
  useBuiltIns: false,
  exclude: [`transform-async-to-generator`, `transform-regenerator`]
};
