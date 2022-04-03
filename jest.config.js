// @ts-check
const { name } = require(`./package.json`);

/**
 * @type {import("@jest/types").Config.InitialOptions}
 */
module.exports = {
  displayName: name,
  testMatch: ["**/__tests__/**/*.(spec|test).[jt]s?(x)", "**/*.(spec|test).[jt]s?(x)"],
  ...require(`./src/defaults/jestConfig`)
};
