import { moduleNameToPascalCase } from "../moduleNameToPascalCase";

describe(`scopeToPascalCase`, () => {
  it(`transforms scoped package names`, () => {
    const scopedPkg = `@example/scoped-package`;
    const actual = moduleNameToPascalCase(scopedPkg);
    const expected = `example__scopedPackage`;
    expect(actual).toStrictEqual(expected);
  });

  it(`transforms unscoped package names`, () => {
    const unscopedPkg = `unscoped-package`;
    const actual = moduleNameToPascalCase(unscopedPkg);
    const expected = `unscopedPackage`;
    expect(actual).toStrictEqual(expected);
  });

  it(`does not transform pascal cased package names`, () => {
    const pascalPackage = `pascalPackage`;
    const actual = moduleNameToPascalCase(pascalPackage);
    const expected = `pascalPackage`;
    expect(actual).toStrictEqual(expected);
  });
});
