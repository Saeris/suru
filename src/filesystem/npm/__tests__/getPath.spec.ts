import { getPath } from "../getPath";

describe(`getPath`, () => {
  it(`resolves the path to a module`, async () => {
    const actual = await getPath(`rollup`);
    const expected = `@saeris\\suru\\node_modules\\rollup\\package.json`;
    expect(actual.endsWith(expected)).toBeTruthy();
  });
});
