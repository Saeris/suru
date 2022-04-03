import fs from "fs";
import path from "path";

/**
 * Is project using Yarn?
 */
export const usesYarn = (dir: string = process.cwd()): boolean => fs.existsSync(path.join(dir, `yarn.lock`));

/**
 * Is project using Yarn@berry?
 */
export const usesYarnBerry = (dir: string = process.cwd()): boolean =>
  usesYarn() && fs.existsSync(path.join(dir, `.yarnrc.yml`));
