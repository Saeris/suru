import chalk from "chalk";
import type { ESLint } from "eslint";
import stripAnsi from "strip-ansi";
import textTable from "text-table";

export const stylishStats: ESLint.Formatter["format"] = (results) => {
  let output = `\n`;
  let errors = 0;
  let warnings = 0;
  let errorFixes = 0;
  let warnFixes = 0;
  let summaryColor = `yellow`;
  const errMap = new Map<string, number>();
  const warnMap = new Map<string, number>();

  // Messages
  results.forEach((result) => {
    const messages = result.messages;

    if (messages.length === 0) {
      return;
    }

    errors += result.errorCount;
    warnings += result.warningCount;
    errorFixes += result.fixableErrorCount;
    warnFixes += result.fixableWarningCount;

    output += `${chalk.underline(result.filePath)}\n`;

    const table = textTable(
      messages.map(({ fatal, severity, line, column, message, ruleId }) => {
        const type = fatal ?? severity === 2;
        const map = type ? errMap : warnMap;
        if (type) {
          summaryColor = `red`;
        }
        if (ruleId) {
          map.set(ruleId, (map.get(ruleId) ?? 0) + 1);
        }
        return [
          ``,
          line || 0,
          column || 0,
          type ? chalk.red(`error`) : chalk.yellow(`warning`),
          message.replace(/(?<foo>[^ ])\.$/u, `$1`),
          chalk.dim(ruleId ?? ``)
        ];
      }),
      {
        align: [null, `r`, `l`],
        stringLength(str) {
          return stripAnsi(str).length;
        }
      }
    )
      .split(`\n`)
      .map((el) =>
        el.replace(/(?<line>\d+)\s+(?<col>\d+)/u, (_, l, c) =>
          chalk.dim(`${String(l)}:${String(c)}`)
        )
      )
      .join(`\n`);

    output += `${String(table)}\n\n`;

    console.log({ warnMap });
  });

  // Summary

  const total = errors + warnings;
  const suffix = (count: number): string => (count === 1 ? `` : `s`);

  if (total > 0) {
    output += chalk[summaryColor].bold(
      `\u2716 ${total} problem${suffix(total)} (${errors} error${suffix(
        errors
      )}, ${warnings} warning${suffix(warnings)})\n`
    );

    if (errorFixes > 0 || warnFixes > 0) {
      output += chalk[summaryColor].bold(
        `  ${errorFixes} error${suffix(errorFixes)} and ${warnFixes} warning${suffix(
          warnFixes
        )} potentially fixable with the \`--fix\` option.\n`
      );
    }
  }

  // Resets output color, for prevent change on top level
  return total > 0 ? chalk.reset(output) : ``;
};
