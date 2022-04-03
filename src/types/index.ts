// TODO: Extract most or all of these to a separate Typescript Utility Types package

/**
 * NOTE: It's a Typescript convention to use generic names like `T` or `U` Generics are similar to
 * function arguments, they're variables for type information that could be of differing shapes. For
 * a better understandinf of Generics work and how they are used, here's some good reading:
 *
 * https://www.typescriptlang.org/docs/handbook/2/generics.html
 * https://www.smashingmagazine.com/2020/10/understanding-typescript-generics/
 *
 * Here is what a few of these abreviations commonly mean:
 *
 * `T`: Type. Usually means any type, but often it represents an Object
 *
 * `U`: Union. This is almost always refers to a group of type possibilties, ex: `string | number | boolean`
 *
 * `K`: Key. Often seen in the context of `K in keyof T`, this sually refers to a Key value of an object.
 *
 * `V`: Value. Usually seen in conjunction with `K`, this represents the value of a key:value pair. ex: `V extends T[K]`
 *
 * `F`: Function. Usually refers to a function type signature.
 *
 * `A`: Array. If `T` most often represents an Object, `A` is often used to refer to an Array in contexts where `T` is already
 * used to refer to some other value
 *
 * `H`: Head. The first value in an Array.
 *
 * `R`: Rest. As in JavaScript's `rest` syntax, this is usually a union of the remaining values in an array. ex: `[H, ...R]`
 *
 * `P`: Props or Preperty. In the React context, this usually refers to a component's props. Other times it's
 * usually another term used to refer to an object's Key. ex: `V = typeof T[P]`
 *
 * `C`: Component. This is often seen in React contexts, as this abbreviation most often means a React Component
 *
 * `E`: Event or Element. In the general sense, E could refer to an Event object. It could also refer to an HTML Element in
 * the context of working in a React application.
 */

/**
 * Used to get the type of an Array's elements.
 *
 * ### Generics
 *
 * @template T  The Array type to unwrap
 *
 * @description ### Description
 *
 * If `T` is an array, this infers and returns a union `U` of the array's element types, otherwise it returns `T`
 *
 * ### Example Usage
 *
 * ```typescript
 *  const arr = [`foo`, 42, null] // => (string | number | null)[]
 *
 *  type ArrElements = Unwrap<typeof arr> // => string | number | null
 *
 *  const obj = { foo: `bar` } // => { foo: string }
 *
 *  type Obj = Unwrap<typeof obj> // => { foo: string }
 * ```
 */
export type Unwrap<T> = T extends Iterable<infer U> ? U : T;

/**
 * Recursively removes values of the type matching union `U` from the given array `T`
 *
 */
export type Filter<T extends unknown[], U> = T extends []
  ? []
  : T extends [infer H, ...infer R]
  ? H extends U
    ? Filter<R, U>
    : [H, ...Filter<R, U>]
  : T;

export type UnionToIntersection<U> = (U extends unknown ? (arg: U) => unknown : never) extends (
  arg: infer V
) => void
  ? V
  : never;

export type UnionToTuple<T> = UnionToIntersection<
  T extends unknown ? (arg: T) => T : never
> extends (arg: unknown) => infer R
  ? [...UnionToTuple<Exclude<T, R>>, R]
  : [];

export type Difference<A extends Iterable<unknown>, B extends Iterable<unknown>> = Exclude<
  Unwrap<B>,
  Unwrap<A>
> extends never
  ? (Unwrap<A> & Unwrap<B>)[]
  : UnionToTuple<Exclude<Unwrap<B>, Unwrap<A>>>;

/**
 * Transforms the given array `T` into a string who's
 * elements will be joined with the given delimiter `D`
 */
export type Join<T extends MaybeReadonly<unknown[]>, D extends string = ","> = T extends []
  ? ""
  : T extends MaybeReadonly<[string | number | boolean | bigint | ""]>
  ? `${T[0]}`
  : T extends [string | number | boolean | bigint, ...infer U]
  ? `${T[0]}${D}${Join<U, D>}`
  : T extends readonly [string | number | boolean | bigint, ...infer U]
  ? `${T[0]}${D}${Join<U, D>}`
  : string;

/** Removes empty strings (`""`) from the given array `T` */
export type PruneEmpty<T extends MaybeReadonly<unknown[]>> = Filter<
  T extends Readonly<T> ? Mutable<T> : T,
  "" | undefined | null
>;

/**
 * Transforms the given type `T` into a string literal.
 *
 * If type `T` is an array, it's elements will be joined with the given delimiter `D`
 */
export type ToString<T, D extends string = ","> = T extends []
  ? ""
  : T extends MaybeReadonly<unknown[]>
  ? Join<PruneEmpty<T>, D>
  : T extends string | number | boolean | bigint
  ? `${T}`
  : string;

export type RemoveIndex<T> = {
  [P in keyof T as string extends P ? never : number extends P ? never : P]: T[P];
};

/** Returns a union of keys of the known properties of object `T` */
export type KnownKeys<T> = keyof RemoveIndex<T>;

/* Old Implementation, seems to be broken in TS v4.6
export type KnownKeys<T> = {
  [K in keyof T]: string extends K ? never : number extends K ? never : K;
} extends { [_ in keyof T]: infer U }
  ? U
  : never;
   */

/** Picks all known properties of object `T` */
export type PickKnown<T> = {
  [K in keyof T as string extends K ? never : number extends K ? never : K]: T[K];
};

/** Picks all properties in object `T` with values matching those given in the union `U` */
// { foo: "bar", baz: false } U = string => { foo: "bar" }
export type ExtractPropsOfType<T, U> = { [K in keyof T as T[K] extends U ? K : never]: T[K] };

/** Returns a union of all keys in object `T` which have values matching those given in the union `U` */
// { foo: "bar", baz: false, qux: "blah" } U = string => foo | qux
export type ExtractKeysOfValueType<T, U> = { [K in keyof T]: T[K] extends U ? K : never }[keyof T];

/** Returns an array of key:value pairs from properties in object `T` */
// { foo: "bar", baz: false, qux: "blah" } U = string => ([foo, "bar"] | [qux, "blah"])[]
export type Entries<T> = { [K in keyof T]: [key: K, value: T[K]] }[keyof T][];

/** From object `T`, pick as set of properties excluding all properties with a value type in the union `U` */
// { foo: "bar", baz: false, qux: "blah" } U = string => { bar: false }
export type ExcludeValues<T, U> = Pick<
  PickKnown<T>,
  Exclude<keyof PickKnown<T>, ExtractKeysOfValueType<PickKnown<T>, U>>
>;

/** From object `T`, pick as set of properties including all properties with a value type in the union `U` */
// { foo: "bar", baz: false, qux: "blah" } U = string => { foo: "bar", qux: "blah" }
export type IncludeValues<T, U> = Pick<
  PickKnown<T>,
  Extract<keyof PickKnown<T>, ExtractKeysOfValueType<PickKnown<T>, U>>
>;

/** A type `T` that may or may not have the `readonly` modifier */
export type MaybeReadonly<T> = Readonly<T> | T;

/** Primitive types which cannot have the `readonly` data access modifier */
type ImmutablePrimitive = undefined | null | boolean | string | number | Function;

export type Immutable<T> = T extends ImmutablePrimitive
  ? // If T is a primitive, return the primitive
    T
  : // If T is an Array, make it readonly
  T extends (infer U)[]
  ? readonly Immutable<U>[]
  : // If T is a Map, make it readonly
  T extends Map<infer K, infer V>
  ? ReadonlyMap<K, V>
  : // If T is a Set, make it readonly
  T extends Set<infer M>
  ? ReadonlySet<M>
  : // Otherwise T must be an object, so make it's properties readonly
    { readonly [K in keyof T]: Immutable<T[K]> };

export type Mutable<T> = T extends ImmutablePrimitive
  ? // If T is a primitive, return the primitive
    T
  : // If T is a Readonly Array, infer it's element types and return a mutable Array
  T extends readonly (infer U)[]
  ? U[]
  : // If T is a Readonly Map, infer it's keys and values and return mutable Map
  T extends ReadonlyMap<infer K, infer V>
  ? Map<K, V>
  : // If T is a Readonly Set, infer it's Iterable and return a mutable Set
  T extends ReadonlySet<infer I>
  ? Set<I>
  : // Otherwise T must be an object, so make it's properties mutable
    { -readonly [K in keyof T]: Mutable<T[K]> };
