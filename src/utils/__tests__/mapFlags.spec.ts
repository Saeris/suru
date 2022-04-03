import { mapFlags } from "../mapFlags";

describe(`mapFlags`, () => {
  it(`parses objects correctly`, () => {
    const data = {
      trueFlag: true,
      falseFlag: false,
      stringParam: `foo`,
      stringArrayParam: [`bar`, `baz`, `qux`],
      numberParam: 42,
      numberArrayParam: [2, 4, 6, 8],
      emptyString: ``,
      // eslint-disable-next-line no-undefined
      undef: undefined,
      nullish: null,
      // eslint-disable-next-line no-undefined
      mixedArray: [`quas`, 420, ``, `wex`, ``, 69, undefined, null]
    } as const;
    const actual = mapFlags(data as Parameters<typeof mapFlags>[0]);
    const expected = [
      `--trueFlag`,
      [`--falseFlag`, `false`],
      [`--stringParam`, `foo`],
      [`--stringArrayParam`, `bar,baz,qux`],
      [`--numberParam`, `42`],
      [`--numberArrayParam`, `2,4,6,8`],
      [`--mixedArray`, `quas,420,wex,69`]
    ];
    expect(actual).toStrictEqual(expected);
  });
});
