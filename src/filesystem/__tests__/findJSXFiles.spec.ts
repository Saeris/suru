import path from "path";
import glob from "fast-glob";
import { findJSXFiles } from "../findJSXFiles";

describe(`findJSXFiles`, () => {
  it(`properly identifies files that use JSX`, async () => {
    const fixtures = (
      await glob(`./__fixtures__/findJSXFiles/*`, {
        cwd: __dirname
      })
    ).map((filePath) => path.join(__dirname, filePath));
    const actual = await findJSXFiles(fixtures);
    const expected = fixtures.slice(1);
    expect(actual).toStrictEqual(expected);
  });
});
