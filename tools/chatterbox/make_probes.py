"""Генерирует пробы голоса Chatterbox (Resemble AI) по списку из probes.json.

Запуск:  python tools/chatterbox/make_probes.py [--out samples/chatterbox] [--only tts,mtl,turbo]
Каждый .wav из tools/chatterbox/voices/ (5–15 с чистой речи) — образец голоса (клон);
если образцов нет — встроенный голос модели.
"""
import argparse
import gc
import json
import os
import random
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
    args = ap.parse_args()

    cfg = json.loads(Path(args.config).read_text(encoding="utf-8"))
    presets = cfg["presets"]
    only = {s for s in args.only.split(",") if s}
    device = "cuda" if torch.cuda.is_available() else "cpu"
    torch.set_num_threads(max(1, torch.get_num_threads()))

    voices = sorted((HERE / "voices").glob("*.wav"))
    voice_variants = [(v.stem, str(v)) for v in voices] or [("default", None)]

    out = Path(args.out)
    out.mkdir(parents=True, exist_ok=True)
    report = []

    order = [m for m in ("tts", "mtl", "turbo") if not only or m in only]
    for kind in order:
        items = [p for p in cfg["probes"] if p["model"] == kind]
        if not items:
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

        for p in items:
            for voice_name, voice_path in voice_variants:
                for preset in p["presets"]:
                    params = dict(presets[preset])
                    for k in ("exaggeration", "cfg_weight", "temperature"):
                        if k in p:
                            params[k] = p[k]
                    if kind == "turbo":
                        params = {"temperature": params.get("temperature", 0.8)}
                    name = f"{p['id']}__{preset}__{voice_name}.wav"
                    kwargs = dict(params)
                    if voice_path:
                        kwargs["audio_prompt_path"] = voice_path
                    if kind == "mtl":
                        kwargs["language_id"] = p["lang"]
                    seed_all(args.seed)
                    t1 = time.time()
                    try:
                        wav = model.generate(p["text"], **kwargs)
                        ta.save(str(out / name), wav, model.sr)
                        dur = wav.shape[-1] / model.sr
                        took = time.time() - t1
                        print(f"    {name}: {dur:.1f}s audio in {took:.0f}s", flush=True)
                        report.append({"file": name, "model": kind, "lang": p["lang"], "preset": preset,
                                       "voice": voice_name, "params": params, "text": p["text"],
                                       "audio_sec": round(dur, 2), "gen_sec": round(took, 1)})
                    except Exception as e:
                        traceback.print_exc()
                        report.append({"file": name, "model": kind, "error": str(e)})
        del model
        gc.collect()

    (out / "report.json").write_text(json.dumps(report, ensure_ascii=False, indent=2), encoding="utf-8")
    lines = ["# Пробы Chatterbox", "", f"Устройство: `{device}`, seed: {args.seed}", "",
             "| Файл | Модель | Язык | Пресет | Голос | Параметры | Текст | Длит. | Генерация |",
             "|---|---|---|---|---|---|---|---|---|"]
    for r in report:
        if "error" in r:
            lines.append(f"| {r.get('file', '-')} | {r['model']} | | | | | ОШИБКА: {r['error']} | | |")
            continue
        ps = ", ".join(f"{k}={v}" for k, v in r["params"].items())
        lines.append(f"| [{r['file']}]({r['file']}) | {r['model']} | {r['lang']} | {r['preset']} | {r['voice']} "
                     f"| {ps} | {r['text']} | {r['audio_sec']}s | {r['gen_sec']}s |")
    (out / "README.md").write_text("\n".join(lines) + "\n", encoding="utf-8")
    failed = sum(1 for r in report if "error" in r)
    print(f"done: {len(report) - failed} ok, {failed} failed")


if __name__ == "__main__":
    main()
