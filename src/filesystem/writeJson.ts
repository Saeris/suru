import type { ImportedJSONMeta } from "../types/jsonMeta";
import { INDENT } from "../types/jsonMeta";
import { writeFiles } from "./writeFiles";

/**
 * Serializes the given `json` object and writes it to the given `filePath`.
 * @param filePath The path to write to. Must include the filename and extension.
 * @param json An object to be serialized. Will use `INDENT` metadata if it exists,
 * otherwise the resulting string will have a default indentation of 2 spaces.
 */
export const writeJson = async <T extends object & ImportedJSONMeta = {}>(
  filePath: string,
  json: T
): Promise<void> =>
  writeFiles(new Map([[filePath, `${JSON.stringify(json, null, json[INDENT] ?? 2)}\n`]]));
