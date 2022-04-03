import type { loadCompilerOptions } from "./loadCompilerOptions";
import { omit } from "../omit";
import type { KnownKeys, PickKnown } from "../../types";
import { isDefined } from "../isDefined";

const ImportsNotUsedAsValues = {
  0: `remove`,
  1: `preserve`,
  2: `error`
} as const;

const JSXValues = {
  0: `none`,
  1: `preserve`,
  2: `react`,
  3: `react-native`,
  4: `react-jsx`,
  5: `react-jsx-dev`
} as const;

const ModuleResolutions = {
  1: `classic`,
  2: `node`
} as const;

const ModuleKinds = {
  0: `none`,
  1: `commonjs`,
  2: `amd`,
  3: `umd`,
  4: `systemjs`,
  5: `es2015`,
  6: `es2020`,
  99: `esnext`
} as const;

const NewLineKinds = {
  0: `crlf`,
  1: `lf`
} as const;

const Targets = {
  0: `es3`,
  1: `es5`,
  2: `es2015`,
  3: `es2016`,
  4: `es2017`,
  5: `es2018`,
  6: `es2019`,
  7: `es2020`,
  99: `esnext`,
  100: `json`
} as const;

type CompilerOptions = ReturnType<typeof loadCompilerOptions>;
type KnownCompilerOptions = Pick<CompilerOptions, KnownKeys<CompilerOptions>>;
export interface NormalizedCompilerOptions
  extends Omit<
    KnownCompilerOptions,
    | "importsNotUsedAsValues"
    | "jsx"
    | "module"
    | "moduleResolution"
    | "newLine"
    | "target"
    | "paths"
    | "rootDirs"
    | "composite"
  > {
  [key: string]: string | number | boolean | string[] | undefined;
  importsNotUsedAsValues?: typeof ImportsNotUsedAsValues[keyof typeof ImportsNotUsedAsValues];
  jsx?: typeof JSXValues[keyof typeof JSXValues];
  module?: typeof ModuleKinds[keyof typeof ModuleKinds];
  moduleResolution?: typeof ModuleResolutions[keyof typeof ModuleResolutions];
  newLine?: typeof NewLineKinds[keyof typeof NewLineKinds];
  target?: typeof Targets[keyof typeof Targets];
}

/**
 * Used to parse the raw Compiler Options loaded by Typescript's
 * internal utilities and normalize the values to those that can
 * be passed as configuration options either to the Typescript
 * compiler directly, or as serialized command line arguments.
 * @param options The raw compiler options.
 */
export const normalizeCompilerOptions = (
  options: KnownCompilerOptions
): PickKnown<NormalizedCompilerOptions> =>
  /* eslint-disable no-undefined */
  ({
    ...(omit(options, [`paths`, `rootDirs`, `composite`]) as Omit<
      KnownCompilerOptions,
      "paths" | "rootDirs" | "composite"
    >),
    lib: options.lib?.map((v) => v.replace(`lib.`, ``).replace(`.d.ts`, ``)),
    importsNotUsedAsValues: isDefined(options.importsNotUsedAsValues)
      ? (ImportsNotUsedAsValues[
          options.importsNotUsedAsValues
        ] as NormalizedCompilerOptions["importsNotUsedAsValues"])
      : undefined,
    jsx: isDefined(options.jsx)
      ? (JSXValues[options.jsx] as NormalizedCompilerOptions["jsx"])
      : undefined,
    module: isDefined(options.module)
      ? (ModuleKinds[options.module] as NormalizedCompilerOptions["module"])
      : undefined,
    moduleResolution: isDefined(options.moduleResolution)
      ? (ModuleResolutions[
          options.moduleResolution
        ] as NormalizedCompilerOptions["moduleResolution"])
      : undefined,
    newLine: isDefined(options.newLine)
      ? (NewLineKinds[options.newLine] as NormalizedCompilerOptions["newLine"])
      : undefined,
    target: isDefined(options.target)
      ? (Targets[options.target] as NormalizedCompilerOptions["target"])
      : undefined
  });
