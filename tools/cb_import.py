#!/usr/bin/env python3
"""Кладёт в игру записи Chatterbox, сделанные на GitHub (ветка claude/chatterbox-proby-dmel1d, папка samples/chatterbox/).
   python3 tools/cb_import.py <папка с wav>        имя файла: <ключ>__<пресет>__<голос>.wav
   Обрезка тишины, 24 кГц моно mp3 48 кбит/с -> assets/snd/<хеш>.mp3, ключ -> art/voice_new.json.
   Ключ k_*/k19_* (Марк) — +5 полутонов, как в voice_import.py. Потом: python3 tools/build_minigames.py"""
import sys, os, re, glob, json, hashlib, subprocess, tempfile
out_path = 'art/voice_new.json'; done = json.load(open(out_path))
af = 'silenceremove=start_periods=1:start_threshold=-45dB:start_silence=0.05,areverse,silenceremove=start_periods=1:start_threshold=-45dB:start_silence=0.08,areverse'
for w in sorted(glob.glob(os.path.join(sys.argv[1], '*.wav'))):
    key = os.path.basename(w).split('__')[0]
    f = ('rubberband=pitch=1.3348,' if re.match(r'k\d*_', key) else '') + af
    res = tempfile.mktemp(suffix='.mp3')
    subprocess.run(['ffmpeg', '-v', 'error', '-y', '-i', w, '-af', f, '-ar', '24000', '-ac', '1', '-b:a', '48k', res], check=True)
    h = hashlib.sha1(open(res, 'rb').read()).hexdigest()[:12]
    dst = f'assets/snd/{h}.mp3'; os.replace(res, dst); done[key] = dst
    print(key, dst)
json.dump(done, open(out_path, 'w'), ensure_ascii=False, indent=1, sort_keys=True)
