import { pick } from "../pick";

describe(`pick`, () => {
  it(`extracts the given keys from the given object`, () => {
    const data = {
      foo: `foo`,
      bar: `bar`,
      qux: `qux`
    };
    const keys = [`foo`, `bar`];
    const expected = { foo: `foo`, bar: `bar` };
    const actual = pick(data, keys); //?.

    expect(actual).toStrictEqual(expected);
  });

  it(`returns an empty object if none of the keys exist in the source object`, () => {
    const data = {
      foo: `foo`,
      bar: `bar`,
      qux: `qux`
    };
    const keys = [`foobar`];
    const actual = pick(data, keys);

    expect(actual).toStrictEqual({});
  });

  it(`returns an empty object if the second argument isn't provided`, () => {
    const data = {
      foo: `foo`,
      bar: `bar`,
      qux: `qux`
    };
    const actual = pick(data);

    expect(actual).toStrictEqual({});
  });
});
