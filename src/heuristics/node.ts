import { dependsOn } from "./dependsOn";

export const NODE_DEPENDENCIES = {
  TYPES_NODE: `@types/node`
} as const;

export const usesNode = (dependenciesToCheck: string[]): boolean =>
  dependsOn(Object.values(NODE_DEPENDENCIES))(dependenciesToCheck);
