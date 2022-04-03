import type { ImportedModuleMeta } from "../../types/module";
import { LOCAL, MODULENAME, VERSION } from "../../types/module";
import * as allDependencies from "../../dependencies";
import { log } from "../../logging";

/**
 * Logs to the console all of the dynamically loaded
 * tool package versions, filtered by the given map.
 * @param filter A map of dependency names and a boolean flags to determine what version to log (local or internal)
 */
export const logDependencyVersions = async (
  filter: Map<string, boolean> = new Map()
): Promise<void> => {
  const dependencies: ImportedModuleMeta[] = await Promise.all(
    Object.values(allDependencies)
      .filter((dependency) => !filter.size || filter.has(dependency.name))
      .map(async (dependency) => dependency(!filter.size || filter.get(dependency.name)))
  );
  dependencies.forEach(({ [MODULENAME]: name, [VERSION]: version, [LOCAL]: local }) => {
    log(`  Using ${local ? `local` : `internal`} ${name!} v${version!}`);
  });
};
