import { dependsOn } from "./dependsOn";

export const NEXT_DEPENDENCIES = {
  NEXT: `next`
} as const;

export const usesNext = (dependenciesToCheck: string[]): boolean =>
  dependsOn(Object.values(NEXT_DEPENDENCIES))(dependenciesToCheck);
