#!/usr/bin/env python3
"""Режет общий файл ElevenLabs (блок фраз, между фразами пустая строка) на отдельные записи.

    python3 tools/voice_split.py <файл.mp3 или URL> <ключ1,ключ2,...> [тексты.json]

Ищет паузы (ffmpeg silencedetect) и выбирает N-1 границ так, чтобы длина каждого куска была близка
к ожидаемой (по числу букв фразы из тексты.json: ключ → текст), а паузы на границах — подлиннее. Каждый кусок: обрезка тишины, 24 кГц моно mp3 48 кбит/с →
assets/snd/<хеш>.mp3, ключ → файл в art/voice_new.json. Ключ k_* — Марк (+5 полутонов)."""
import json, sys, subprocess, hashlib, os, re, tempfile, urllib.request

src, keys = sys.argv[1], sys.argv[2].split(',')
if src.startswith('http'):
    tmp = tempfile.mktemp(suffix='.mp3'); urllib.request.urlretrieve(src, tmp); src = tmp
dur = float(subprocess.run(['ffprobe', '-v', 'error', '-show_entries', 'format=duration', '-of', 'csv=p=0', src], capture_output=True, text=True).stdout)
log = subprocess.run(['ffmpeg', '-i', src, '-af', f"silencedetect=noise={os.environ.get('VS_NOISE', '-38')}dB:d={os.environ.get('VS_D', '0.12')}", '-f', 'null', '-'], capture_output=True, text=True).stderr
starts = [float(x) for x in re.findall(r'silence_start: ([\d.]+)', log)]
ends = [float(x) for x in re.findall(r'silence_end: ([\d.]+)', log)]
gaps = [(e - s, s, e) for s, e in zip(starts, ends) if s > 0.05 and e < dur - 0.05]
need = len(keys) - 1
if len(gaps) < need: raise SystemExit(f'пауз {len(gaps)}, а нужно {need}')
texts = json.load(open(sys.argv[3])) if len(sys.argv) > 3 else {}
w = [len(texts.get(k, 'x'*20)) + 8 for k in keys]
pos = [0.0] + [(s + e)/2 for _, s, e in gaps] + [dur]; gl = [0] + [g[0] for g in gaps] + [0]
speech = dur - sum(g[0] for g in gaps)*0.3
exp = [speech*x/sum(w) for x in w]
M = len(pos); INF = float('inf')
# best[i][j]: фразы 0..i-1 закончились в точке j
best = [[INF]*M for _ in range(len(keys) + 1)]; back = [[0]*M for _ in range(len(keys) + 1)]
best[0][0] = 0
for i in range(1, len(keys) + 1):
    for j in range(1, M):
        if i == len(keys) and j != M - 1: continue
        if i < len(keys) and j == M - 1: continue
        for p in range(j):
            if best[i - 1][p] == INF: continue
            d = pos[j] - pos[p]; c = best[i - 1][p] + ((d - exp[i - 1])/exp[i - 1])**2 - 1.5*gl[j]
            if c < best[i][j]: best[i][j], back[i][j] = c, p
j = M - 1; idx = []
for i in range(len(keys), 0, -1): idx.append(j); j = back[i][j]
idx = sorted(idx)[:-1]
cut = [gaps[k - 1] for k in idx]
print(f'{len(keys)} фраз, длительность {dur:.1f} с; самая короткая граница {min(g[0] for g in cut):.2f} с, самая длинная пауза внутри фраз {max([g[0] for g in gaps if g not in cut] or [0]):.2f} с')
bounds = [0.0] + [(s + e)/2 for _, s, e in cut] + [dur]
out_path = 'art/voice_new.json'
done = json.load(open(out_path)) if os.path.exists(out_path) else {}
af = 'silenceremove=start_periods=1:start_threshold=-45dB:start_silence=0.05,areverse,silenceremove=start_periods=1:start_threshold=-45dB:start_silence=0.08,areverse'
for i, key in enumerate(keys):
    res = tempfile.mktemp(suffix='.mp3')
    f = ('rubberband=pitch=1.3348,' if re.match(r'k\d*_', key) else '') + af
    subprocess.run(['ffmpeg', '-v', 'error', '-y', '-ss', f'{bounds[i]:.3f}', '-to', f'{bounds[i + 1]:.3f}', '-i', src, '-af', f, '-ar', '24000', '-ac', '1', '-b:a', '48k', res], check=True)
    h = hashlib.sha1(open(res, 'rb').read()).hexdigest()[:12]
    dst = f'assets/snd/{h}.mp3'; os.replace(res, dst)
    done[key] = dst
    print(f'  {key:22s} {bounds[i + 1] - bounds[i]:5.1f} с  {dst}')
json.dump(done, open(out_path, 'w'), ensure_ascii=False, indent=1, sort_keys=True)
