#!/usr/bin/env python3
"""Imports ChatGPT pictures from from_chatgpt/ into the puppet (emily/head/).

  python3 tools/import_chatgpt.py [--src from_chatgpt] [--dst emily/head]

- removes the green background (+ green spill)
- aligns every head to the template (by the head silhouette bounding box)
- cuts everything below the chin
- eyes/mouth sheets -> feathered patches for the eyes / mouth zones, colour-matched to head_base
- hair -> grey guide head removed, split into *_front (over the head) and *_back (behind head & body)
- writes the skin colour of the head into layout.json (body skin is recoloured to match)
Missing files are skipped, so it can be run after each new picture.
"""
import argparse
import json
import os
import sys

import numpy as np
from PIL import Image, ImageChops, ImageDraw, ImageFilter

sys.path.insert(0, os.path.dirname(__file__))
import head_layout as L  # noqa: E402
from make_head_assets import Canvas, feather_mask, silhouette  # noqa: E402

ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
T = L.TEMPLATE
G = L.GAME_CANVAS


def unkey(img, gray_too=False):
    """RGBA float array with green (and optionally the grey guide head) made transparent."""
    a = np.asarray(img.convert("RGB")).astype(np.float32)
    r, g, b = a[..., 0], a[..., 1], a[..., 2]
    d = g - np.maximum(r, b)
    alpha = 1.0 - np.clip((d - 30.0) / 60.0, 0, 1)
    g2 = np.minimum(g, np.maximum(r, b) + 8)  # despill
    a[..., 1] = np.where(d > 0, g2, g)
    if gray_too:
        mx, mn = a[..., :3].max(-1), a[..., :3].min(-1)
        sat = mx - mn
        grey = np.clip(1.0 - (sat - 10.0) / 18.0, 0, 1) * ((mx > 110) & (mx < 235))
        alpha = alpha * (1.0 - grey)
    return np.dstack([a, alpha * 255.0])


def to_img(arr):
    return Image.fromarray(np.clip(arr, 0, 255).astype(np.uint8), "RGBA")


def template_bbox():
    c = Canvas(bg=(0, 0, 0, 0))
    silhouette(c, (255, 255, 255, 255))
    a = np.asarray(c.out().getchannel("A"))
    ys, xs = np.nonzero(a > 128)
    return xs.min(), ys.min(), xs.max(), ys.max()


def bbox(alpha, thr=128, upto_y=None):
    m = alpha > thr
    if upto_y is not None:
        m[int(upto_y):] = False
    # ignore specks: a column/row counts only if it has a few solid pixels
    cols = np.nonzero(m.sum(0) >= 4)[0]
    rows = np.nonzero(m.sum(1) >= 4)[0]
    if len(cols) == 0:
        return None
    return (cols.min(), rows.min(), cols.max(), rows.max())


def align_head(img, size):
    """img: RGBA head on a canvas of `size` (square, template-like). Returns a 1024 RGBA aligned to template."""
    k = T / size
    img = img.resize((T, T), Image.LANCZOS) if size != T else img
    a = np.asarray(img.getchannel("A")).astype(np.float32)
    tb = template_bbox()
    # width = ear to ear (measured above the chin area), top = top of skull
    bb = bbox(a, upto_y=L.CHIN - 40)
    if bb is None:
        return img
    sx = (tb[2] - tb[0]) / max(1.0, bb[2] - bb[0])
    s = float(np.clip(sx, 0.75, 1.33))
    cx = (bb[0] + bb[2]) / 2
    ox = (tb[0] + tb[2]) / 2 - cx * s
    oy = tb[1] - bb[1] * s
    out = img.transform((T, T), Image.AFFINE, (1 / s, 0, -ox / s, 0, 1 / s, -oy / s), resample=Image.BICUBIC)
    print(f"    align: scale {s:.3f} offset ({ox:.0f},{oy:.0f})  (k={k:.2f})")
    return out


def chin_cut(img):
    """Remove everything below the jaw (neck stub)."""
    m = Image.new("L", (T, T), 0)
    d = ImageDraw.Draw(m)
    d.rectangle([0, 0, T, L.CHIN - 60], fill=255)
    cx, cy, rx, ry = L.JAW
    d.ellipse([cx - rx - 6, cy - ry - 6, cx + rx + 6, cy + ry + 10], fill=255)
    m = m.filter(ImageFilter.GaussianBlur(3))
    img.putalpha(ImageChops.multiply(img.getchannel("A"), m))
    return img


def color_match(patch, base, zone):
    """Scale RGB of the patch so its border ring matches the base under it."""
    x, y, w, h = [round(v * L.K) for v in zone]
    under = np.asarray(base.crop((x, y, x + w, y + h))).astype(np.float32)
    p = np.asarray(patch).astype(np.float32)
    ring = np.zeros((h, w), bool)
    ring[:6, :] = ring[-6:, :] = ring[:, :6] = ring[:, -6:] = True
    ring &= (under[..., 3] > 200) & (p[..., 3] > 200)
    if ring.sum() < 20:
        return patch
    gain = under[ring][:, :3].mean(0) / np.maximum(1, p[ring][:, :3].mean(0))
    gain = np.clip(gain, 0.85, 1.18)
    p[..., :3] *= gain
    return to_img(p)


def zone_patch(full512, zone, base512):
    x, y, w, h = [round(v * L.K) for v in zone]
    patch = full512.crop((x, y, x + w, y + h))
    patch = color_match(patch, base512, zone)
    mask = feather_mask(zone, (w, h), 14)
    patch.putalpha(ImageChops.multiply(patch.getchannel("A"), mask))
    return patch


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--src", default=os.path.join(ROOT, "from_chatgpt"))
    ap.add_argument("--dst", default=os.path.join(ROOT, "emily", "head"))
    args = ap.parse_args()
    src, dst = args.src, args.dst
    for sub in ("eyes", "mouth", "hair"):
        os.makedirs(os.path.join(dst, sub), exist_ok=True)
    layout = L.layout_json()
    base512 = None

    p = os.path.join(src, "head_base.png")
    if os.path.exists(p):
        print("head_base")
        img = Image.open(p)
        head = chin_cut(align_head(to_img(unkey(img)), img.width))
        base512 = head.resize((G, G), Image.LANCZOS)
        base512.save(os.path.join(dst, "base.png"))
        # skin colour: median of the cheeks/forehead
        a = np.asarray(head).astype(np.float32)
        sample = a[380:440, 440:584].reshape(-1, 4)
        sample = sample[sample[:, 3] > 250][:, :3]
        if len(sample):
            rgb = np.median(sample, 0)
            layout["skin"] = "#%02x%02x%02x" % tuple(int(v) for v in rgb)
    elif os.path.exists(os.path.join(dst, "base.png")):
        base512 = Image.open(os.path.join(dst, "base.png")).convert("RGBA")

    for kind, names, zone in (("eyes", L.EYES, L.EYES_ZONE), ("mouth", L.MOUTHS, L.MOUTH_ZONE)):
        p = os.path.join(src, f"{kind}_sheet.png")
        if not os.path.exists(p) or base512 is None:
            continue
        print(kind + "_sheet")
        sheet = Image.open(p).convert("RGB").resize((L.SHEET_W, L.SHEET_H), Image.LANCZOS)
        for i, n in enumerate(names):
            ox, oy = L.cell_origin(i)
            cell = sheet.crop((ox, oy, ox + L.CELL, oy + L.CELL))
            head = chin_cut(align_head(to_img(unkey(cell)), L.CELL))
            zone_patch(head.resize((G, G), Image.LANCZOS), zone, base512).save(os.path.join(dst, kind, n + ".png"))

    if base512 is not None:
        hm = base512.getchannel("A").filter(ImageFilter.MaxFilter(5)).filter(ImageFilter.GaussianBlur(2))
    for name, _ in L.HAIRS:
        p = os.path.join(src, f"hair_{name}.png")
        if not os.path.exists(p):
            continue
        print("hair", name)
        img = Image.open(p)
        hair = to_img(unkey(img, gray_too=True)).resize((G, G), Image.LANCZOS)
        a = hair.getchannel("A")
        front, back = hair.copy(), hair.copy()
        if base512 is not None:
            front.putalpha(ImageChops.multiply(a, hm))
            back.putalpha(ImageChops.multiply(a, ImageChops.invert(hm)))
        else:
            back.putalpha(Image.new("L", (G, G), 0))
        front.save(os.path.join(dst, "hair", name + "_front.png"))
        back.save(os.path.join(dst, "hair", name + "_back.png"))

    with open(os.path.join(dst, "layout.json"), "w") as f:
        json.dump(layout, f, indent=2)
    print("done. Now open the project in Godot (or run godot --headless --import) to import the new PNGs.")


if __name__ == "__main__":
    main()
