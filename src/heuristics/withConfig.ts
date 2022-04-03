import { dependsOn } from "./dependsOn";
import type { ConfigSearchOpts } from "./findConfig";
import { configExists } from "./findConfig";

export interface WithConfigOpts extends ConfigSearchOpts {
  configName: string;
  dependencyMap: Record<string, string>;
  dependenciesToCheck: string[];
}

export const withConfig = async ({
  configName,
  gitRoot,
  searchPlaces,
  dependencyMap,
  dependenciesToCheck
}: WithConfigOpts): Promise<boolean> => {
  switch (true) {
    case dependsOn(Object.values(dependencyMap))(dependenciesToCheck): {
      return true;
    }
    case await configExists(configName, { gitRoot, searchPlaces }): {
      return true;
    }
    default: {
      return false;
    }
  }
};
