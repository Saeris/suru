import type { ImportedModuleMeta } from "../../types/module";
import { hasLocalVersion } from "./hasLocalVersion";
import { importModule } from "./importModule";

export const loadLocalDependency = async <T extends object>(
  dependency: string
): Promise<T & ImportedModuleMeta> =>
  importModule<T>(dependency, await hasLocalVersion(dependency));
