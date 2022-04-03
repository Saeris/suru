declare module "rollup-plugin-peer-deps-external" {
  import type { Plugin } from "rollup";

  // eslint-disable-next-line import/no-default-export
  export default function peerDepsExternal(options: { packageJsonPath?: string }): Plugin;
}
