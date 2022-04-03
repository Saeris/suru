import { scopeToSnakeCase } from "../scopeToSnakeCase";

describe(`scopeToSnakeCase`, () => {
  it(`transforms scoped package names`, () => {
    const scopedPkg = `@example/scoped-package`;
    const actual = scopeToSnakeCase(scopedPkg);
    const expected = `example__scoped-package`;
    expect(actual).toStrictEqual(expected);
  });

  it(`does not transforms unscoped package names`, () => {
    const unscopedPkg = `unscoped-package`;
    const actual = scopeToSnakeCase(unscopedPkg);
    const expected = `unscoped-package`;
    expect(actual).toStrictEqual(expected);
  });
});
