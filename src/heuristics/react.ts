import { dependsOn } from "./dependsOn";

export const REACT_DEPENDENCIES = {
  REACT: `react`,
  REACT_DOM: `react-dom`,
  TYPES_REACT: `@types/react`,
  TYPES_REACT_DOM: `@types/react-dom`
} as const;

export const usesReact = (dependenciesToCheck: string[]): boolean =>
  dependsOn(Object.values(REACT_DEPENDENCIES))(dependenciesToCheck);
