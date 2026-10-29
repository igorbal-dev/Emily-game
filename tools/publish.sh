#!/bin/sh
# Публикация игры на сайт (ветка gh-pages). Ничего не удаляется:
#   корень сайта — всегда актуальная версия; прошлая версия уходит в папку vN/ (v1, v2, …), её можно открыть по ссылке;
#   versions.html — список всех версий с датой и описанием; old/ — старая ссылка, ведёт на v1/.
# Запуск после commit: sh tools/publish.sh "Коротко, что нового в этой версии"
set -e
DESC=${1:-$(git log -1 --format=%s HEAD)}
git fetch -q origin gh-pages
G=origin/gh-pages
TMP=$(mktemp -d)
export GIT_INDEX_FILE=$TMP/index
add(){ git update-index --add --cacheinfo 100644,"$(git hash-object -w "$1")","$2"; }
esc(){ sed 's/&/\&amp;/g; s/</\&lt;/g; s/>/\&gt;/g'; }

DIRS=$(git ls-tree -d --name-only $G | grep -E '^v[0-9]+$' || true)
N=0; for d in $DIRS; do n=${d#v}; [ "$n" -gt "$N" ] && N=$n; done; N=$((N + 1))

# прошлая версия = нынешний корень сайта без папок версий и служебных файлов
git read-tree $G
git rm -r -q --cached --ignore-unmatch $DIRS old versions.html versions.txt version.txt >/dev/null
PREV=$(git write-tree)
git show $G:versions.txt > $TMP/versions.txt 2>/dev/null || : > $TMP/versions.txt
echo "v$N|$(git show $G:version.txt 2>/dev/null || git log -1 --format='%cs|%s' $G)" >> $TMP/versions.txt
echo "$(date +%F)|$DESC" > $TMP/version.txt

# список версий: сверху актуальная, ниже прошлые, от новой к старой
{
  echo '<!doctype html><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Версии игры</title>'
  echo '<style>body{font:18px/1.5 system-ui,sans-serif;max-width:640px;margin:24px auto;padding:0 16px;background:#fffaf0;color:#3b2a1f}a{color:#2f80ed;font-weight:700}li{margin:10px 0}small{color:#8a7a6a}</style>'
  echo '<h1>Версии игры</h1><p><a href="./">Актуальная версия</a> <small>'"$(cut -d'|' -f1 $TMP/version.txt)"'</small><br>'"$(cut -d'|' -f2- $TMP/version.txt | esc)"'</p><h2>Прошлые версии</h2><ul>'
  tac $TMP/versions.txt | while IFS='|' read -r v d t; do echo "<li><a href=\"$v/\">$v</a> <small>$d</small><br>$(echo "$t" | esc)</li>"; done
  echo '</ul>'
} > $TMP/versions.html
echo '<!doctype html><meta charset="utf-8"><meta http-equiv="refresh" content="0; url=../v1/"><a href="../v1/">v1</a>' > $TMP/old.html

# новый сайт: рабочая ветка + все прошлые версии + список
git read-tree HEAD
for d in $DIRS; do git read-tree --prefix="$d/" "$G:$d"; done
git read-tree --prefix="v$N/" "$PREV"
add $TMP/versions.txt versions.txt; add $TMP/version.txt version.txt; add $TMP/versions.html versions.html; add $TMP/old.html old/index.html
C=$(git commit-tree "$(git write-tree)" -p $G -p HEAD -m "Публикация $(git rev-parse --short HEAD); прошлая версия сайта — v$N/")
rm -rf "$TMP"
git push origin "$(git rev-parse --abbrev-ref HEAD)" "$C:refs/heads/gh-pages"
echo "Опубликовано. Прошлая версия: v$N/"
