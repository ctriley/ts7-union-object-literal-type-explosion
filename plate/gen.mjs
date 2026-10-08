// node gen.mjs <count> > src/index.ts — calls .configure on a union of the first <count> Plate base plugins.
const all = {
  "@platejs/basic-nodes": [
    "BaseH1Plugin",
    "BaseH2Plugin",
    "BaseH3Plugin",
    "BaseBoldPlugin",
    "BaseItalicPlugin",
    "BaseUnderlinePlugin",
    "BaseStrikethroughPlugin",
    "BaseCodePlugin",
    "BaseBlockquotePlugin",
    "BaseHorizontalRulePlugin",
  ],
  "@platejs/code-block": ["BaseCodeBlockPlugin"],
  "@platejs/link": ["BaseLinkPlugin"],
  "@platejs/basic-styles": [
    "BaseFontFamilyPlugin",
    "BaseFontSizePlugin",
    "BaseFontColorPlugin",
    "BaseFontBackgroundColorPlugin",
  ],
  "@platejs/table": ["BaseTablePlugin"],
  "@platejs/media": ["BaseImagePlugin"],
}
const n = Number(process.argv[2] ?? 18)
const order = Object.entries(all).flatMap(([m, names]) => names.map((name) => [m, name]))
const used = order.slice(0, n)
const byModule = {}
for (const [m, name] of used) (byModule[m] ??= []).push(name)
for (const [m, names] of Object.entries(byModule))
  console.log(`import { ${names.join(", ")} } from "${m}";`)
console.log(
  `\nexport const plugins = [\n  ${used.map(([, name]) => name).join(",\n  ")},\n].map((plugin) => plugin.configure({}));`
)
