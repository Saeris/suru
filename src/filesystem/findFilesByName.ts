import glob from "fast-glob";
import ow from "ow";

/**
 * Recursively searches the filesystem for files that match the given list of filenames.
 *
 * @param names A list of filenames to search for.
 * @param cwd Path to a directory to search from.
 * (Optional, defaults to `process.cwd()`)
 * @param ignore A list of glob patterns to ignore.
 * (Optional, defaults to `[]`)
 */
export const findFilesByName = async (
  names: string[],
  cwd: string = process.cwd(),
  ignore: string[] = []
): Promise<string[]> => {
  ow(names, ow.array.nonEmpty.ofType(ow.string));
  ow(cwd, ow.any(ow.string, ow.undefined));
  return glob(`**/${names.length > 1 ? `{${names.join(`,`)}}` : names[0]}.*`, {
    cwd,
    ignore: [`node_modules`, ...ignore],
    caseSensitiveMatch: false
  });
};
