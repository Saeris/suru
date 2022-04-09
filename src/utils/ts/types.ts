// For whatever reason, importing any of these directly causes ESLint to take forever to run, so by using the import() syntax we can avoid that.

/* eslint-disable @typescript-eslint/consistent-type-imports */
export type Typescript = typeof import("typescript");
export type CompilerOptions = import("typescript").CompilerOptions;
export type EmitResult = import("typescript").EmitResult;
export type Program = import("typescript").Program;
