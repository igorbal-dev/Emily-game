#!/usr/bin/env python3
"""ChatGPT sometimes 'eats' parts of coloured hair accessories (scrunchies, headband, star clips)
when it makes the green background: there are green holes inside them. This fills such holes
with the colour of the surrounding accessory/hair pixels. Only holes next to accessory colours
(pink, yellow, flowers... = not orange hair) and enclosed by the drawing are filled.

  python3 tools/repair_accessories.py from_chatgpt/hair_*.png   (writes in place, keeps *.orig.png)
"""
import os
import shutil
import sys

import cv2
import numpy as np
from PIL import Image
from scipy import ndimage as ndi


def repair(path):
    orig = path[:-4] + ".orig.png"
    a = np.asarray(Image.open(orig if os.path.exists(orig) else path).convert("RGB"))
    ai = a.astype(np.int32)
    green = (ai[..., 1] - np.maximum(ai[..., 0], ai[..., 2])) > 60
    hsv = cv2.cvtColor(a, cv2.COLOR_RGB2HSV).astype(int)
    h, s, v = hsv[..., 0], hsv[..., 1], hsv[..., 2]
    acc = (~green) & (s > 60) & (v > 90) & ~((h >= 4) & (h <= 22))
    acc = ndi.binary_opening(acc, iterations=1)
    near = ndi.binary_dilation(acc, iterations=10)
    closed = ndi.binary_closing(~green, iterations=6)
    lab, _ = ndi.label(~closed)
    border = set(np.unique(np.r_[lab[0], lab[-1], lab[:, 0], lab[:, -1]])) - {0}
    enclosed = green & ~np.isin(lab, list(border))
    holes = enclosed & near
    # also enclosed gaps right next to the grey guide head (hair should touch the head)
    grey = (np.abs(ai - 190).max(-1) < 12)
    holes |= enclosed & ndi.binary_dilation(grey, iterations=30)
    if holes.sum() == 0:
        return 0
    # colour from nearby accessory pixels first (so a pink scrunchie stays pink), then any drawing
    rgb = a.astype(np.float32)
    out = rgb.copy()
    todo = holes.copy()
    for src in (acc & ~grey, ~green & ~grey):
        w0 = src.astype(np.float32)
        for rad in (2, 4, 8, 16):
            w = cv2.GaussianBlur(w0, (0, 0), rad)
            col = cv2.GaussianBlur(rgb * w0[..., None], (0, 0), rad)
            ok = todo & (w > 0.05)
            out[ok] = col[ok] / w[ok][:, None]
            todo &= ~ok
    if not os.path.exists(path[:-4] + ".orig.png"):
        shutil.copy(path, path[:-4] + ".orig.png")
    Image.fromarray(np.clip(out, 0, 255).astype(np.uint8)).save(path)
    return int(holes.sum())


if __name__ == "__main__":
    for p in sys.argv[1:]:
        if p.endswith(".orig.png"):
            continue
        print(os.path.basename(p), repair(p), "px filled")
