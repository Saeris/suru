import { orderKeys } from "../orderKeys";

describe(`orderKeys`, () => {
  it(`sorts object keys alphabetically`, () => {
    const obj = { b: `bar`, 1: `foo`, a: `baz` };
    const actual = Object.keys(orderKeys(obj)); //?
    const expected = [`1`, `a`, `b`];
    expect(actual).toStrictEqual(expected);
  });
});
