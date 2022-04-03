import parseGitConfig from "parse-git-config";
import type { Config } from "parse-git-config";
import getGitConfigPath from "git-config-path";

/**
 * Loads the current user's global Git config.
 * This will be different depending on the environment
 * the function is run in. If the user invoking this
 * function does not have a global Git config set, it
 * could fail. In CI environments, it's unlikely that
 * a global Git config is set.
 */
export const getGitConfig = async (): Promise<Config> => {
  const globalGitConfigPath = getGitConfigPath(`global`);
  const parsedConfig = await parseGitConfig({
    // eslint-disable-next-line no-undefined
    path: globalGitConfigPath ?? undefined
  });
  if (parsedConfig) {
    return Promise.resolve(parsedConfig);
  }
  return Promise.reject(new Error(`Failed to load global git config`));
};
