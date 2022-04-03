import { promises as fs } from "fs";
import { statusMatrix } from "isomorphic-git";
import type { GitStatus } from "../../types/git";
import { isClean, wasDeleted } from "../../types/git";
import { getConsumerRoot } from "./getConsumerRoot";

export const getDirtyFiles = async (): Promise<string[]> => {
  const status: GitStatus[] = await statusMatrix({ fs, dir: await getConsumerRoot() });
  return status.reduce<string[]>(
    (files, fileStatus) =>
      !isClean(fileStatus) && !wasDeleted(fileStatus) ? files.concat([fileStatus[0]]) : files,
    []
  );
};
