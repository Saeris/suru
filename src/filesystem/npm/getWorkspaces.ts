import { join } from "path";
import glob from "fast-glob";
import type { Package } from "../../types/package";
import { getConsumerRoot } from "../git/getConsumerRoot";
import { loadManifest } from "./loadManifest";

/**
 * Retrieves the `package.json` files for each workspace in the Consumer's root
 */
export const getWorkspaces = async (): Promise<Package[]> => {
  const root = await getConsumerRoot();
  const rootManifest = await loadManifest(root, { local: true });
  const workspaces = Array.isArray(rootManifest.workspaces)
    ? rootManifest.workspaces
    : [...(rootManifest.workspaces?.packages ?? []), rootManifest.workspaces?.nohoist ?? []];
  const workspacePaths = (
    await Promise.all(
      workspaces.map(async (workspace) => glob(`${String(workspace)}/package.json`))
    )
  ).flat();
  return Promise.all(
    workspacePaths.map(async (workspace) =>
      loadManifest(join(root, workspace.replace(`/package.json`, ``)), { local: true })
    )
  );
};
