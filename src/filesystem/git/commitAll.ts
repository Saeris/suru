import { promises as fs } from "fs";
import { statusMatrix, add, remove, commit } from "isomorphic-git";
import ow from "ow";
import { log } from "../../logging";
import { getConsumerRoot } from "./getConsumerRoot";
import { getGitConfig } from "./getGitConfig";

export const commitAll = async (message: string): Promise<void> => {
  ow(message, ow.string.nonEmpty);
  const repo = { fs, dir: await getConsumerRoot() };
  const { user: author } = await getGitConfig();
  const status = await statusMatrix(repo);
  await Promise.all(
    status.map(async ([filepath, , worktreeStatus]) =>
      worktreeStatus ? add({ ...repo, filepath }) : remove({ ...repo, filepath })
    )
  );
  const sha = await commit({
    ...repo,
    author,
    message
  });
  log(`  Successfully committed all files ${sha}`);
};
