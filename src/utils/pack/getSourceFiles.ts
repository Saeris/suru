import { findFilesByExtension } from "../../filesystem";

export const getSourceFiles = async ({
  cwd,
  ignore = []
}: {
  cwd: string;
  ignore?: string[];
}): Promise<string[]> =>
  findFilesByExtension([`js`, `jsx`, `ts`, `tsx`], cwd, [
    `**/*.d.ts`,
    `**/*.{spec,test}.{js,jsx,ts,tsx}`,
    `**/__mocks__/**/*.*`,
    `**/__snapshots__/**/*.*`,
    `**/__stories__/**/*.*`,
    `**/__tests__/**/*.*`,
    ...ignore
  ]);
