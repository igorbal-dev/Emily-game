#!/usr/bin/env python3
"""Кладёт в игру записи Chatterbox, сделанные на GitHub (ветка claude/chatterbox-proby-dmel1d, папка samples/chatterbox/).
   python3 tools/cb_import.py <папка с wav>        имя файла: <ключ>__<пресет>__<голос>.wav
   Обрезка тишины, 24 кГц моно mp3 48 кбит/с -> assets/snd/<хеш>.mp3, ключ -> art/voice_new.json.
   Ключ k_*/k19_* (Марк) — +5 полутонов, как в voice_import.py. Потом: python3 tools/build_minigames.py
   Ключи, которые уже есть в art/voice_new.json, не трогает (--force — заменить)."""
import sys, os, re, glob, json, hashlib, subprocess, tempfile
# тексты фраз (чтобы отрезать «бормотание» после слишком коротких фраз): probes.json рядом с samples/
PROBES = os.environ.get('CB_PROBES') or os.path.join(os.path.abspath(sys.argv[1]), '..', '..', 'tools', 'chatterbox', 'probes.json')
TEXT = {p['id']: p['text'] for p in json.load(open(PROBES, encoding='utf-8'))['probes']} if os.path.exists(PROBES) else {}
def max_len(t): return 0.9 + 0.11*len(re.sub(r'[^\w]', '', re.sub(r'\[[^\]]*\]', '', t)))*1.5
def dur(f): return float(subprocess.run(['ffprobe', '-v', 'error', '-show_entries', 'format=duration', '-of', 'csv=p=0', f], capture_output=True, text=True).stdout or 0)
out_path = 'art/voice_new.json'; done = json.load(open(out_path))
af = 'silenceremove=start_periods=1:start_threshold=-45dB:start_silence=0.05,areverse,silenceremove=start_periods=1:start_threshold=-45dB:start_silence=0.08,areverse'
for w in sorted(glob.glob(os.path.join(sys.argv[1], '*.wav'))):
    key = os.path.basename(w).split('__')[0]
    if key in done and '--force' not in sys.argv: continue
    f = ('rubberband=pitch=1.3348,' if re.match(r'k\d*_', key) else '') + af
    if key in TEXT and dur(w) > max_len(TEXT[key]):         # слишком длинно: слово в начале, дальше лишнее — обрезаем с затуханием
        m = max_len(TEXT[key]); f = f'atrim=0:{m:.2f},afade=t=out:st={max(0, m - 0.25):.2f}:d=0.25,' + f; print('обрезано', key, round(dur(w), 1), '→', round(m, 1))
    res = tempfile.mktemp(suffix='.mp3')
    subprocess.run(['ffmpeg', '-v', 'error', '-y', '-i', w, '-af', f, '-ar', '24000', '-ac', '1', '-b:a', '48k', res], check=True)
    h = hashlib.sha1(open(res, 'rb').read()).hexdigest()[:12]
    dst = f'assets/snd/{h}.mp3'; os.replace(res, dst); done[key] = dst
    print(key, dst)
json.dump(done, open(out_path, 'w'), ensure_ascii=False, indent=1, sort_keys=True)
