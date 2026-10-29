#!/bin/sh
# Публикация игры: текущая ветка -> gh-pages, папка old/ (прошлая версия) переносится из нынешнего gh-pages.
# Новая «прошлая версия»: sh tools/publish.sh <коммит>  — в old/ ляжет этот коммит (например, нынешний gh-pages).
set -e
git fetch -q origin gh-pages
OLD=${1:-$(git rev-parse -q --verify origin/gh-pages:old || true)}
export GIT_INDEX_FILE=$(git rev-parse --git-dir)/publish-index
git read-tree HEAD
[ -n "$OLD" ] && git read-tree --prefix=old/ "$OLD^{tree}"
C=$(git commit-tree $(git write-tree) -p origin/gh-pages -p HEAD -m "Публикация $(git rev-parse --short HEAD), old/ — прошлая версия")
rm -f "$GIT_INDEX_FILE"
git push origin claude/emily-game-port "$C:refs/heads/gh-pages"
