#!/usr/bin/env bash
# ./run.sh [plugins=16] [properties=24] — regenerates src/ and checks it with TS 6.0.3 and TS 7.0.2.
set -u
cd "$(dirname "$0")"
node gen.mjs "$@"
for v in 6 7; do
  if [ "$v" = 7 ]; then
    cmd=(node node_modules/typescript/bin/tsc -p . --checkers 1 --extendedDiagnostics)
  else
    cmd=(node node_modules/typescript6/bin/tsc -p . --extendedDiagnostics)
  fi
  out=$(/usr/bin/time -f 'wall=%es maxrss=%MKB' timeout -k 5 "${TIMEOUT:-300}" "${cmd[@]}" 2>&1)
  echo "plugins=${1:-16} properties=${2:-24} ts$v: $(grep -E 'error|^Types|^Instantiations|^Check time|wall=' <<<"$out" | tr -s ' ' | tr '\n' ' ')"
done
