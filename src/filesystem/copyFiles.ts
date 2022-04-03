import { copyFile } from "fs/promises";
import { createDirectories } from "./createDirectories";
import { exists } from "./exists";

/**
 * Copies each filepath in the given Map from it's source location
 * to the specified destination. The directory for each destination
 * will be created first.
 *
 * @param filePaths A Map of source and destination filepath string pairs.
 */
export const copyFiles = async (filePaths: Map<string, string>): Promise<Map<string, string>> => {
  await Promise.all(
    [...filePaths.keys()].map(async (file) => {
      if (!(await exists(file))) {
        filePaths.delete(file);
      }
    })
  );
  await createDirectories([...filePaths.values()]);
  return new Map(
    await Promise.all(
      [...filePaths].map<Promise<[string, string]>>(async ([source, destination]) => {
        await copyFile(source, destination);
        return [source, destination];
      })
    )
  );
};
