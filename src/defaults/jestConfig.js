// @ts-check
/* eslint-disable @typescript-eslint/no-require-imports */
/**
 * @type {import("@jest/types").Config.InitialOptions}
 */
module.exports = {
  coverageDirectory: `./.coverage/`,
  collectCoverage: true,
  collectCoverageFrom: [
    // include
    `./src/**/*.ts`,
    // exclude
    `!**/__mocks__/**/*`,
    `!**/__stories__/**/*`,
    `!**/__fixtures__/**/*`,
    `!**/__test__/**/*`,
    `!**/node_modules/**`,
    `!**/vendor/**`
  ],
  testEnvironment: `node`,
  // Assuming the consumer doesn't have a `.babelrc` file, load our defaults
  transform: { "\\.[jt]sx?$": [`babel-jest`, require(`./babelConfig`)] },
  verbose: true
};
