#!/bin/sh
# Builds the phone viewer for the web and publishes it to GitHub Pages:
#   https://igorbal-dev.github.io/Emily-game/puppets/
# Usage: sh tools/publish_viewer.sh   (needs Godot 4.3 + web export templates; GODOT=path/to/godot)
set -e
GODOT=${GODOT:-godot}
cd "$(dirname "$0")/.."
mkdir -p build/web
touch build/.gdignore
"$GODOT" --headless --path . --import >/dev/null 2>&1 || true
"$GODOT" --headless --path . --export-release "Web" build/web/index.html
git fetch origin gh-pages
rm -rf build/gh-pages
git worktree add -f build/gh-pages origin/gh-pages
rm -rf build/gh-pages/puppets
mkdir -p build/gh-pages/puppets
cp build/web/* build/gh-pages/puppets/
cd build/gh-pages
git add -A puppets
git commit -m "Просмотрщик персонажей (puppets/)" || true
git push origin HEAD:gh-pages
cd ../..
git worktree remove --force build/gh-pages
echo "https://igorbal-dev.github.io/Emily-game/puppets/"
