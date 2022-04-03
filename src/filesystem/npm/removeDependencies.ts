import execa from "execa";

/**
 * Uninstalls the given list of dependencies to the consumer's package manifest
 * using `yarn remove`.
 *
 * @param dependencies An array of dependency names to uninstall.
 */
export const removeDependencies = async (
  dependencies: string[] = new Array<string>()
): Promise<void> => {
  try {
    await execa(`yarn`, [`remove`, ...dependencies], {
      env: { FORCE_COLOR: `true` },
      cwd: process.cwd(),
      stdio: `inherit`
    });
  } catch (err: unknown) {
    throw new Error(`Failed to remove dependencies: ${(err as Error).message}`);
  }
};
