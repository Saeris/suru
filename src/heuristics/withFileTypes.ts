import { findFilesByExtension } from "../filesystem";
import type { WithConfigOpts } from "./withConfig";
import { withConfig } from "./withConfig";

export const withFileTypes = async ({
  configName,
  gitRoot,
  dependencyMap,
  dependenciesToCheck,
  extensions
}: WithConfigOpts & {
  extensions: string[];
}): Promise<boolean> => {
  switch (true) {
    case await withConfig({ configName, gitRoot, dependencyMap, dependenciesToCheck }): {
      return true;
    }
    // search for files of the specified types from the repository root
    case (await findFilesByExtension(extensions, gitRoot)).length > 0: {
      return true;
    }
    default: {
      return false;
    }
  }
};
