# TS 7: object literal passed to a method on a large union creates an exponential number of types

TypeScript 7.0.2 creates millions of types, and up to tens of GB of memory, when an object literal is passed to a method called on a union of generic plugin types. TypeScript 6.0.3 checks the same code with a small fraction of those types.

## Pattern

```ts
// Library: each plugin's `configure` takes a callback or a config object.
type Plugin<K extends string> = Shape<K> & {
  configure: (config: ((ctx: { key: K }) => Config<K>) | Config<K>) => Plugin<K>;
};

// App: `plugin` is a union of N different plugin types.
[p0, p1, /* … */ p15].map((plugin) => plugin.configure({}));
```

In our app, this was a single call in a Plate (`platejs` 53) DOCX exporter that configured 18 `Base*Plugin`s with `.map((plugin) => plugin.configure({ override: … }))`.

## Numbers

All runs use `tsc --noEmit --extendedDiagnostics` on Linux with 8 cores and Node 24. TS 7 ran with `--checkers 1` unless noted.

**Whole Next.js app (≈12k files), before the workaround:**

| | Types | Instantiations | Time | Max RSS |
|---|---|---|---|---|
| TS 6.0.3 | 1.77M | 4.4M | 58 s | 5.4 GB |
| TS 7.0.2 (default checkers) | — | — | 153 s | 49.7 GB |
| TS 7.0.2 (`--checkers 1`) | 46.6M | 4.8M | — | — |

**The same app after typing that one callback parameter** (`(plugin: AnySlatePlugin) =>`): TS 7 creates 1.76M types and 5.0M instantiations with `--checkers 1`, the same as TS 6. Default checkers used 5.6 GB RSS.

**`plate/` repro**: `[…first N Base*Plugins].map((plugin) => plugin.configure({}))`

| Plugins | TS 6 types | TS 7 types | TS 6 check | TS 7 check | TS 7 RSS |
|---|---|---|---|---|---|
| 10 | 22.1K | 34.7K | 2.1 s | 0.6 s | 0.12 GB |
| 12 | 24.4K | 108.6K | 2.6 s | 1.1 s | 0.16 GB |
| 14 | 31.4K | 667.2K | 4.5 s | 7.4 s | 0.49 GB |
| 16 | 56.8K | 5,263.0K | 13.6 s | 54.2 s | 2.9 GB |
| 18 | 180.7K | did not finish within 300 s | 68.2 s | > 300 s | — |

Instantiations are almost the same in both versions (~75–78K). The extra types are union and intersection types, which aren't instantiations.

**`standalone/` repro (no dependencies):**

| Plugins × properties | TS 6 types | TS 7 types | TS 6 RSS | TS 7 RSS |
|---|---|---|---|---|
| 12 × 24 | 12.3K | 205.2K | 0.30 GB | 0.18 GB |
| 14 × 24 | 38.2K | 819.6K | 0.56 GB | 0.72 GB |
| 16 × 24 | 138.1K | 3,277.3K | 1.5 GB | 2.8 GB |
| 16 × 48 | 144.6K | 6,423.0K | 2.7 GB | 5.4 GB |

Wall time in the standalone repro is about the same in both versions: TS 6 spends its time relating `{}` to each union member. The Plate types make TS 7's extra work much more expensive.

**Which argument triggers it** (Plate, 14 plugins, TS 7 types):

| Call | TS 6 | TS 7 |
|---|---|---|
| `configure({})` or `configure({ override: {} })` | 31K | 667K |
| `configure({ key: undefined })` | 31K | 667K |
| `configure(empty)`, where `const empty = {}` | 31K | 31.5K |
| `configure({} as {})` / `({} as any)` / `(null!)` | 29–31K | 29–31K |
| `configure(() => ({}))` | 31K | 31.5K |

Combining the union signatures and relating the argument cost the same in both versions. The regression needs an object literal that is contextually typed by the combined parameter type.

## What happens

1. `plugin.configure` on a union of N plugin types combines the N signatures. Their parameter types are intersected: `(F1 | O1) & (F2 | O2) & …`, where `Fi` is the callback type and `Oi` is the config object type. That normalizes to a union of 2^N intersections. TS 6 and TS 7 both do this, and both stop at the 100,000-member cross-product limit (TS2590).
2. When the argument is an object literal, `checkObjectLiteral` calls `getApparentTypeOfContextualType` and then `discriminateContextualTypeByObjectMembers`. That calls `getPropertiesOfType(contextualType)` to find optional discriminant members. `getPropertiesOfUnionOrIntersectionType` enumerates the properties of the **first** union constituent only, then builds a synthetic union property for each name across all 2^N constituents. `createUnionOrIntersectionProperty` calls `getTypeOfSymbol` on every constituent's property, and each of those properties is itself an intersection property, so a new intersection type is created per constituent per property.
3. The cost therefore depends on which constituent is first:
   - **TS 6** orders union constituents by type id. With Plate's `.d.ts`, which isn't checked under `skipLibCheck` and is resolved lazily, the all-callback intersection `F1 & F2 & …` gets the lowest id. It has no properties, so step 2 does nothing.
   - **TS 7** orders constituents structurally (`CompareTypes`): aliased or named types sort before anonymous ones, and intersections sort by their constituent lists. The all-config intersection `O1 & O2 & …` (`Omit<…>` aliases) therefore sorts first. It has ~40 optional properties in Plate, and each is resolved across all 2^N constituents.

A CPU profile of TS 7 on the 14-plugin Plate repro (`--pprofDir`) attributes 65% of check time to this path:

`checkObjectLiteral → getApparentTypeOfContextualType → discriminateContextualTypeByObjectMembers → getPropertiesOfType → getPropertiesOfUnionOrIntersectionType → createUnionOrIntersectionProperty → getTypeOfSymbol → getIntersectionType → getCrossProductIntersections`

The ordering is what decides the outcome, not a difference in the logic. If the standalone declarations move from `src/plugin.d.ts` into a checked `.ts` file, TS 6 resolves `Config<K>` first while checking the alias declaration. Its first constituent is then the config intersection, and TS 6 creates the same number of types as TS 7. At 12 plugins × 24 properties, TS 6 creates 205,225 types (12,338 with the `.d.ts`) and TS 7 creates 205,251.

Possible fixes on the compiler side: when contextually typing an object literal against a very large union, skip or bound the optional-member discrimination step in `discriminateContextualTypeByObjectMembers`. Alternatively, avoid making property resolution of a union depend on whichever constituent happens to sort first.

## Compiler or library?

The regression is in the compiler. The Plate code is valid TypeScript and its declarations haven't changed. TS 6.0.3 checks it cheaply and TS 7.0.2 doesn't, and the `standalone/` repro reproduces the gap with no library at all.

The library's API shape does make the code vulnerable:

- `configure` takes a `callback | object` union parameter.
- The config object has many optional properties.
- The call is made on a union of many plugin types.

Both versions build the same 2^N cross-product union for this call. TS 6 avoided the expensive property resolution only because of the order in which it created types. If TS 6 resolves the config type first, it does the same work as TS 7.

## Running the repros

```bash
(cd standalone && pnpm install && ./run.sh 16 24)    # plugins, properties
(cd plate && pnpm install && ./run.sh 10 12 14 16)   # plugin counts
```

Each script regenerates `src/` and prints types, instantiations, check time, wall time and max RSS for TS 6.0.3 (`typescript6` alias) and TS 7.0.2. Set `TIMEOUT=<seconds>` to change the 300 s limit. `plate/src/index.ts` is left at the full 18-plugin call from the app.

## Workaround in application code

Give the callback parameter a single non-union type so `configure` has one signature:

```ts
import type { AnySlatePlugin } from "platejs";

[BaseH1Plugin, /* … */ BaseImagePlugin].map((plugin: AnySlatePlugin) =>
  plugin.configure({ override: { components } }),
);
```
