import { cosmiconfig } from "cosmiconfig";
import type { CosmiconfigResult } from "cosmiconfig/dist/types";

export interface ConfigSearchOpts {
  gitRoot?: string;
  searchPlaces?: string[];
}

// NOTE: Might need to add a caching strategy here to reuse cosmiconfig instances
export const findConfig = async (
  name: string,
  {
    gitRoot: stopDir = process.cwd(),
    searchPlaces = [
      `package.json`,
      `.${name}rc`,
      `.${name}rc.json`,
      `.${name}rc.yaml`,
      `.${name}rc.yml`,
      `.${name}rc.js`,
      `.${name}rc.cjs`,
      `${name}.config.js`,
      `${name}.config.cjs`
    ]
  }: ConfigSearchOpts
): Promise<CosmiconfigResult> => cosmiconfig(name, { stopDir, searchPlaces }).search();

export const configExists = async (name: string, searchOpts: ConfigSearchOpts): Promise<boolean> => {
  const result = await findConfig(name, searchOpts);
  return result === null;
};
