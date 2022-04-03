import { loadManifest } from "../loadManifest";

describe(`loadManifest`, () => {
  it(`loads a package manifest`, async () => {
    const actual = await loadManifest(); //?
    expect(actual).toMatchObject(
      expect.objectContaining({
        name: `@saeris/suru`,
        license: `MIT`
      })
    );
  });
});
