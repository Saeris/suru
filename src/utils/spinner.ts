import ora from "ora";

export const spinner = (
  text: string,
  { silent, prefix }: { silent?: boolean; prefix?: string } = {
    silent: false
  }
): ReturnType<typeof ora> =>
  ora({
    prefixText: prefix,
    text,
    isSilent: silent
  });
