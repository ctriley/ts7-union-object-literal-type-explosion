#!/usr/bin/env bash
# ./run.sh [plugins...] — for each count (default 10 12 14 16), regenerates src/index.ts and
# checks it with TS 6.0.3 and TS 7.0.2. Leaves src/index.ts at the full 18-plugin call.
set -u
cd "$(dirname "$0")"
counts=("$@"); [ ${#counts[@]} -eq 0 ] && counts=(10 12 14 16)
for n in "${counts[@]}"; do
  node gen.mjs "$n" > src/index.ts
  for v in 6 7; do
    if [ "$v" = 7 ]; then
      cmd=(node node_modules/typescript/bin/tsc -p . --checkers 1 --extendedDiagnostics)
    else
      cmd=(node node_modules/typescript6/bin/tsc -p . --extendedDiagnostics)
    fi
    out=$(/usr/bin/time -f 'wall=%es maxrss=%MKB' timeout -k 5 "${TIMEOUT:-300}" "${cmd[@]}" 2>&1)
    echo "plugins=$n ts$v: $(grep -E 'error|^Types|^Instantiations|^Check time|wall=' <<<"$out" | tr -s ' ' | tr '\n' ' ')"
  done
done
node gen.mjs 18 > src/index.ts
