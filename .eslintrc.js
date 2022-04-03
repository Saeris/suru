/**
 * @type {import("eslint").Linter.Config}
 */
module.exports = {
  extends: [
    "@saeris/eslint-config/base",
    "@saeris/eslint-config/jest",
    "@saeris/eslint-config/type-aware",
    "@saeris/eslint-config/typescript"
  ],
  rules: {
    "import/no-named-as-default": `off`,
    "import/no-cycle": `off`,
    "import/no-unused-modules": `off`,
    "import/no-deprecated": `off`
  },
  ignorePatterns: [`*.js`, `./dist/**/*`, `./bin/**/*`]
};
