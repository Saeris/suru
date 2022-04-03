import { dirname } from "path";
import mkdirp from "mkdirp";

/**
 * Creates new filesystem directories.
 *
 * @param directories An array of directory paths to create.
 */
export const createDirectories = async (directories: string[]): Promise<void> => {
  await Promise.all(directories.map(async (directory) => mkdirp(dirname(directory))));
};
