#!/usr/bin/env python3
"""Собирает мини-игры: m1.src.html -> m1.html, подставляет картинки (art/race_img.json + плоские герои из уровней)
   и записи голосов (art/voice_new.json + все записи уровней). Запуск: python3 tools/build_minigames.py"""
import json, re
lv = {}; snd = {}
for n in range(13):
    s = open(f'l{n}.html').read()
    m = re.search(r'const IMG = (\{.*?\});', s); lv.update(json.loads(m.group(1)) if m else {})
    m = re.search(r'const SIZE = (\{.*?\});', s); sz = json.loads(m.group(1)) if m else {}
    for k, v in sz.items(): lv.setdefault('_size_' + k, v)
    snd.update(json.loads(re.search(r'const SND = (\{.*?\});', s).group(1)))
snd.update(json.load(open('art/voice_new.json')))
img = json.load(open('art/race_img.json'))
for k in ['isabel_idle', 'isabel_jump', 'paul_idle', 'paul_jump']:
    w, h = lv['_size_' + k]; img[k] = [lv[k], w, h]
src = open('m1.src.html').read()
used = {k for k in re.findall(r"""play\(\s*['"]([a-z]\w*)['"]""", src) if not k.endswith('_')} | {f'e_{i}' for i in range(1, 11)} | {f'a_{n}_{i}' for n in ['emily', 'isabel', 'paul'] for i in (1, 2, 3)} \
       | {'a_super', 'a_toll', 'a_prima', 'a_juhu', 'a_wunderbar', 'e_erste', 'e_zweite', 'e_dritte', 'a_nach', 'r_like_emily'}
missing = sorted(k for k in used if k not in snd)
if missing: raise SystemExit('нет записи: ' + ', '.join(missing))
out = src.replace('__IMG__', json.dumps(img)).replace('__SND__', json.dumps({k: snd[k] for k in sorted(used)}))
open('m1.html', 'w').write(out)
print('m1.html:', len(img), 'картинок,', len(used), 'записей')
