import * as rollup from "rollup";
import { loadLocalDependency } from "../loadLocalDependency";

describe(`loadLocalDependency`, () => {
  it(`loads a dependency`, async () => {
    const actual = await loadLocalDependency(`rollup`);
    expect(actual).toMatchObject(expect.objectContaining(rollup));
  });
});
