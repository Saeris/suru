export const getTargets = (raw: string = ``): ("cjs" | "esm" | "umd")[] =>
  [...new Set(raw.split(`,`))].filter((target) => [`cjs`, `esm`, `umd`].includes(target)) as (
    | "cjs"
    | "esm"
    | "umd"
  )[];
