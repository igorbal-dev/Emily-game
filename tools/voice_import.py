#!/usr/bin/env python3
"""Забирает готовые записи ElevenLabs и кладёт их в игру.
   python3 tools/voice_import.py <статус.json> <ключи через запятую в порядке session_ids>
   Скачивает каждую запись, обрезает тишину, делает 24 кГц моно mp3 48 кбит/с,
   кладёт в assets/snd/<хеш>.mp3 и дописывает в art/voice_new.json (ключ -> файл).
   Ключ k_* (Марк, 1,5 года) — голос Tilly поднимается на 5 полутонов."""
import json, sys, subprocess, hashlib, os, tempfile, urllib.request
st = json.load(open(sys.argv[1])); keys = sys.argv[2].split(',')
gens = st['generations']
assert len(gens) == len(keys), (len(gens), len(keys))
out_path = 'art/voice_new.json'
done = json.load(open(out_path)) if os.path.exists(out_path) else {}
for key, g in zip(keys, gens):
    assert g['status'] == 'completed', (key, g['status'])
    tmp = tempfile.mktemp(suffix='.mp3'); res = tempfile.mktemp(suffix='.mp3')
    urllib.request.urlretrieve(g['content_url'], tmp)
    af = 'silenceremove=start_periods=1:start_threshold=-45dB:start_silence=0.05,areverse,silenceremove=start_periods=1:start_threshold=-45dB:start_silence=0.08,areverse'
    if key.startswith('k_'): af = 'rubberband=pitch=1.3348,' + af
    subprocess.run(['ffmpeg', '-v', 'error', '-y', '-i', tmp, '-af', af, '-ar', '24000', '-ac', '1', '-b:a', '48k', res], check=True)
    h = hashlib.sha1(open(res, 'rb').read()).hexdigest()[:12]
    dst = f'assets/snd/{h}.mp3'; os.replace(res, dst); os.remove(tmp)
    done[key] = dst
    print(key, dst, '|', g['prompt'])
json.dump(done, open(out_path, 'w'), ensure_ascii=False, indent=1, sort_keys=True)
