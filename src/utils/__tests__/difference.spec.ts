import { difference } from "../difference";

describe(`difference`, () => {
  it(`calculates the difference between two iterables`, () => {
    const A = new Set([1, 2, 3] as const);
    const B = [2, 2, 4, 5] as const;
    const actual = difference(A, B);
    const expected = [4, 5];
    expect(actual).toStrictEqual(expected);
  });
});
