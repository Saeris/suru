import ts from "typescript";
import { loadCompilerOptions } from "../loadCompilerOptions";
import type { CompilerOptions } from "../types";

const compilerOptions = {
  allowJs: true
} as CompilerOptions;

describe(`loadCompilerOptions`, () => {
  it(`loads the compiler options for the given project`, () => {
    jest.spyOn(ts.sys, `fileExists`).mockReturnValueOnce(true);
    jest.spyOn(ts.sys, `readFile`).mockReturnValueOnce(JSON.stringify(compilerOptions));
    jest.spyOn(ts, `readConfigFile`).mockReturnValueOnce({ config: { compilerOptions } });
    expect(loadCompilerOptions(`foo`)).toStrictEqual(expect.objectContaining(compilerOptions));
    jest.restoreAllMocks();
  });

  it(`throws an error if the file doesn't exist`, () => {
    expect(() => loadCompilerOptions(`foo`)).toThrow(/Unable to find a configuration file in/);
  });

  it(`throws an error when given an invalid tsconfig`, () => {
    jest.spyOn(ts.sys, `fileExists`).mockReturnValueOnce(true);
    expect(() => loadCompilerOptions(`foo`)).toThrow(/Error reading typescript configration/);
    jest.restoreAllMocks();
  });
});
