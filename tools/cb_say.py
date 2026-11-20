#!/usr/bin/env python3
"""Озвучка без кредитов: Chatterbox (локально, клон голоса по образцу).
   /opt/cb/bin/python tools/cb_say.py фразы.txt          — в игру (assets/snd + art/voice_new.json)
   /opt/cb/bin/python tools/cb_say.py фразы.txt --test   — только пробы в assets/voice-tests/cb_<ключ>.mp3
   Строка файла:  ключ | текст   (теги [happy] и т.п. убираются).
   Голос по началу ключа: b… — Абиха, e… — Эмили, k… — Марк (Эмили +5 полутонов).
   Образцы голосов — art_source/voice-ref/<голос>.wav (10–15 с готовых записей ElevenLabs).
   Установка (каждая новая сессия): uv venv -p 3.11 /opt/cb && VIRTUAL_ENV=/opt/cb uv pip install chatterbox-tts
   Модели качаются с huggingface.co (нужен доступ в настройках сети)."""
import sys, re, json, os, hashlib, subprocess, tempfile
VOICE = {'b': 'abiha2', 'e': 'emily2', 'k': 'emily2'}   # *2 — две длинные записи без склеек: меньше «робота» (выбрал Игорь 1.11)
EXAG = float(os.environ.get('CB_EXAG', '0.6'))   # выразительность 0.25–1
CFG = float(os.environ.get('CB_CFG', '0.5'))
args = [a for a in sys.argv[1:] if not a.startswith('--')]; test = '--test' in sys.argv
lines = [l.split('|', 1) for l in open(args[0], encoding='utf-8') if '|' in l and not l.startswith('#')]
import torch, torchaudio as ta
from chatterbox.mtl_tts import ChatterboxMultilingualTTS
torch.set_num_threads(os.cpu_count())
model = ChatterboxMultilingualTTS.from_pretrained(device='cpu')
out_path = 'art/voice_new.json'; done = json.load(open(out_path))
af = 'silenceremove=start_periods=1:start_threshold=-45dB:start_silence=0.05,areverse,silenceremove=start_periods=1:start_threshold=-45dB:start_silence=0.08,areverse'
for key, text in lines:
    key = key.strip(); text = re.sub(r'\[[^\]]*\]', '', text).strip()
    ref = f'art_source/voice-ref/{VOICE[key[0]]}.wav'
    wav = model.generate(text, language_id='de', audio_prompt_path=ref, exaggeration=EXAG, cfg_weight=CFG)
    tmp = tempfile.mktemp(suffix='.wav'); ta.save(tmp, wav, model.sr)
    f = ('rubberband=pitch=1.3348,' if re.match(r'k\d*_', key) else '') + af
    res = tempfile.mktemp(suffix='.mp3')
    subprocess.run(['ffmpeg', '-v', 'error', '-y', '-i', tmp, '-af', f, '-ar', '24000', '-ac', '1', '-b:a', '48k', res], check=True)
    os.remove(tmp)
    if test:
        dst = f'assets/voice-tests/cb_{key}.mp3'; os.replace(res, dst)
    else:
        h = hashlib.sha1(open(res, 'rb').read()).hexdigest()[:12]
        dst = f'assets/snd/{h}.mp3'; os.replace(res, dst); done[key] = dst
        json.dump(done, open(out_path, 'w'), ensure_ascii=False, indent=1, sort_keys=True)
    print(key, dst, '|', text, flush=True)
