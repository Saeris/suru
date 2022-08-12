import type { PackageJson } from "type-fest";
import type { Package } from "../../types/package";
import { loadManifest } from "../../filesystem/npm/loadManifest";

interface EntryCJS<S extends string> extends Package {
  main: `./cjs/${S}.cjs`;
  exports: {
    require: `./cjs/${S}.cjs`;
  };
}

interface EntryESM<S extends string> extends Package {
  module: `./esm/${S}.js`;
  exports: {
    import: `./esm/${S}.js`;
  };
}

interface EntryBrowserESM<S extends string> extends Package {
  module: `./esm/${S}.min.js`;
  exports: {
    browser: {
      import: {
        development: `./esm/${S}.js`;
        production: `./esm/${S}.min.js`;
      };
    };
  };
}

interface EntryBrowserUMD<S extends string> extends Package {
  browser: `./umd/${S}.umd.min.js`;
  exports: {
    browser: {
      default: {
        development: `./umd/${S}.umd.js`;
        production: `./umd/${S}.umd.min.js`;
      };
    };
    script: {
      development: `./umd/${S}.umd.js`;
      production: `./umd/${S}.umd.min.js`;
    };
  };
}

interface EntryTypes<S extends string> extends Package {
  types: `./types/${S}.d.ts`;
}

interface EntryLib<S extends string> extends Package {
  main: `./lib/${S}.js`;
  esnext: `./lib/${S}.js`;
  exports: {
    ".": `./lib/${S}.js`;
    default: `./lib/${S}.js`;
  };
}

type EntrypointType = "lib" | "esm" | "cjs" | "umd" | "types";

type ResolvedEntry<S extends string, T extends EntrypointType, B extends boolean> = T extends "cjs"
  ? EntryCJS<S>
  : T extends "esm"
  ? B extends true
    ? EntryBrowserESM<S>
    : EntryESM<S> & EntryBrowserESM<S>
  : T extends "umd"
  ? EntryBrowserUMD<S>
  : T extends "types"
  ? EntryTypes<S>
  : EntryLib<S>;

const normalizeEntrypoints = (
  entrypoints?: PackageJson.Exports
): Exclude<PackageJson.Exports, null | string | string[]> => {
  if (typeof entrypoints === `string`) {
    return {
      ".": entrypoints
    };
  } else if (Array.isArray(entrypoints) || !entrypoints) {
    return {};
  }
  return entrypoints;
};

export const addEntrypoint = async <S extends string, T extends EntrypointType, B extends boolean>(
  fileName: S,
  type: T,
  bundle: B = false as B
): Promise<Record<EntrypointType, ResolvedEntry<S, T, B>>[T]> => {
  const manifest = await loadManifest();
  if (
    !manifest.exports ||
    Array.isArray(manifest.exports) ||
    typeof manifest.exports === `string`
  ) {
    manifest.exports = {};
  }

  const addEntry = (entry: PackageJson.Exports, ...rest: object[]): ResolvedEntry<S, T, B> =>
    Object.assign(
      manifest,
      {
        exports: Object.assign(normalizeEntrypoints(manifest.exports), entry)
      },
      ...rest
    );
  const entries: Record<EntrypointType, () => ResolvedEntry<S, T, B>> = {
    // Add a CommonJS Entrypoint
    cjs: () =>
      addEntry(
        {
          require: `./cjs/${fileName}.cjs` as const
        },
        {
          main: `./cjs/${fileName}.cjs` as const
        }
      ),
    // Add a ECMAScript Module Bundle Entrypoint
    esm: () =>
      addEntry(
        bundle
          ? {
              browser: Object.assign(normalizeEntrypoints(manifest.exports).browser ?? {}, {
                import: {
                  development: `./esm/${fileName}.js` as const,
                  production: `./esm/${fileName}.min.js` as const
                }
              }),
              import: `./esm/${fileName}.js` as const
            }
          : {
              import: `./esm/${fileName}.js` as const
            },
        {
          module: `./esm/${fileName}.js` as const
        }
      ),
    // Add a UMD Bundle Entrypoint
    umd: () =>
      addEntry(
        {
          browser: Object.assign(normalizeEntrypoints(manifest.exports).browser ?? {}, {
            default: {
              development: `./umd/${fileName}.umd.js` as const,
              production: `./umd/${fileName}.umd.min.js` as const
            }
          }),
          script: {
            development: `./umd/${fileName}.umd.js` as const,
            production: `./umd/${fileName}.umd.min.js` as const
          }
        },
        {
          browser: `./umd/${fileName}.umd.min.js` as const
        }
      ),
    // Add a Typescript Type Definitions Entrypoint
    types: () =>
      addEntry(
        {},
        {
          types: `./types/${fileName}.d.ts` as const
        }
      ),
    // Add a Default ESNext Entrypoint
    lib: () =>
      addEntry(
        {
          "./package.json": `./package.json` as const,
          ".": `./lib/${fileName}.js` as const,
          default: `./lib/${fileName}.js` as const
        },
        {
          esnext: `./lib/${fileName}.js` as const,
          main: `./lib/${fileName}.js` as const
        }
      )
  };

  return entries[type]();
};
