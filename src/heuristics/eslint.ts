import type { Uses } from "./types";
import { withConfig } from "./withConfig";

export const REQUIRED_ESLINT_DEPENDENCIES = {
  TYPESCRIPT_ESLINT_PLUGIN: `@typescript-eslint/eslint-plugin`,
  TYPESCRIPT_ESLINT_PARSER: `@typescript-eslint/parser`,
  ESLINT: `eslint`
} as const;

export const UNECESSARY_ESLINT_DEPENDENCIES = {
  ESLINT_IMPORT_RESOLVER_NODE: `eslint-import-resolver-node`,
  ESLINT_PLUGIN_IMPORT: `eslint-plugin-import`,
  ESLINT_PLUGIN_PROMISE: `eslint-plugin-promise`,
  ESLINT_PLUGIN_JEST: `eslint-plugin-jest`,
  ESLINT_PLUGIN_JSX_A11Y: `eslint-plugin-jsx-a11y`,
  ESLINT_PLUGIN_REACT: `eslint-plugin-react`,
  ESLINT_PLUGIN_REACT_HOOKS: `eslint-plugin-react-hooks`
} as const;

export const ESLINT_DEPENDENCIES = {
  ...REQUIRED_ESLINT_DEPENDENCIES,
  ...UNECESSARY_ESLINT_DEPENDENCIES
} as const;

export const usesEslint: Uses = async (dependenciesToCheck, gitRoot) =>
  withConfig({
    configName: `eslint`,
    gitRoot,
    dependencyMap: ESLINT_DEPENDENCIES,
    dependenciesToCheck
  });
