"""Озвучка фраз Chatterbox (Resemble AI) по списку из probes.json — для игры Эмили.

Запуск:  python tools/chatterbox/make_probes.py [--out samples/chatterbox] [--shard 0 --shards 4]
Каждая фраза: {"id": ключ, "model": "mtl", "lang": "de"|"ru", "presets": ["A"], "voice": имя образца, "text": текст}.
Образец голоса — tools/chatterbox/voices/<voice>.wav (5–15 с чистой речи героя). Без "voice" — все образцы по очереди.
Файл <ключ>__<пресет>__<голос>.wav, который уже лежит в --out, второй раз не делается (можно дописывать фразы в probes.json).
--shard/--shards: этот запуск делает только каждую N-ю фразу (параллельные задания на GitHub).
"""
import argparse
import gc
import json
import os
import random
import re
import time
import traceback
from pathlib import Path

import numpy as np
import torch
import torchaudio as ta

HERE = Path(__file__).resolve().parent


def seed_all(seed: int):
    random.seed(seed)
    np.random.seed(seed)
    torch.manual_seed(seed)


def max_len(text: str) -> float:
    """Сколько секунд максимум может длиться фраза (с запасом): ~0.11 с на букву + 0.9 с."""
    return 0.9 + 0.11*len(re.sub(r"[^\w]", "", text))*1.5


def load_model(kind: str, device: str):
    if kind == "tts":
        from chatterbox.tts import ChatterboxTTS
        return ChatterboxTTS.from_pretrained(device=device)
    if kind == "mtl":
        from chatterbox.mtl_tts import ChatterboxMultilingualTTS
        return ChatterboxMultilingualTTS.from_pretrained(device=device)  # строка: from_local сравнивает с "cpu"
    if kind == "turbo":
        from chatterbox.tts_turbo import ChatterboxTurboTTS
        return ChatterboxTurboTTS.from_pretrained(device=device)
    raise ValueError(kind)


def main():
    # Пустой HF_TOKEN (секрет не задан) ломает загрузку: 'Illegal header value Bearer '
    if not os.environ.get("HF_TOKEN"):
        os.environ.pop("HF_TOKEN", None)
    ap = argparse.ArgumentParser()
    ap.add_argument("--config", default=str(HERE / "probes.json"))
    ap.add_argument("--out", default="samples/chatterbox")
    ap.add_argument("--only", default="", help="через запятую: tts,mtl,turbo")
    ap.add_argument("--seed", type=int, default=42)
    ap.add_argument("--shard", type=int, default=0)
    ap.add_argument("--shards", type=int, default=1)
    args = ap.parse_args()

    cfg = json.loads(Path(args.config).read_text(encoding="utf-8"))
    presets = cfg["presets"]
    only = {s for s in args.only.split(",") if s}
    device = "cuda" if torch.cuda.is_available() else "cpu"

    voices = {v.stem: str(v) for v in sorted((HERE / "voices").glob("*.wav"))}
    out = Path(args.out)
    out.mkdir(parents=True, exist_ok=True)

    # список работ: (модель, фраза, пресет, голос) — только то, чего ещё нет
    jobs = []
    for p in cfg["probes"]:
        if only and p["model"] not in only:
            continue
        names = [p["voice"]] if p.get("voice") else (list(voices) or ["default"])
        for vn in names:
            for preset in p["presets"]:
                name = f"{p['id']}__{preset}__{vn}.wav"
                if not (out / name).exists():
                    jobs.append((p, preset, vn, name))
    jobs = jobs[args.shard::args.shards]
    print(f"to do: {len(jobs)} (shard {args.shard}/{args.shards})", flush=True)

    report_path = out / f"report_{args.shard}.json"
    report = []
    for kind in ("tts", "mtl", "turbo"):
        mine = [j for j in jobs if j[0]["model"] == kind]
        if not mine:
            continue
        print(f"=== loading {kind} on {device}", flush=True)
        t0 = time.time()
        try:
            model = load_model(kind, device)
        except Exception as e:
            traceback.print_exc()
            report.append({"model": kind, "error": f"load failed: {e}"})
            continue
        print(f"    loaded in {time.time() - t0:.0f}s", flush=True)
        for p, preset, vn, name in mine:
            params = dict(presets[preset])
            for k in ("exaggeration", "cfg_weight", "temperature"):
                if k in p:
                    params[k] = p[k]
            if kind == "turbo":
                params = {"temperature": params.get("temperature", 0.8)}
            kwargs = dict(params)
            if vn in voices:
                kwargs["audio_prompt_path"] = voices[vn]
            if kind == "mtl":
                kwargs["language_id"] = p["lang"]
            text = re.sub(r"\[[^\]]*\]", "", p["text"]).strip()
            t1 = time.time()
            try:
                # модель иногда «договаривает» лишнее после фразы: слишком длинная запись — ещё раз с другим зерном, берём самую короткую
                limit = max_len(text)
                best = None
                for tryn in range(3):
                    seed_all(args.seed + 1000*tryn)
                    tg = time.time()
                    w = model.generate(text, **kwargs)
                    if best is None or w.shape[-1] < best.shape[-1]:
                        best = w
                    if w.shape[-1]/model.sr <= limit or time.time() - tg > 90:
                        break                      # хватит: нормальная длина, или генерация слишком долгая (не зависаем)
                    print(f"    {name}: {w.shape[-1]/model.sr:.1f}s > {limit:.1f}s, retry", flush=True)
                wav = best
                ta.save(str(out / name), wav, model.sr)
                dur = wav.shape[-1] / model.sr
                took = time.time() - t1
                print(f"    {name}: {dur:.1f}s audio in {took:.0f}s", flush=True)
                report.append({"file": name, "model": kind, "lang": p["lang"], "preset": preset, "voice": vn,
                               "params": params, "text": text, "audio_sec": round(dur, 2), "gen_sec": round(took, 1)})
            except Exception as e:
                traceback.print_exc()
                report.append({"file": name, "model": kind, "error": str(e)})
        del model
        gc.collect()

    report_path.write_text(json.dumps(report, ensure_ascii=False, indent=2), encoding="utf-8")
    failed = sum(1 for r in report if "error" in r)
    print(f"done: {len(report) - failed} ok, {failed} failed")


if __name__ == "__main__":
    main()
