import { debug } from "../../logging";
import type { ImportedModuleMeta } from "../../types/module";
import { MODULELOCATION, LOCAL, MANIFEST, MODULENAME, VERSION } from "../../types/module";
import { omit } from "../../utils";
import { getPath } from "./getPath";
import { hasLocalVersion } from "./hasLocalVersion";
import { loadManifest } from "./loadManifest";

/**
 * Dynamically Imports the given Module.
 *
 * In testing, this method can be mocked since it is used for all
 * dynamic imports.
 *
 * ### Parameters
 *
 * @param moduleName Name of the module to import
 * @param local Optional flag specifying whether to import a Consumer's
 * local version of the module rather than suru's internal version.
 * (Default: `false`)
 */
export const importModule = async <T extends object & ImportedModuleMeta = {}>(
  moduleName: string,
  local: boolean = false
): Promise<T & ImportedModuleMeta> => {
  try {
    debug(`Resolving filepath for ${moduleName}`);
    const filePath = await getPath(moduleName, local);
    debug(`Importing ${moduleName} ${local ? `locally` : `internally`} from ${filePath}`);
    const dependency = omit(await import(filePath), [`default`]) as T;
    dependency[MODULELOCATION] = filePath;
    try {
      const manifest = await loadManifest(moduleName, { local });
      dependency[MANIFEST] = manifest;
      dependency[VERSION] = manifest.version;
    } catch {
      debug(`Imported module ${moduleName} does not have a package.json`);
    }
    dependency[MODULENAME] = moduleName;
    dependency[LOCAL] = await hasLocalVersion(moduleName);
    return dependency;
  } catch (err: unknown) {
    throw new Error(
      `Failed to resolve file path to module: ${moduleName}: ${(err as Error).message}`
    );
  }
};
