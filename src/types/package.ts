// eslint-disable-next-line import/no-unresolved
import type { PackageJson } from "type-fest";
import type { HeuristicsMap } from "../heuristics";
import type { ImportedJSONMeta } from "./jsonMeta";

export const PACKAGEROOT: unique symbol = Symbol.for(`packageRoot`);
export const HARDDEPENDENCIES: unique symbol = Symbol.for(`hardDependencies`);
export const HEURISTICS: unique symbol = Symbol.for(`heuristics`);

export interface Package extends PackageJson, ImportedJSONMeta {
  /**
   * A `Map` consisting of the combined values
   * of the package's `dependencies` and
   * `devDependencies` fields.
   */
  [HARDDEPENDENCIES]: Map<string, string>;
  [HEURISTICS]: HeuristicsMap;
  [PACKAGEROOT]: string;
  main?: string;
}
