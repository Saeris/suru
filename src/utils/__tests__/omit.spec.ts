import { omit } from "../omit";

describe(`omit`, () => {
  it(`removes the given keys from the given object`, () => {
    const data = {
      foo: `foo`,
      bar: `bar`,
      qux: `qux`
    };
    const keys = [`foo`, `bar`];
    const expected = { qux: `qux` };
    const actual = omit(data, keys); //?.

    expect(actual).toStrictEqual(expected);
  });

  it(`doesn't remove keys if they don't exist`, () => {
    const data = {
      foo: `foo`,
      bar: `bar`,
      qux: `qux`
    };
    const keys = [`foobar`];
    const actual = omit(data, keys);

    expect(actual).toStrictEqual(data);
  });

  it(`returns the base object if the second argument is not given`, () => {
    const data = {
      foo: `foo`,
      bar: `bar`,
      qux: `qux`
    };
    const actual = omit(data);

    expect(actual).toStrictEqual(data);
  });
});
