/* eslint-disable no-console */
import type { PickKnown } from "../../types";
import type { NormalizedCompilerOptions } from "./normalizeCompilerOptions";
import { omit } from "../omit";
import type { Typescript, CompilerOptions, Program, EmitResult } from "./types";

export const emitTypes = ({
  ts,
  fileNames,
  options,
  outDir
}: {
  ts: Typescript;
  fileNames: string[];
  options: CompilerOptions | PickKnown<NormalizedCompilerOptions>;
  outDir: string;
}): {
  program: Program;
  emitResult: EmitResult;
  results: Map<string, string>;
} => {
  const results = new Map<string, string>();
  const config: CompilerOptions = {
    ...(omit(options, [`moduleResolution`]) as CompilerOptions),
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
