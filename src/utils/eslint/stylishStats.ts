import chalk from "chalk";
import type { ESLint } from "eslint";
import stripAnsi from "strip-ansi";
import textTable from "text-table";

export const stylishStats: ESLint.Formatter["format"] = (results) => {
  const errMap = new Map<string, [number, boolean]>();
  const warnMap = new Map<string, [number, boolean]>();
  let output = results.reduce((out, { filePath, messages }) => {
    if (messages.length === 0) {
      return out;
    }

    return `${out}${chalk.underline(filePath)}\n${String(
      textTable(
        messages.map(({ fatal, severity, line, column, message, ruleId, fix }) => {
          const type = fatal ?? severity === 2;
          const map = type ? errMap : warnMap;
          if (ruleId) {
            map.set(ruleId, [(map.get(ruleId)?.[0] ?? 0) + 1, Boolean(fix)]);
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
        .join(`\n`)
    )}\n\n`;
  }, `\n`);

  // Summary
  const errors = errMap.size;
  const warnings = warnMap.size;
  const errorFixes = [...errMap.values()].filter(([_, fixable]) => fixable).length;
  const warnFixes = [...warnMap.values()].filter(([_, fixable]) => fixable).length;
  const summaryColor = errors >= 1 ? `red` : `yellow`;
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

  // eslint-disable-next-line no-console
  console.log({ warnMap });

  // Resets output color, for prevent change on top level
  return total > 0 ? chalk.reset(output) : ``;
};
