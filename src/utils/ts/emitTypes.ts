/* eslint-disable no-console */
import type Typescript from "typescript";
import type { PickKnown } from "../../types";
import type { NormalizedCompilerOptions } from "./normalizeCompilerOptions";
import { omit } from "../omit";

export const emitTypes = ({
  ts,
  fileNames,
  options,
  outDir
}: {
  ts: typeof Typescript;
  fileNames: string[];
  options: Typescript.CompilerOptions | PickKnown<NormalizedCompilerOptions>;
  outDir: string;
}): {
  program: Typescript.Program;
  emitResult: Typescript.EmitResult;
  results: Map<string, string>;
} => {
  const results = new Map<string, string>();
  const config: Typescript.CompilerOptions = {
    ...(omit(options, [`moduleResolution`]) as Typescript.CompilerOptions),
    emitDeclarationOnly: true,
    declarationMap: false,
    declarationDir: outDir
  };
  const host = ts.createCompilerHost(config);
  host.writeFile = (fileName: string, contents: string): void => {
    results.set(fileName, contents);
  };
  const program = ts.createProgram(fileNames, config, host);
  const emitResult = program.emit();
  return { program, emitResult, results };
};
