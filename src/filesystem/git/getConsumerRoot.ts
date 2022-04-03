import fs from "fs";
import { findRoot } from "isomorphic-git";

/**
 * Resolves to the directory where the consumer's `.git`
 * directory exists. This is typically considered the
 * "project root", as the root `package.json` file lives
 * in this same directory
 */
export const getConsumerRoot = async (filepath: string = process.cwd()): Promise<string> =>
  findRoot({
    fs,
    filepath
  });
