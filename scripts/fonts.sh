#!/usr/bin/env bash
# Makes the small italic heading fonts in src/assets/fonts/ from Fraunces italic (fontsource): one fixed
# weight each (500 for the red accents, 400 for the case-study lesson), plain Latin and common
# punctuation only. ~15 KB each instead of the 45 KB variable font. tests/unit/assets.test.ts checks
# every italic phrase fits. Needs fonttools and brotli:  python3 -m pip install --user fonttools brotli
set -euo pipefail
cd "$(dirname "$0")/.."
SRC=node_modules/@fontsource-variable/fraunces/files/fraunces-latin-wght-italic.woff2
UNICODES="U+0020-007E,U+00A0,U+00A3,U+2013,U+2014,U+2018,U+2019,U+201C,U+201D,U+2026,U+2192"
TMP=$(mktemp -d)
python3 -m fontTools.subset "$SRC" --unicodes="$UNICODES" --flavor=woff2 \
  --layout-features='kern,liga,calt,ccmp,locl,mark,mkmk' --output-file="$TMP/subset.woff2"
for W in 400 500; do
  python3 - "$TMP/subset.woff2" "$W" "src/assets/fonts/fraunces-italic-$W-subset.woff2" <<'PY'
import sys
from fontTools.ttLib import TTFont
from fontTools.varLib import instancer
font = instancer.instantiateVariableFont(TTFont(sys.argv[1]), {"wght": int(sys.argv[2])})
font.flavor = "woff2"
font.save(sys.argv[3])
PY
done
rm -rf "$TMP"
ls -l src/assets/fonts/
