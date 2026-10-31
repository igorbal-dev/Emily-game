#!/bin/sh
# Публикация игры на сайт (ветка gh-pages):
#   корень сайта — всегда актуальная версия; прошлая версия уходит в папку vN/ (v1, v2, …), её можно открыть по ссылке;
#   хранятся только KEEP последних прошлых версий (по умолчанию 2), более старые папки с сайта убираются (место на GitHub Pages);
#   versions.html — список версий с датой и описанием.
# Запуск после commit: sh tools/publish.sh "Коротко, что нового в этой версии"
set -e
KEEP=${KEEP:-2}
DESC=${1:-$(git log -1 --format=%s HEAD)}
git fetch -q origin gh-pages
G=origin/gh-pages
TMP=$(mktemp -d)
export GIT_INDEX_FILE=$TMP/index
add(){ git update-index --add --cacheinfo 100644,"$(git hash-object -w "$1")","$2"; }
esc(){ sed 's/&/\&amp;/g; s/</\&lt;/g; s/>/\&gt;/g'; }

DIRS=$(git ls-tree -d --name-only $G | grep -E '^v[0-9]+$' || true)
N=0; for d in $DIRS; do n=${d#v}; [ "$n" -gt "$N" ] && N=$n; done; N=$((N + 1))
# какие прошлые версии остаются: KEEP-1 из уже лежащих на сайте + новая vN
KEPT=$(for d in $DIRS; do echo "${d#v}"; done | sort -n | tail -n $((KEEP - 1)) | sed "s/^/v/")

# прошлая версия = нынешний корень сайта без папок версий и служебных файлов
git read-tree $G
git rm -r -q --cached --ignore-unmatch $DIRS old versions.html versions.txt version.txt >/dev/null
PREV=$(git write-tree)
git show $G:versions.txt > $TMP/all.txt 2>/dev/null || : > $TMP/all.txt
echo "v$N|$(git show $G:version.txt 2>/dev/null || git log -1 --format='%cs|%s' $G)" >> $TMP/all.txt
: > $TMP/versions.txt; for v in $KEPT v$N; do grep "^$v|" $TMP/all.txt >> $TMP/versions.txt || true; done
echo "$(date +%F)|$DESC" > $TMP/version.txt

# список версий: сверху актуальная, ниже прошлые, от новой к старой
{
  echo '<!doctype html><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Версии игры</title>'
  echo '<style>body{font:18px/1.5 system-ui,sans-serif;max-width:640px;margin:24px auto;padding:0 16px;background:#fffaf0;color:#3b2a1f}a{color:#2f80ed;font-weight:700}li{margin:10px 0}small{color:#8a7a6a}</style>'
  echo '<h1>Версии игры</h1><p><a href="./">Актуальная версия</a> <small>'"$(cut -d'|' -f1 $TMP/version.txt)"'</small><br>'"$(cut -d'|' -f2- $TMP/version.txt | esc)"'</p><h2>Прошлые версии</h2><ul>'
  tac $TMP/versions.txt | while IFS='|' read -r v d t; do echo "<li><a href=\"$v/\">$v</a> <small>$d</small><br>$(echo "$t" | esc)</li>"; done
  echo '</ul>'
} > $TMP/versions.html

# новый сайт: рабочая ветка + все прошлые версии + список
git read-tree HEAD
for d in $KEPT; do git read-tree --prefix="$d/" "$G:$d"; done
git read-tree --prefix="v$N/" "$PREV"
add $TMP/versions.txt versions.txt; add $TMP/version.txt version.txt; add $TMP/versions.html versions.html
C=$(git commit-tree "$(git write-tree)" -p $G -p HEAD -m "Публикация $(git rev-parse --short HEAD); прошлая версия сайта — v$N/")
rm -rf "$TMP"
git push origin "$(git rev-parse --abbrev-ref HEAD)" "$C:refs/heads/gh-pages"
echo "Опубликовано. Прошлая версия: v$N/"
