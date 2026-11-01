#!/usr/bin/env python3
"""Matches the skin and hair colours of an imported head to the character reference
(colour transfer in Lab: mean and spread of the reference skin / hair pixels).

  python3 tools/recolor_head.py abiha/head for_chatgpt/abiha/abiha_face.png
  python3 tools/recolor_head.py mark/head  for_chatgpt/mark/mark_face.png

Run right after import_chatgpt.py (it works on the imported files; the originals are kept
as <dir>/.orig/ and are always the starting point, so running it again does not add up).
Skin transform: base.png, eyes/*, mouth/* (the same function everywhere -> patches match).
Hair transform: hair/* only on hair-coloured pixels (scrunchies, hats stay as they are).
The new skin colour goes into layout.json ("skin"), the body uses it.
"""
import glob
import json
import os
import shutil
import sys

import cv2
import numpy as np
from PIL import Image


def lab(rgb):
    return cv2.cvtColor((rgb / 255.0).astype(np.float32), cv2.COLOR_RGB2LAB)


def rgb_of(l):
    return np.clip(cv2.cvtColor(l.astype(np.float32), cv2.COLOR_LAB2RGB) * 255.0, 0, 255)


def skin_mask(rgb):
    r, g, b = rgb[..., 0], rgb[..., 1], rgb[..., 2]
    return (r > 150) & (r > g + 10) & (g > b) & (r - b > 35) & (r - b < 130) & (g > 90)


PALE = False  # --pale-hair: very light blond source hair (Mark v2): light, little coloured strands count as hair too


def hair_mask(rgb, lum_max=200):
    r, g, b = rgb[..., 0], rgb[..., 1], rgb[..., 2]
    lum = rgb.mean(-1)
    if PALE:
        return (r >= g - 2) & (g >= b - 6) & (r - b > 8) & (lum > 20)
    return (r >= g) & (g >= b - 4) & (r - b > 25) & (lum < lum_max) & (lum > 20)


def stats(l, m):
    v = l[m]
    return v.mean(0), v.std(0) + 1e-3


def transfer(l, src, dst, k=1.0, max_scale=1.15, k_light=0.35):
    """k: strength for colour (a, b); k_light: for lightness (the small references have lots of shading)"""
    (ms, ss), (md, sd) = src, dst
    sc = np.clip(sd / ss, 1 / max_scale, 1.0)   # never spread colours more (cheeks/irises would go red)
    sc[0] = 1.0 + (sc[0] - 1.0) * 0.3
    out = (l - ms) * sc + md
    kk = np.array([k_light, k, k], np.float32)
    return l + (out - l) * kk


def main(head_dir, ref_path, hair_ref_path=None):
    orig = os.path.join(head_dir, ".orig")
    files = [os.path.join(head_dir, "base.png")] + sorted(glob.glob(os.path.join(head_dir, "eyes", "*.png"))) \
        + sorted(glob.glob(os.path.join(head_dir, "mouth", "*.png"))) + sorted(glob.glob(os.path.join(head_dir, "hair", "*.png")))
    for f in files:
        o = os.path.join(orig, os.path.relpath(f, head_dir))
        if not os.path.exists(o):
            os.makedirs(os.path.dirname(o), exist_ok=True)
            shutil.copy(f, o)
    ref = np.asarray(Image.open(ref_path).convert("RGB")).astype(np.float32)
    rl = lab(ref)
    hair_ref = rl if hair_ref_path is None else lab(np.asarray(Image.open(hair_ref_path).convert("RGB")).astype(np.float32))
    # head reference: skin = skin-coloured; hair = top part of the image, hair-coloured, not skin
    hr = np.asarray(Image.open(hair_ref_path).convert("RGB")).astype(np.float32) if hair_ref_path else ref
    ref_skin = stats(rl, skin_mask(ref))
    top = np.zeros(hr.shape[:2], bool)
    top[: int(hr.shape[0] * 0.45)] = True
    ref_hair = stats(hair_ref, hair_mask(hr) & ~skin_mask(hr) & top)

    base = np.asarray(Image.open(os.path.join(orig, "base.png")).convert("RGBA")).astype(np.float32)
    bm = (base[..., 3] > 250) & skin_mask(base[..., :3])
    src_skin = stats(lab(base[..., :3]), bm)
    hairs = sorted(glob.glob(os.path.join(orig, "hair", "*_front.png")) + glob.glob(os.path.join(orig, "hair", "*_back.png")))
    hp = np.concatenate([np.asarray(Image.open(h).convert("RGBA")).astype(np.float32).reshape(-1, 4) for h in hairs]) if hairs else None
    src_hair = None
    if hp is not None:
        m = (hp[:, 3] > 200) & hair_mask(hp[None, :, :3])[0]
        if not PALE:
            m &= ~skin_mask(hp[None, :, :3])[0]
        src_hair = stats(lab(hp[None, :, :3])[0], m)
    print("skin  src L,a,b", np.round(src_skin[0], 1), "-> ref", np.round(ref_skin[0], 1))
    if src_hair:
        print("hair  src L,a,b", np.round(src_hair[0], 1), "-> ref", np.round(ref_hair[0], 1))

    for f in files:
        o = os.path.join(orig, os.path.relpath(f, head_dir))
        im = np.asarray(Image.open(o).convert("RGBA")).astype(np.float32)
        rgb, a = im[..., :3], im[..., 3:]
        l = lab(rgb)
        if os.sep + "hair" + os.sep in f:
            if src_hair is None:
                continue
            w = hair_mask(rgb, 255).astype(np.float32)
            w = cv2.GaussianBlur(w, (0, 0), 1.2)[..., None]
            new = rgb_of(transfer(l, src_hair, ref_hair, 0.9))
            # skin-coloured bits next to the hairline get the skin transform
            ws = (skin_mask(rgb) & (not PALE)).astype(np.float32)[..., None]
            new_s = rgb_of(transfer(l, src_skin, ref_skin, 0.9))
            out = rgb * (1 - w) + new * w
            out = out * (1 - ws) + new_s * ws
        else:
            # only skin-like pixels change (soft weight by Lab distance to the skin colour): eyes, brows, lips stay
            d = np.sqrt((((l - src_skin[0]) / (2.2 * src_skin[1])) ** 2).sum(-1))
            w = np.exp(-0.5 * d * d)[..., None]
            out = rgb * (1 - w) + rgb_of(transfer(l, src_skin, ref_skin, 0.9)) * w
        Image.fromarray(np.dstack([out, a]).astype(np.uint8), "RGBA").save(f)
    # body skin colour = new forehead/cheek median
    nb = np.asarray(Image.open(os.path.join(head_dir, "base.png")).convert("RGBA")).astype(np.float32)
    # body = the lit skin of the face (60th percentile of brightness), not a shaded spot
    s = nb.reshape(-1, 4)
    s = s[(s[:, 3] > 250) & skin_mask(s[None, :, :3])[0]][:, :3]
    if len(s):
        lum = s.mean(1)
        s = s[(lum >= np.percentile(lum, 50)) & (lum <= np.percentile(lum, 70))]
    lp = os.path.join(head_dir, "layout.json")
    L = json.load(open(lp))
    if len(s):
        L["skin"] = "#%02x%02x%02x" % tuple(int(v) for v in np.median(s, 0))
    json.dump(L, open(lp, "w"), indent=2)
    print("skin ->", L["skin"])


if __name__ == "__main__":
    args = [a for a in sys.argv[1:] if a != "--pale-hair"]
    PALE = "--pale-hair" in sys.argv
    main(*args)
