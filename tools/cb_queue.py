#!/usr/bin/env python3
"""Ставит в очередь Chatterbox все фразы уровней, у которых ещё нет записи.
   python3 tools/cb_queue.py <probes.json ветки claude/chatterbox-proby-dmel1d> l24.src.html [l25.src.html …]
   Берёт SAY страницы, пропускает ключи из art/voice_new.json, дописывает в probes.json (без повторов).
   Голос по первой букве ключа (как в js/mini.js): n/a — ведущая, r — русская подсказка (ru), e/k — Эмили (k потом +5 полутонов),
   b — Абиха, i — Изабель, p — Пауль, s — Хайке. Дальше: commit + push ветки chatterbox → GitHub озвучит → tools/cb_import.py."""
import sys, re, json
VOICE = {'n': 'narr', 'a': 'narr', 'r': 'narr_ru', 'e': 'emily2', 'k': 'emily2', 'b': 'abiha2', 'i': 'isabel', 'p': 'paul', 's': 'heike'}
probes_path, srcs = sys.argv[1], sys.argv[2:]
done = json.load(open('art/voice_new.json'))
cfg = json.load(open(probes_path, encoding='utf-8'))
have = {p['id'] for p in cfg['probes']}
added = 0
for f in srcs:
    s = open(f, encoding='utf-8').read()
    m = re.search(r'const SAY = \{(.*?)\n\};', s, re.S)
    for k, t in re.findall(r"^\s*([a-z]\w*)\s*:\s*'((?:[^'\\]|\\.)*)'", m.group(1), re.M):
        if k in done or k in have: continue
        if k[0] not in VOICE: print('нет голоса для', k); continue
        cfg['probes'].append({'id': k, 'model': 'mtl', 'lang': 'ru' if k[0] == 'r' else 'de', 'presets': ['A'], 'voice': VOICE[k[0]], 'text': t.replace("\\'", "'")})
        have.add(k); added += 1
json.dump(cfg, open(probes_path, 'w', encoding='utf-8'), ensure_ascii=False, indent=1)
print('в очередь:', added, 'всего в списке:', len(cfg['probes']))
