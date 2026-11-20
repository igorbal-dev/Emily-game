#!/usr/bin/env python3
"""Добавляет (или обновляет) карточку уровня на карте index.html.
   python3 tools/add_level.py <номер> "<de>" "<ru>" "<тег фраз>" "<тег счёта>" "<тег смысла>" <файл со svg наклейкой или ->
   Картинка карточки = наклейка уровня (STICKER из lN.src.html, если вместо файла «-»)."""
import sys, re, json
n, de, ru, g, m, s, pic = int(sys.argv[1]), *sys.argv[2:8]
if pic == '-':
    src = open(f'l{n}.src.html', encoding='utf-8').read()
    pic = re.search(r"const STICKER = '(.*?)';", src).group(1)
else: pic = open(pic, encoding='utf-8').read()
pic = pic.replace('<svg ', '<svg xmlns="http://www.w3.org/2000/svg" ', 1) if 'xmlns' not in pic else pic
lines = open('index.html', encoding='utf-8').read().split('\n')
i = next(k for k, l in enumerate(lines) if l.startswith('const LEVELS = '))
line = lines[i]; st = line.index('['); d = 0
for e in range(st, len(line)):
    if line[e] == '[': d += 1
    elif line[e] == ']':
        d -= 1
        if not d: break
L = json.loads(line[st:e + 1])
item = {'de': de, 'ru': ru, 'tags': [['g', g], ['m', m], ['s', s]], 'pic': pic}
if n < len(L): L[n] = item
elif n == len(L): L.append(item)
else: raise SystemExit(f'сначала уровень {len(L)}')
lines[i] = line[:st] + json.dumps(L) + line[e + 1:]
open('index.html', 'w', encoding='utf-8').write('\n'.join(lines))
print('карта: уровней', len(L))
