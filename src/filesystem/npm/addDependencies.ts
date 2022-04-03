import execa from "execa";

/**
 * Installs the given list of dependencies to the consumer's package manifest
 * using `yarn add`.
 *
 * @param dependencies An array of dependency names to install.
 * @param dev Whether to install as a regular dependency or as a devDependency.
 * (Optional, default is `false`)
 */
export const addDependencies = async (
  dependencies: string[] = new Array<string>(),
  dev = false
): Promise<void> => {
  try {
    await execa(`yarn`, [`add`, dev ? `-D` : ``, ...dependencies], {
      env: { FORCE_COLOR: `true` },
      cwd: process.cwd(),
      stdio: `inherit`
    });
  } catch (err: unknown) {
    throw new Error(`Failed to add dependencies: ${(err as Error).message}`);
  }
};
