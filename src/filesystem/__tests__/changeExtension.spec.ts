import { changeExtension } from "../changeExtension";

describe(`changeExtension`, () => {
  it(`converts the extension of the given filepath`, () => {
    const filepath = `foo.js`;
    const actual = changeExtension(filepath, `.tsx`); //?
    const expected = `foo.tsx`;

    expect(actual).toStrictEqual(expected);
  });
});
