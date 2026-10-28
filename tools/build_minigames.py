#!/usr/bin/env python3
"""Собирает мини-игры: mN.src.html -> mN.html. В исходнике:
     const IMG = __IMG__;  /*IMG: ключ ключ ...*/   — картинки: из art/race_img.json или из уровней (IMG + SIZE)
     const SND = __SND__;  /*SND: ключ ...*/        — записи: все play('…') из кода + перечисленные тут
   Записи берутся из art/voice_new.json и всех уровней. Нет записи — сборка останавливается.
   Запуск: python3 tools/build_minigames.py"""
import json, re, glob
lv_img, lv_size, snd = {}, {}, {}
for f in sorted(glob.glob('l*.html')):
    s = open(f).read()
    m = re.search(r'const IMG = (\{.*?\});', s); lv_img.update(json.loads(m.group(1)) if m else {})
    m = re.search(r'const SIZE = (\{.*?\});', s); lv_size.update(json.loads(m.group(1)) if m else {})
    m = re.search(r'const SND = (\{.*?\});', s); snd.update(json.loads(m.group(1)) if m else {})
snd.update(json.load(open('art/voice_new.json')))
race = json.load(open('art/race_img.json'))
def expand(words):
    out = []
    for w in words:
        m = re.match(r'(.*)\{(\d+)\.\.(\d+)\}(.*)$', w)
        out += [f'{m.group(1)}{i}{m.group(4)}' for i in range(int(m.group(2)), int(m.group(3)) + 1)] if m else [w]
    return out
for src_f in sorted(glob.glob('m*.src.html')):
    src = open(src_f).read()
    ik = expand(re.search(r'/\*IMG:(.*?)\*/', src, re.S).group(1).split())
    img = {}
    for k in ik:
        if k in race: img[k] = race[k]
        elif k in lv_img and k in lv_size: img[k] = [lv_img[k], *lv_size[k]]
        else: raise SystemExit(f'{src_f}: нет картинки {k}')
    used = {k for k in re.findall(r"""play\(\s*['"]([a-z]\w*)['"]""", src) if not k.endswith('_')}
    used |= set(expand(re.search(r'/\*SND:(.*?)\*/', src, re.S).group(1).split()))
    missing = sorted(k for k in used if k not in snd)
    if missing: raise SystemExit(f'{src_f}: нет записи: ' + ', '.join(missing))
    out = src.replace('__IMG__', json.dumps(img)).replace('__SND__', json.dumps({k: snd[k] for k in sorted(used)}))
    dst = src_f.replace('.src.html', '.html'); open(dst, 'w').write(out)
    print(f'{dst}: {len(img)} картинок, {len(used)} записей')
