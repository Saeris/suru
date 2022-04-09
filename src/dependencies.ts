import type Babel from "@babel/core";
import type ESLint from "eslint";
// eslint-disable-next-line jest/no-jest-import
import type Jest from "jest";
import type * as Rollup from "rollup";
import type * as RollupPluginBabel from "@rollup/plugin-babel";
import type RollupPluginTerser from "rollup-plugin-terser";
import type RollupPluginPeerDepsExternal from "rollup-plugin-peer-deps-external";
import type { Typescript } from "./utils/ts/types";
import type { ImportedModuleMeta } from "./types/module";
import { importModule } from "./filesystem/npm";
import { BABEL_DEPENDENCIES } from "./heuristics/babel";
import { ESLINT_DEPENDENCIES, JEST_DEPENDENCIES, TYPESCRIPT_DEPENDENCIES } from "./heuristics";
import { ROLLUP_DEPENDENCIES } from "./heuristics/rollup";

export type ToolingDependency<T> = (local?: boolean) => Promise<T & ImportedModuleMeta>;

/**
 * These are dependency loader methods used to dynamically
 * load runtime tooling. This allows us to opt into using
 * a consumer's local version of a given tool if it exists
 * and gracefully falls back to suru's internal versions if
 * the consumer has not specified their own in their package
 */

export const babel: ToolingDependency<typeof Babel> = async (local = true) =>
  importModule(BABEL_DEPENDENCIES.BABEL, local);
export const eslint: ToolingDependency<typeof ESLint> = async (local = true) =>
  importModule(ESLINT_DEPENDENCIES.ESLINT, local);

export const jestLib: ToolingDependency<typeof Jest> = async (local = true) =>
  importModule(JEST_DEPENDENCIES.JEST, local);
export const rollup: ToolingDependency<typeof Rollup> = async (local = true) =>
  importModule(ROLLUP_DEPENDENCIES.ROLLUP, local);
export const rollupBabel: ToolingDependency<typeof RollupPluginBabel> = async (local = true) =>
  importModule(ROLLUP_DEPENDENCIES.PLUGIN_BABEL, local);
export const rollupPluginTerser: ToolingDependency<typeof RollupPluginTerser> = async (
  local = true
) => importModule(ROLLUP_DEPENDENCIES.PLUGIN_TERSER, local);
export const rollupPeerDepsExternal: ToolingDependency<
  typeof RollupPluginPeerDepsExternal
> = async (local = true) => importModule(ROLLUP_DEPENDENCIES.PLUGIN_PEER_DEPS_EXTERNAL, local);
export const typescript: ToolingDependency<Typescript> = async (local = true) =>
  importModule(TYPESCRIPT_DEPENDENCIES.TYPESCRIPT, local);
