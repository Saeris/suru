declare module "@babel/preset-typescript" {
  /**
   * See: https://babeljs.io/docs/en/babel-preset-typescript
   */
  export interface Options {
    isTSX?: boolean;
    jsxPragma?: string;
    jsxPragmaFrag?: string;
    allExtensions?: boolean;
    allowNamespaces?: boolean;
    allowDeclareFields?: boolean;
    onlyRemoveTypeImports?: boolean;
    optimizeConstEnums?: boolean;
  }
}
