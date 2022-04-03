// @ts-check
/**
 * Generates a default config that will run Prettier, apply ESLint autofixes, and Typecheck
 * the files matching the given `glob`.
 * @param {string} glob A regex used to match files
 * (Default: `"src\/**\/*.{js,jsx,ts,tsx}"`)
 */
const defaultConfig = (glob = "src/**/*.{js,jsx,ts,tsx}") => ({
  [glob]: (filenames) => [
    `prettier --write ${filenames.join(` `)}`,
    `yarn lint --fix --quiet ${filenames.join(` `)}`,
    `yarn typecheck` // We want to skip passing args to tsc to make sure we typecheck the whole codebase
  ]
});

module.exports = defaultConfig;
