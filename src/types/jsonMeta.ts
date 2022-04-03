export const INDENT: unique symbol = Symbol.for(`indent`);
export const FILEPATH: unique symbol = Symbol.for(`filePath`);

/**
 * Used as added metadata to JSON file imports.
 *
 * Each property of this interface is a `Symbol`,
 * which is non-enumerable and non-serializeable,
 * meaning that these metadata keys will be safely
 * omitted when writing the JSON back to disk.
 */
export interface ImportedJSONMeta {
  /**
   * The indentation whitespace of the original raw
   * JSON file. This is used to preserve the original
   * formmatting when writing the JSON back to disk.
   */
  [INDENT]?: string;
  /**
   * The original location of the imported JSON on
   * disk. Used to wriie back to the original file.
   */
  [FILEPATH]?: string;
}
