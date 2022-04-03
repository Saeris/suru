import { normalizeManifest } from "../normalizeManifest";

const TestManifest = {
  name: `test-package`,
  version: `1.0.0`,
  description: `test description`,
  author: `Some Author <name@someDomain.com>`,
  license: `MIT`,
  repository: `https://github.com/someOrg/test-package.git`,
  main: `src/index.js`,
  files: [`src/*`, `!src/__tests__/**/*`],
  exports: {
    ".": `./src/index.js`
  },
  sideEffects: false,
  engines: {
    node: `>=10.x`
  },
  peerDependencies: {
    eslint: `>= 7.17.0`,
    typescript: `>= 4.2.4`
  },
  dependencies: {
    "@rushstack/eslint-patch": `^1.0.6`,
    "@typescript-eslint/eslint-plugin": `>= 4.13.0`,
    "@typescript-eslint/parser": `>= 4.13.0`,
    "eslint-import-resolver-node": `^0.3.4`,
    "eslint-plugin-import": `>= 2.22.1`,
    "eslint-plugin-jest": `^24.1.3`,
    "eslint-plugin-jsx-a11y": `^6.4.1`,
    "eslint-plugin-promise": `>= 4.2.1`,
    "eslint-plugin-react": `^7.22.0`,
    "eslint-plugin-react-hooks": `^4.2.0`
  },
  devDependencies: {
    "@babel/core": `>= 7.12.10`,
    "@babel/runtime": `^7.13.10`,
    "@types/eslint": `^7.2.7`,
    "@types/jest": `^26.0.21`,
    "@types/node": `^14.14.35`,
    eslint: `>= 7.17.0`
  }
};
describe(`normalizeManifest`, () => {
  it(`sorts fields according to a normalized order`, async () => {
    const actual = await normalizeManifest(TestManifest, `foo`); //?
    const expected = {};
    expect(actual).toMatchObject(expected);
  });
});
