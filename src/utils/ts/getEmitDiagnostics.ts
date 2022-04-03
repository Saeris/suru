import type Typescript from "typescript";

export const getEmitDiagnostics = ({
  ts,
  program,
  emitResult
}: {
  ts: typeof Typescript;
  program: Typescript.Program;
  emitResult: Typescript.EmitResult;
}): string[] =>
  ts
    .getPreEmitDiagnostics(program)
    .concat(emitResult.diagnostics)
    .map((diagnostic) => {
      if (diagnostic.file) {
        const { line, character } = ts.getLineAndCharacterOfPosition(diagnostic.file, diagnostic.start!);
        const message = ts.flattenDiagnosticMessageText(diagnostic.messageText, `\n`);
        return `${diagnostic.file.fileName} (${line + 1},${character + 1}): ${message}`;
      }
      return ts.flattenDiagnosticMessageText(diagnostic.messageText, `\n`);
    });
