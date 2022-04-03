import { findFilesByExtension } from "../findFilesByExtension";

describe(`findFilesByExtension`, () => {
  it(`finds files by the given extensions`, async () => {
    const singleExt = await findFilesByExtension([`ts`]);
    const multipleExt = await findFilesByExtension([`ts`, `spec.ts`]);
    const expectedSingle = expect.arrayContaining([`src/filesystem/findFilesByExtension.ts`]);
    const expectedMultiple = expect.arrayContaining([
      `src/filesystem/__tests__/findFilesByExtension.spec.ts`
    ]);
    expect(singleExt).toStrictEqual(expectedSingle);
    expect(multipleExt).toStrictEqual(expectedMultiple);
  });

  it(`throws if 'extensions' is the incorrect shape`, async () => {
    const message = `Expected array to not be empty`;
    await expect(findFilesByExtension([])).rejects.toThrow(message);
    await expect(findFilesByExtension(undefined)).rejects.toThrow(message);
  });
});
