import { filterFilesByExtensions } from "../filterFilesByExtensions";

describe(`filterFilesByExtensions`, () => {
  it(`correctly filters filepaths`, () => {
    const files = [
      `./src/types/git.ts`,
      `./src/utils/__tests__/__fixtures__/findJSXFiles/notJSX.js`,
      `./src/utils/__tests__/__fixtures__/findJSXFiles/usesJSX.jsx`,
      `./src/utils/__tests__/__fixtures__/findJSXFiles/usesTSX.tsx`
    ];
    const actual = filterFilesByExtensions(files, [`.js`, `.jsx`]);
    const expected = [
      `./src/utils/__tests__/__fixtures__/findJSXFiles/notJSX.js`,
      `./src/utils/__tests__/__fixtures__/findJSXFiles/usesJSX.jsx`
    ];
    expect(actual).toStrictEqual(expected);
  });
});
