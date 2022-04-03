declare module "read-package-json" {
  import type { Package } from "normalize-package-data";
  // eslint-disable-next-line import/no-default-export
  export default function readJson(file: string, cb?: (err: Error, data: Package) => void): Package;
}
