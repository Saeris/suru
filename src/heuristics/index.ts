import { usesEslint } from "./eslint";
import { usesJest } from "./jest";
import { usesNext } from "./next";
import { usesNode } from "./node";
import { usesReact } from "./react";
import { usesTypescript } from "./typescript";
import { usesYarn, usesYarnBerry } from "./yarn";

export { REQUIRED_ESLINT_DEPENDENCIES, UNECESSARY_ESLINT_DEPENDENCIES, ESLINT_DEPENDENCIES } from "./eslint";
export { JEST_DEPENDENCIES } from "./jest";
export { REACT_DEPENDENCIES } from "./react";
export { TYPESCRIPT_DEPENDENCIES } from "./typescript";

export interface HeuristicsMap {
  usesEslint: boolean;
  usesJest: boolean;
  usesNext: boolean;
  usesNode: boolean;
  usesReact: boolean;
  usesTypescript: boolean;
  usesYarn: boolean;
  usesYarnBerry: boolean;
}

/**
 * There are three main ways in which we can run heuristics on a given class of dependencies:
 * 1. By the existance of known dependency names (react, @emotion/core, etc)
 * 2. By the existance of known configuration files (.eslintrc.js, tsconfig.json, etc)
 * 3. By the existance of known filename patterns (*.ts?x, *.stories.(j|t)s?x, etc)
 *
 * To ensure that we aren't missing anything, we also need to traverse the project's source tree
 * and search for nested packages (such as in a monorepo setup). Alternatively we can inspect the
 * root level yarn lockfile.
 *
 * Some places where projects could be defined in a monorep:
 * - root package.json (yarn workspaces)
 * - root tsconfig.json (typescript project references)
 * - root lerna.json (lerna packages)
 */
export const analyzeProject = async (gitRoot: string, dependencies: string[]): Promise<HeuristicsMap> => ({
  usesEslint: await usesEslint(dependencies, gitRoot),
  usesJest: await usesJest(dependencies, gitRoot),
  usesNext: usesNext(dependencies),
  usesNode: usesNode(dependencies),
  usesReact: usesReact(dependencies),
  usesTypescript: await usesTypescript(dependencies, gitRoot),
  usesYarn: usesYarn(gitRoot),
  usesYarnBerry: usesYarnBerry(gitRoot)
});
