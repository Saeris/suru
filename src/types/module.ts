import type { Package } from "./package";

export const MODULELOCATION: unique symbol = Symbol.for(`modulelocation`);
export const MODULENAME: unique symbol = Symbol.for(`modulename`);
export const MANIFEST: unique symbol = Symbol.for(`manifest`);
export const VERSION: unique symbol = Symbol.for(`version`);
export const LOCAL: unique symbol = Symbol.for(`local`);

export interface ImportedModuleMeta {
  [MODULELOCATION]?: string;
  [MODULENAME]?: string;
  [MANIFEST]?: Package;
  [VERSION]?: string;
  [LOCAL]?: boolean;
}
