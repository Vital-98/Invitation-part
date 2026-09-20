#!/usr/bin/env bash
# Render both invitation cards to A4 PDF with headless Chrome.
#   ./build.sh            → invitation-mr.pdf, invitation-en.pdf
#   ./build.sh png        → also writes preview PNGs at 150dpi
set -euo pipefail

here="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
profile="$(mktemp -d)"                       # never touch the real Chrome profile
trap 'rm -rf "$profile"' EXIT

for lang in mr en; do
  google-chrome \
    --headless=new --disable-gpu --no-sandbox \
    --user-data-dir="$profile" \
    --virtual-time-budget=10000 \
    --run-all-compositor-stages-before-draw \
    --no-pdf-header-footer \
    --print-to-pdf="$here/invitation-$lang.pdf" \
    "file://$here/invitation-$lang.html" 2>/dev/null
  echo "wrote invitation-$lang.pdf"

  # preview at A4/96dpi, so the screenshot matches the printed page
  if [ "${1:-}" = png ]; then
    google-chrome \
      --headless=new --disable-gpu --no-sandbox \
      --user-data-dir="$profile" \
      --virtual-time-budget=10000 \
      --window-size=794,1123 \
      --screenshot="$here/preview-$lang.png" \
      "file://$here/invitation-$lang.html" 2>/dev/null
    echo "wrote preview-$lang.png"
  fi
done
