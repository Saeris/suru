import glob from "fast-glob";
import ow from "ow";

/**
 * Recursively searches the filesystem for files with the given file
 * extensions.
 *
 * @param extensions A list of file extensions to search for.
 * @param cwd Path to a directory to search from.
 * (Optional, defaults to `process.cwd()`)
 * @param ignore A list of glob patterns to ignore.
 * (Optional, defaults to `[]`)
 */
export const findFilesByExtension = async (
  extensions: string[],
  cwd: string = process.cwd(),
  ignore: string[] = []
): Promise<string[]> => {
  ow(extensions, ow.array.nonEmpty.ofType(ow.string));
  ow(cwd, ow.any(ow.string, ow.undefined));
  return glob(`**/*.${extensions.length > 1 ? `{${extensions.join(`,`)}}` : extensions[0]}`, {
    cwd,
    ignore: [`node_modules`, ...ignore]
  });
};
