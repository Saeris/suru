declare module "@babel/plugin-external-helpers" {
  /**
   * See: https://github.com/babel/babel/blob/main/packages/babel-plugin-external-helpers/src/index.js
   */
  export interface Options {
    helperVersion?: string;
    whitelist?: string[] | false;
  }
}
