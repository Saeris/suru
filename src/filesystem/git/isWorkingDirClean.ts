import { promises as fs } from "fs";
import { statusMatrix } from "isomorphic-git";
import type { GitStatus } from "../../types/git";
import { isClean } from "../../types/git";
import { getConsumerRoot } from "./getConsumerRoot";

export const isWorkingDirClean = async (): Promise<boolean> => {
  const status: GitStatus[] = await statusMatrix({ fs, dir: await getConsumerRoot() });
  return status.every((file) => isClean(file));
};
