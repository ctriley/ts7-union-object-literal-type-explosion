// node gen.mjs [plugins=16] [properties=24]
// Writes src/plugin.d.ts (library-style declarations) and src/index.ts (the call site).
import fs from "node:fs"

const plugins = Number(process.argv[2] ?? 16)
const properties = Number(process.argv[3] ?? 24)

const props = Array.from(
  { length: properties },
  (_, i) => `  prop${i}: { handler?: (key: K) => void };`
).join("\n")

fs.writeFileSync(
  "src/plugin.d.ts",
  `// Library-style declarations, modelled on Plate's SlatePlugin/configure.
// Under skipLibCheck this file is not checked, so these types are resolved on demand.
export type Shape<K extends string> = {
  key: K;
${props}
};
export type Config<K extends string> = Omit<Partial<Shape<K>>, "configure">;
export type Plugin<K extends string> = Shape<K> & {
  configure: (config: ((ctx: { key: K }) => Config<K>) | Config<K>) => Plugin<K>;
};
export declare function createPlugin<K extends string>(key: K): Plugin<K>;
`
)

const keys = Array.from({ length: plugins }, (_, i) => `p${i}`)
fs.writeFileSync(
  "src/index.ts",
  `import { createPlugin } from "./plugin";

${keys.map((k) => `const ${k} = createPlugin("${k}");`).join("\n")}

// \`configure\` called on a union of ${plugins} plugin types, with an object-literal argument.
export const configured = [${keys.join(", ")}].map((plugin) => plugin.configure({}));
`
)
