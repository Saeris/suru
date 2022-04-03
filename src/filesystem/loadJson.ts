import { promises as fs } from "fs";
import detectIndent from "detect-indent";
import stripJsonComments from "strip-json-comments";
import type { ImportedJSONMeta } from "../types/jsonMeta";
import { FILEPATH, INDENT } from "../types/jsonMeta";

export const loadJson = async <T extends object>(
  filePath: string
): Promise<T & ImportedJSONMeta> => {
  try {
    const file = (await fs.readFile(filePath)).toString();
    return {
      [INDENT]: detectIndent(file).indent,
      [FILEPATH]: filePath,
      ...JSON.parse(stripJsonComments(file))
    };
  } catch {
    throw new Error(`Could not read JSON file at location: ${filePath}`);
  }
};
