import { getDependenciesToUpdate } from "../getDependenciesToUpdate";

jest.mock(`../getInstalledDependencies`, () => ({
  getInstalledDependencies: jest.fn().mockResolvedValue(new Map([[`@babel/core`, `1.0.0`]]))
}));

describe(`getDependenciesToUpdate`, () => {
  it(`returns a list of dependencies that need updating`, async () => {
    const actual = await getDependenciesToUpdate(new Map([[`@babel/core`, `2.0.0`]]));
    const expected = [`@babel/core`];
    expect(actual).toStrictEqual(expected);
  });

  it(`returns an empty list when all dependencies are up to date`, async () => {
    const actual = await getDependenciesToUpdate(new Map([[`@babel/core`, `1.0.0`]]));
    const expected = [];
    expect(actual).toStrictEqual(expected);
  });

  it(`adds missing dependencies`, async () => {
    const actual = await getDependenciesToUpdate(new Map([[`rollup`, `1.0.0`]]));
    const expected = [`rollup`];
    expect(actual).toStrictEqual(expected);
  });
});
