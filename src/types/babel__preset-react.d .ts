declare module "@babel/preset-react" {
  export interface SharedOptions {
    /**
     * Decides which runtime to use.
     *
     * automatic auto imports the functions that JSX transpiles to. classic does not automatic import anything.
     *
     * defaults to `classic`
     */
    runtime?: "classic" | "automatic";
    /**
     * This toggles behavior specific to development, such as adding __source and __self.
     *
     * This is useful when combined with the [env option](https://babeljs.io/docs/en/options#env) configuration or [js config files](https://babeljs.io/docs/en/config-files#javascript).
     *
     * defaults to `false`
     */
    development?: boolean;
    /**
     * Toggles whether or not to throw an error if a XML namespaced tag name is used. For example:
     *
     * ```
     * <f:image />
     * ```
     *
     * Though the JSX spec allows this, it is disabled by default since React's JSX does not currently have support for it.
     *
     * defaults to `true`
     */
    throwIfNamespace?: boolean;
  }
  export interface ClassicOptions extends SharedOptions {
    runtime?: "classic";
    /**
     * Replace the function used when compiling JSX expressions.
     *
     * defaults to `React.createElement`
     */
    pragma?: string;
    /**
     * Replace the component used when compiling JSX fragments.
     *
     * defaults to `React.Fragment`
     */
    pragmaFrag?: string;
    /**
     * Will use the native built-in instead of trying to polyfill behavior for any plugins that require one.
     *
     * defaults to `false`
     */
    useBuiltIns?: boolean;
    /**
     * When spreading props, use inline object with spread elements directly instead of Babel's extend helper or `Object.assign`.
     *
     * defaults to `false`
     */
    useSpread?: boolean;
  }

  export interface AutomaticOptions extends SharedOptions {
    runtime?: "automatic";
    /**
     * Replaces the import source when importing functions.
     *
     * defaults to `react`
     */
    importSource?: string;
  }

  export type Options = ClassicOptions | AutomaticOptions;
}
