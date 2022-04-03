// @ts-check
/* eslint-disable @typescript-eslint/no-require-imports */
/**
 * @type {import("@babel/core").TransformOptions}
 */
module.exports = {
  plugins: [require.resolve(`@babel/plugin-proposal-class-properties`)],
  presets: [
    require.resolve(`@babel/preset-typescript`),
    [
      require.resolve(`@babel/preset-env`),
      { targets: { node: true }, modules: false, useBuiltIns: `usage`, corejs: 3 }
    ]
  ],
  env: {
    test: {
      sourceMaps: `inline`,
      presets: [
        [
          require.resolve(`@babel/preset-env`),
          {
            targets: { node: true },
            modules: `commonjs`,
            useBuiltIns: `usage`,
            corejs: 3
          }
        ]
      ]
    }
  }
};
