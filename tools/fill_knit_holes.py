#!/usr/bin/env python3
"""Fills green holes INSIDE a dark/blue accessory (knitted hat, pom-pom) that repair_accessories.py
misses (thin streaks). Holes = green pixels inside the closed shape of the accessory colour; they
are inpainted from the surrounding knit. Hair gaps are left alone.

  python3 tools/fill_knit_holes.py from_chatgpt/mark/hair_hat.png   (in place, keeps *.orig.png if none)
"""
import os
import shutil
import sys

import cv2
import numpy as np
from PIL import Image


def fill(path, close=25):
    orig = path[:-4] + ".orig.png"
    if not os.path.exists(orig):
        shutil.copy(path, orig)
    im = np.asarray(Image.open(path).convert("RGB")).copy()
    r, g, b = [im[..., i].astype(int) for i in range(3)]
    green = (g - np.maximum(r, b)) > 40
    acc = (b > r + 12) & (np.maximum(r, np.maximum(g, b)) < 200) & ~green   # navy knit
    k = np.ones((close, close), np.uint8)
    shape = cv2.morphologyEx(acc.astype(np.uint8), cv2.MORPH_CLOSE, k)
    # fill enclosed holes of the shape itself too
    cnts, _ = cv2.findContours(shape, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)
    solid = np.zeros_like(shape)
    cv2.drawContours(solid, cnts, -1, 1, -1)
    solid = cv2.erode(solid, np.ones((5, 5), np.uint8))
    holes = (solid > 0) & green
    holes = cv2.dilate(holes.astype(np.uint8), np.ones((3, 3), np.uint8))
    out = cv2.inpaint(cv2.cvtColor(im, cv2.COLOR_RGB2BGR), holes, 5, cv2.INPAINT_TELEA)
    Image.fromarray(cv2.cvtColor(out, cv2.COLOR_BGR2RGB)).save(path)
    print(path, int(holes.sum()), "px filled")


if __name__ == "__main__":
    for p in sys.argv[1:]:
        fill(p)
