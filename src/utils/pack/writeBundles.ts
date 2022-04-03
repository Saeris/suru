import type { OutputOptions, RollupBuild } from "rollup";
import { log } from "../../logging";

export const writeBundles = async (
  bundle: RollupBuild,
  targets: OutputOptions[]
): Promise<void> => {
  log(`Writing ${targets.length / 2} bundle target(s) to ./dist`);
  await Promise.all(targets.map(async (target) => bundle.write(target)));
  await bundle.close();
};
