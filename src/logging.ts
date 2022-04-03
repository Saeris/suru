import util from "util";
import type { Logger } from "winston";
import winston, { createLogger, format } from "winston";
import chalk from "chalk";
import colorize from "json-colorizer";
import type { Interfaces } from "@oclif/core";
import { Errors } from "@oclif/core";

type SetupReporting = (options?: {
  level?: "debug" | "info" | "warn" | "error";
  transports?: winston.transport[];
}) => Logger;

const defaults = {
  level: `info`,
  transports: [
    new winston.transports.Console({
      format: format.combine(
        format.timestamp({
          format: `H:mm:ss.SSS a`
        }),
        format.colorize(),
        format.printf(({ level: lvl, message, timestamp, meta, ...rest }) => {
          rest;
          const label = chalk.white.bgMagentaBright(`[suru]`);
          const time = chalk.cyan.dim(`[${String(timestamp)}]`);
          const levels = {
            debug: chalk.blue(`debug`),
            info: chalk.green(`info`),
            warn: chalk.yellow(`warn`),
            error: chalk.red(`error`)
          };
          type LogLevels = keyof typeof levels;
          // eslint-disable-next-line no-control-regex
          const decolorizeRegex =
            // eslint-disable-next-line no-control-regex
            /[\u001b\u009b][[()#;?]*(?:[0-9]{1,4}(?:;[0-9]{0,4})*)?[0-9A-ORZcf-nqry=><]/g;
          const decolorizeLevel = (str: string): LogLevels =>
            str.replace(decolorizeRegex, ``) as LogLevels;
          // @ts-expect-error
          const args = [message, ...(rest[Symbol.for(`splat`)] || [])].map((arg) =>
            typeof arg === `string` ? arg : colorize(arg, { pretty: true })
          );
          const msg = util.format(...args);
          return [`verbose`, `debug`].includes(lvl)
            ? `${label} ${time} ${levels[decolorizeLevel(lvl)!]} - ${msg}`
            : msg;
        })
      )
    })
  ]
};

export const setupReporting: SetupReporting = ({
  level = defaults.level,
  transports = defaults.transports
} = {}) => {
  const logger = createLogger({
    level,
    transports
  });

  return logger;
};

export const logger = setupReporting({ level: process.env.DEBUG ? `debug` : `info` });

export const log = (message?: string | any, ...args: any[]): void => {
  if (message) {
    logger.info(message, ...args);
  }
};

export const warn = logger.warn.bind(logger);
export const debug = logger.debug.bind(logger);

export interface ErrorLogger {
  (
    input: string | Error,
    options: {
      code?: string;
      exit: false;
    } & Interfaces.PrettyPrintableError
  ): void;
  (
    input: string | Error,
    options?: {
      code?: string;
      exit?: number;
    } & Interfaces.PrettyPrintableError
  ): never;
}

export const error: ErrorLogger = (input: string | Error, options = {}) =>
  Errors.error(input, options);
