import glob from "fast-glob";

export const hasExtension = (extensions: string[]): boolean =>
  glob.sync(`**/*.{${extensions.join(`,`)}}`, { ignore: [`node_modules`] }).length > 0;
