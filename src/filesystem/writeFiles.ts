import { writeFile } from "fs/promises";
import { error } from "../logging";
import { createDirectories } from "./createDirectories";

/**
 * Writes the given Map of files to disk. If a file entry has not contents,
 * that file will be skipped.
 *
 * @param files A Map of filepath and contents string pairs.
 */
export const writeFiles = async (files: Map<string, string | null | undefined>): Promise<void> => {
  try {
    // Create Directories
    await createDirectories([...files.keys()]);
    // Write Files
    await Promise.all(
      [...files].reduce<Promise<void>[]>((res, [filePath, contents]) => {
        // Only write files that have any content
        if (contents) {
          res.push(writeFile(filePath, contents, { encoding: `utf8` }));
        }
        return res;
      }, [])
    );
  } catch (err: unknown) {
    error(`Failed to write files`);
  }
};
