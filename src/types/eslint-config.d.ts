declare module "@saeris/eslint-config" {
  import type { Linter } from "eslint";

  const config: Linter.Config;
  // eslint-disable-next-line import/no-default-export
  export default config;
}
