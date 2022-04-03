import { promises as fs } from "fs";
import * as parser from "@babel/parser";
import traverse from "@babel/traverse";

export const findJSXFiles = async (filePaths: string[] = []): Promise<string[]> => {
  const JSXFiles: string[] = [];

  await Promise.all(
    filePaths.map(async (filePath) => {
      const code = await fs.readFile(filePath, `utf8`);
      try {
        const ast = parser.parse(code, {
          sourceType: `unambiguous`,
          plugins: [`jsx`, `typescript`, `exportDefaultFrom`]
        });
        traverse(ast, {
          JSXElement(path): void {
            JSXFiles.push(filePath);
            // We found a file that contains JSX, so stop traversal early
            path.stop();
          }
        });
      } catch (err: unknown) {
        err; //?
      }
    })
  );

  return JSXFiles;
};
