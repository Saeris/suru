import type { Typescript, Program, EmitResult } from "./types";

export const getEmitDiagnostics = ({
  ts,
  program,
  emitResult
}: {
  ts: Typescript;
  program: Program;
  emitResult: EmitResult;
}): string[] =>
  ts
    .getPreEmitDiagnostics(program)
    .concat(emitResult.diagnostics)
    .map((diagnostic) => {
      if (diagnostic.file) {
        const { line, character } = ts.getLineAndCharacterOfPosition(
          diagnostic.file,
          diagnostic.start!
        );
        const message = ts.flattenDiagnosticMessageText(diagnostic.messageText, `\n`);
        return `${diagnostic.file.fileName} (${line + 1},${character + 1}): ${message}`;
      }
      return ts.flattenDiagnosticMessageText(diagnostic.messageText, `\n`);
    });
