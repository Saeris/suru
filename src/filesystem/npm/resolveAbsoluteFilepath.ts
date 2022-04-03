import { isAbsolute } from "path";
import resolvePackagePath from "resolve-package-path";
import { getConsumerRoot } from "../git/getConsumerRoot";

export const resolveAbsoluteFilepath = async (
  moduleName: string = process.cwd(),
  baseDir?: string
): Promise<string | null> => {
  const consumerRoot = await getConsumerRoot();
  return isAbsolute(moduleName)
    ? resolvePackagePath.findUpPackagePath(moduleName)
    : resolvePackagePath(moduleName, baseDir ?? consumerRoot);
};
