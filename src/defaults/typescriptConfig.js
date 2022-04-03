module.exports = {
  compilerOptions: {
    declaration: true,
    importHelpers: true,
    module: `commonjs`,
    outDir: `lib`,
    rootDir: `src`,
    strict: true,
    target: `es2017`,
    esModuleInterop: true
  },
  include: [`src/**/*`],
  exclude: [`node_modules`, `**/__mocks__/**/*`, `**/__tests__/**/*`, `**/__stories__/**/*`]
};
