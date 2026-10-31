#!/usr/bin/env python3
"""Theo (the dog) is a frame-by-frame puppet, not a skeleton one.
Source: from_chatgpt/theo/ (ChatGPT sprites: 1024x1024 poses, 512-px-cell strips).
ChatGPT scaled EVERY pose and EVERY strip cell to fill its box, so the dog has a different size in
each image. Here every frame is brought to one scale by the size of the blue harness (sqrt of its
area), with manual corrections where the harness is seen at an angle (FIX), cropped, and anchored at
(harness centre x, ground line).

  python3 tools/make_theo.py        -> theo/frames/*.png + theo/frames.json

frames.json: {name: {"file", "offset": [x, y] (units, top-left relative to the anchor), "scale"}}
"""
import json
import os

import numpy as np
from PIL import Image

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SRC = os.path.join(ROOT, "from_chatgpt", "theo")
DST = os.path.join(ROOT, "theo")
PX_PER_UNIT = 2.0          # texture pixels per game unit
STAND_HEIGHT = 190.0       # Theo standing (ears/head top to paws), game units
POSES = ["stand", "stand_blink", "stand_notail", "happy", "bark", "sniff", "dig", "beg", "sit", "sit_blink",
         "sit_notail", "tilt", "lie", "sleep", "jump_up", "jump_air", "land", "front", "back", "hide"]
STRIPS = {"walk": 6, "run": 6, "shake": 4, "wag_happy": 4}
# harness seen at an angle / partly hidden -> its area lies about the size: multiply the scale
FIX = {"beg": 0.9, "sleep": 0.8, "dig": 0.85, "jump_up": 0.86, "jump_air": 0.9}
# same pose, same size: these use the scale of their base
TAIL_PIVOT = (345, 440)   # base of the tail in theo_tail.png / theo_stand_notail.png canvas
SAME_AS = {"stand_blink": "stand", "sit_blink": "sit"}


def blue(a):
    r, g, b, al = [a[..., i].astype(int) for i in range(4)]
    return (b > r + 40) & (b > g + 15) & (al > 200)


def frames():
    """yields (name, rgba array, ground y)"""
    for n in POSES:
        yield n, np.array(Image.open(os.path.join(SRC, f"theo_{n}.png")).convert("RGBA")), 900
    for n, k in STRIPS.items():
        a = np.array(Image.open(os.path.join(SRC, f"theo_{n}_strip.png")).convert("RGBA"))
        cw = a.shape[1] // k
        for i in range(k):
            yield f"{n}_{i}", a[:, i * cw:(i + 1) * cw], 475


def main():
    data = list(frames())
    size = {n: np.sqrt(blue(a).sum()) for n, a, _ in data}
    # pixels-per-harness of "stand" -> its scale gives STAND_HEIGHT
    st = dict((n, a) for n, a, _ in data)["stand"]
    ys = np.nonzero(st[..., 3] > 128)[0]
    stand_h_px = ys.max() - ys.min()
    unit_per_harness = STAND_HEIGHT / stand_h_px * size["stand"]   # units per harness-size
    os.makedirs(os.path.join(DST, "frames"), exist_ok=True)
    out = {}
    for n, a, ground in data:
        base = SAME_AS.get(n, n)
        s_units = unit_per_harness / size[base] * FIX.get(base, 1.0)   # game units per source pixel
        al = a[..., 3] > 16
        ys, xs = np.nonzero(al)
        x0, y0, x1, y1 = xs.min(), ys.min(), xs.max() + 1, ys.max() + 1
        m = blue(a)
        ax = np.nonzero(m)[1].mean() if m.sum() > 200 else (x0 + x1) / 2
        k = s_units * PX_PER_UNIT
        img = Image.fromarray(a[y0:y1, x0:x1]).resize((max(1, round((x1 - x0) * k)), max(1, round((y1 - y0) * k))), Image.LANCZOS)
        f = f"frames/{n}.png"
        img.save(os.path.join(DST, f), optimize=True)
        out[n] = {"file": f, "offset": [round((x0 - ax) * s_units, 2), round((y0 - ground) * s_units, 2)],
                  "scale": 1.0 / PX_PER_UNIT, "size_px": list(img.size)}
        print(f"{n:16s} units/px={s_units:.3f} height={(y1 - y0) * s_units:6.1f}")
    # the separate tail goes on stand_notail (same canvas, same scale); pivot = base of the tail
    t = np.array(Image.open(os.path.join(SRC, "theo_tail.png")).convert("RGBA"))
    b = dict((n, a) for n, a, _ in data)["stand_notail"]
    s_units = unit_per_harness / size["stand_notail"]
    ax = np.nonzero(blue(b))[1].mean()
    ys, xs = np.nonzero(t[..., 3] > 16)
    x0, y0, x1, y1 = xs.min(), ys.min(), xs.max() + 1, ys.max() + 1
    k = s_units * PX_PER_UNIT
    Image.fromarray(t[y0:y1, x0:x1]).resize((round((x1 - x0) * k), round((y1 - y0) * k)), Image.LANCZOS).save(
        os.path.join(DST, "frames", "tail.png"), optimize=True)
    pivot = (TAIL_PIVOT[0] - ax) * s_units, (TAIL_PIVOT[1] - 900) * s_units
    out["tail"] = {"file": "frames/tail.png", "offset": [round((x0 - TAIL_PIVOT[0]) * s_units, 2), round((y0 - TAIL_PIVOT[1]) * s_units, 2)],
                   "pivot": [round(pivot[0], 2), round(pivot[1], 2)], "scale": 1.0 / PX_PER_UNIT}
    json.dump(out, open(os.path.join(DST, "frames.json"), "w"), indent=1)


if __name__ == "__main__":
    main()
