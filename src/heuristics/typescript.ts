import type { Uses } from "./types";
import { withFileTypes } from "./withFileTypes";

export const TYPESCRIPT_DEPENDENCIES = {
  TYPESCRIPT: `typescript`
} as const;

export const usesTypescript: Uses = async (dependenciesToCheck, gitRoot) =>
  withFileTypes({
    configName: `tsconfig`,
    gitRoot,
    dependencyMap: TYPESCRIPT_DEPENDENCIES,
    dependenciesToCheck,
    searchPlaces: [`tsconfig.json`],
    extensions: [`ts`, `tsx`]
  });
