import path from "path";

export const filterFilesByExtensions = (filePaths: string[], extensions: string[]): string[] =>
  filePaths.filter((filepath) => {
    const { ext } = path.parse(filepath);
    return extensions.includes(ext);
  });
