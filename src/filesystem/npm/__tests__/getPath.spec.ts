import { getPath } from "../getPath";

describe(`getPath`, () => {
  it(`resolves the path to a module`, async () => {
    const actual = await getPath(`rollup`);
    const expected = `suru\\node_modules\\rollup\\`;
    expect(actual).toContain(expected);
  });
});
