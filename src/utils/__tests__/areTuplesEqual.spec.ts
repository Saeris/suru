import { areTuplesEqual } from "../areTuplesEqual";

describe(`areTuplesEqual`, () => {
  it(`returns true when two tuples have the same values`, () => {
    const tupleA = [`foo`, `bar`];
    const tupleB = [`foo`, `bar`];
    const actual = areTuplesEqual(tupleA, tupleB); //?

    expect(actual).toBeTruthy();
  });

  it(`returns false when two tuples have different values`, () => {
    const tupleA = [`foo`, `bar`];
    const tupleB = [`foo`, `baz`];
    const actual = areTuplesEqual(tupleA, tupleB); //?

    expect(actual).toBeFalsy();
  });

  it(`returns false when arrays have different lengths`, () => {
    const tupleA = [`foo`, `bar`];
    const tupleB = [`foo`];
    const actual = areTuplesEqual(tupleA, tupleB); //?

    expect(actual).toBeFalsy();
  });
});
