#!/usr/bin/env bash
#
# Copy the built plugin into an Obsidian vault so it can be tested, including on
# mobile devices that sync the vault (Obsidian Sync / iCloud).
#
# Run this on the HOST (it is just a file copy, no toolchain needed). Build the
# plugin first inside the devcontainer:  npm run build
#
# Usage:
#   OBSIDIAN_VAULT="/path/to/your/vault" ./scripts/deploy-to-vault.sh
#
set -euo pipefail

VAULT="${OBSIDIAN_VAULT:?set OBSIDIAN_VAULT to the absolute path of your vault}"
DEST="$VAULT/.obsidian/plugins/drawio-obsidian"

if [ ! -f dist/main.js ]; then
  echo "dist/main.js not found - run 'npm run build' in the devcontainer first." >&2
  exit 1
fi

mkdir -p "$DEST"
cp dist/main.js dist/manifest.json dist/styles.css "$DEST/"
echo "Deployed plugin to: $DEST"
