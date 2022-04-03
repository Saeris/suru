import type { Uses } from "./types";
import { withConfig } from "./withConfig";

export const JEST_DEPENDENCIES = {
  JEST: `jest`,
  BABEL_JEST: `babel-jest`,
  TYPES_JEST: `@types/jest`
} as const;

export const usesJest: Uses = async (dependenciesToCheck, gitRoot) =>
  withConfig({
    configName: `jest`,
    gitRoot,
    dependencyMap: JEST_DEPENDENCIES,
    dependenciesToCheck
  });
