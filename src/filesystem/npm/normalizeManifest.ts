import path from "path";
import fs from "fs";
import { promisify } from "util";
import semver from "semver";
import type { PackageJson } from "type-fest";
import { orderKeys } from "../../utils/orderKeys";

const keyOrder = [
  `name`,
  `version`,
  `description`,
  `license`,
  `licenses`,
  `keywords`,
  `author`,
  `contributors`,
  `maintainers`,
  `homepage`,
  `repository`,
  `bugs`,
  `funding`,
  `private`,
  `workspaces`,
  `publishConfig`,
  `bin`,
  `type`,
  `main`,
  `module`,
  `esnext`,
  `browser`,
  `sideEffects`,
  `types`,
  `typings`,
  `exports`,
  `files`,
  `engines`,
  `os`,
  `cpu`,
  `scripts`,
  `config`,
  `dependencies`,
  `devDependencies`,
  `peerDependencies`,
  `peerDependenciesMeta`,
  `bundledDependencies`,
  `optionalDependencies`,
  `resolutions`
];

export const stringifyPerson = (person: PackageJson.Person): string => {
  if (!person || typeof person !== `object`) {
    return person;
  }
  const { name, email, url } = person;
  const parts: string[] = [];
  if (name) {
    parts.push(name);
  }
  if (typeof email === `string`) {
    parts.push(`<${email}>`);
  }
  if (typeof url === `string`) {
    parts.push(`(${url})`);
  }
  return parts.join(` `);
};

type PersonObject = Exclude<PackageJson.Person, string>;

export const parsePerson = (person: PackageJson.Person): PersonObject => {
  if (typeof person !== `string`) {
    return person;
  }

  // format: name (url) <email>
  const obj = {} as PersonObject;

  let name = /^(?<name>[^(<]+)/.exec(person);
  if (name?.[0].trim()) {
    obj.name = name[0].trim();
  }

  const email = /<(?<email>[^>]+)>/.exec(person);
  if (email) {
    obj.email = email[1];
  }

  const url = /\((?<url>[^)]+)\)/.exec(person);
  if (url) {
    obj.url = url[1];
  }

  return obj;
};

export const normalizePerson = (person: PackageJson.Person): PersonObject =>
  parsePerson(stringifyPerson(person));

const DependencyTypes = [
  `dependencies`,
  `devDependencies`,
  `optionalDependencies`,
  `peerDependencies`
] as const;

/**
 * Used to normalize and sort the fields of a `package.json` file.
 * This ensures consistent output when writing back to disk.
 * @param manifest A package manifest object to normalize.
 * @param filePath The filepath to the `package.json` file.
 */
export const normalizeManifest = async (
  manifest: Record<string, unknown>,
  filePath: string
): Promise<PackageJson> => {
  const packageRoot = path.dirname(filePath);
  const files = await promisify(fs.readdir)(packageRoot);
  // if the keywords field is a string then split it on any whitespace
  if (typeof manifest.keywords === `string`) {
    manifest.keywords = manifest.keywords.split(/\s+/g);
  }

  const info: PackageJson = keyOrder.reduce<Record<string, unknown>>((sorted, key, index) => {
    if (key in manifest) {
      sorted[key] = manifest[key];
    }
    return index === keyOrder.length - 1 ? { ...sorted, ...manifest } : sorted;
  }, {}) as unknown as Record<string, unknown>;

  if (typeof info.version === `string`) {
    info.version = semver.clean(info.version) ?? info.version;
  }

  // if the man field is a string then coerce it to an array
  if (typeof info.man === `string`) {
    info.man = [info.man];
  }

  // if there's no contributors field but an authors field then expand it
  if (!info.contributors && files.includes(`AUTHORS`)) {
    const authorsFilepath = path.join(packageRoot, `AUTHORS`);
    const authorsFilestats = await promisify(fs.stat)(authorsFilepath);
    if (authorsFilestats.isFile()) {
      let authors = await promisify(fs.readFile)(authorsFilepath);
      info.contributors = authors
        .toString()
        .split(/\r?\n/g) // split on lines
        .map((line): string => line.replace(/^\s*#.*$/, ``).trim()) // remove comments
        .filter((line): boolean => !!line); // remove empty lines;
    }
  }

  // expand people fields to objects
  if (typeof info.author === `string` || typeof info.author === `object`) {
    info.author = normalizePerson(info.author);
  }
  if (Array.isArray(info.contributors)) {
    info.contributors = info.contributors.map(normalizePerson);
  }
  if (Array.isArray(info.maintainers)) {
    info.maintainers = info.maintainers.map(normalizePerson);
  }

  // support array of engine keys
  if (Array.isArray(info.engines)) {
    const engines = {};
    for (const str of info.engines) {
      if (typeof str === `string`) {
        const [name, ...patternParts] = str.trim().split(/ +/g);
        engines[name] = patternParts.join(` `);
      }
    }
    info.engines = engines;
  }

  // allow bugs to be specified as a string, expand it to an object with a single url prop
  if (typeof info.bugs === `string`) {
    info.bugs = { url: info.bugs };
  }

  // normalize homepage url to http
  if (typeof info.homepage === `string`) {
    const parts = new URL(info.homepage);
    parts.protocol = parts.protocol || `http:`;
    if (parts.pathname && !parts.hostname) {
      parts.hostname = parts.pathname;
      parts.pathname = ``;
    }
    info.homepage = parts.toString();
  }

  // if the `bin` field is as string then expand it to an object with a single property
  // based on the original `bin` field and `name field`
  // { name: "foo", bin: "cli.js" } -> { name: "foo", bin: { foo: "cli.js" } }
  if (typeof info.name === `string` && typeof info.bin === `string` && info.bin.length > 0) {
    // Remove scoped package name for consistency with NPM's bin field fixing behaviour
    const name = info.name.replace(/^@[^/]+\//, ``);
    info.bin = { [name]: info.bin };
  }

  if (info.scripts) {
    info.scripts = orderKeys(info.scripts);
  }

  for (const type of DependencyTypes) {
    if (info[type]) {
      info[type] = orderKeys(info[type]!);
    }
  }

  return info;
};
