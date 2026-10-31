#!/usr/bin/env python3
"""Generates
  1) the PLACEHOLDER head for the Godot puppet (emily/head/...), and
  2) the outline TEMPLATES / GUIDES for ChatGPT (for_chatgpt/...).

Run from the repo root:  python3 tools/make_head_assets.py
"""
import json
import os
import sys

from PIL import Image, ImageDraw, ImageFilter, ImageFont

sys.path.insert(0, os.path.dirname(__file__))
import head_layout as L  # noqa: E402

ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
HEAD_DIR = os.path.join(ROOT, "emily", "head")
GPT_DIR = os.path.join(ROOT, "for_chatgpt")

SS = 2  # supersampling over template space
GREEN = (0, 255, 0, 255)
SIL_GRAY = (190, 190, 190, 255)

SKIN = (251, 193, 150, 255)
SKIN_LINE = (201, 130, 94, 255)
BLUSH = (247, 140, 130, 110)
EYE_DARK = (58, 36, 26, 255)
IRIS = (122, 78, 44, 255)
HAIR = (226, 164, 92, 255)
HAIR_DARK = (184, 118, 58, 255)
HAIR_LINE = (150, 92, 44, 255)
SCRUNCHIE = (247, 124, 168, 255)
SCRUNCHIE_LINE = (196, 80, 124, 255)


def font(size):
    for p in ("/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf",
              "/usr/share/fonts/truetype/liberation/LiberationSans-Bold.ttf"):
        if os.path.exists(p):
            return ImageFont.truetype(p, size)
    return ImageFont.load_default()


class Canvas:
    """Draw in template coordinates on a supersampled RGBA image."""

    def __init__(self, w=L.TEMPLATE, h=L.TEMPLATE, bg=(0, 0, 0, 0), ss=SS, scale=1.0, ox=0, oy=0):
        self.ss, self.scale, self.ox, self.oy = ss, scale, ox, oy
        self.img = Image.new("RGBA", (w * ss, h * ss), bg)
        self.d = ImageDraw.Draw(self.img)

    def p(self, x, y):
        return ((self.ox + x * self.scale) * self.ss, (self.oy + y * self.scale) * self.ss)

    def s(self, v):
        return v * self.scale * self.ss

    def ell(self, cx, cy, rx, ry, fill=None, outline=None, width=0):
        x0, y0 = self.p(cx - rx, cy - ry)
        x1, y1 = self.p(cx + rx, cy + ry)
        self.d.ellipse([x0, y0, x1, y1], fill=fill, outline=outline, width=int(self.s(width)) if width else 0)

    def arc(self, cx, cy, rx, ry, a0, a1, fill, width):
        x0, y0 = self.p(cx - rx, cy - ry)
        x1, y1 = self.p(cx + rx, cy + ry)
        self.d.arc([x0, y0, x1, y1], a0, a1, fill=fill, width=max(1, int(self.s(width))))

    def poly(self, pts, fill=None, outline=None, width=0):
        self.d.polygon([self.p(*q) for q in pts], fill=fill)
        if outline:
            self.line(pts + [pts[0]], outline, width)

    def line(self, pts, fill, width):
        self.d.line([self.p(*q) for q in pts], fill=fill, width=max(1, int(self.s(width))), joint="curve")
        r = self.s(width) / 2
        for q in (pts[0], pts[-1]):
            x, y = self.p(*q)
            self.d.ellipse([x - r, y - r, x + r, y + r], fill=fill)

    def rect(self, x0, y0, x1, y1, fill=None, outline=None, width=0):
        a, b = self.p(x0, y0), self.p(x1, y1)
        self.d.rectangle([a, b], fill=fill, outline=outline, width=int(self.s(width)) if width else 0)

    def text(self, x, y, t, size, fill, anchor="mm"):
        self.d.text(self.p(x, y), t, font=font(int(self.s(size))), fill=fill, anchor=anchor)

    def out(self, size=None):
        w, h = self.img.size
        if size is None:
            size = (w // self.ss, h // self.ss)
        return self.img.resize(size, Image.LANCZOS)


# ---------------------------------------------------------------- silhouette
def silhouette(c, fill, outline=None, width=0):
    for e in (L.EAR_L, L.EAR_R):
        c.ell(*e, fill=fill, outline=outline, width=width)
    c.ell(*L.CRANIUM, fill=fill, outline=outline, width=width)
    c.ell(*L.JAW, fill=fill, outline=outline, width=width)
    # re-fill the inside so internal outline overlaps disappear
    if outline:
        for e in (L.CRANIUM, L.JAW):
            cx, cy, rx, ry = e
            c.ell(cx, cy, rx - width / 2, ry - width / 2, fill=fill)
        for e in (L.EAR_L, L.EAR_R):
            cx, cy, rx, ry = e
            c.ell(cx + (8 if cx < 512 else -8), cy, rx - width, ry - width, fill=fill)


# ---------------------------------------------------------------- placeholder face
def draw_eye(c, cx, cy, state, side):
    lw = 5
    if state in ("open", "half", "surprised", "sad"):
        rx, ry = (30, 36) if state != "surprised" else (34, 42)
        c.ell(cx, cy, rx, ry, fill=(255, 255, 255, 255), outline=EYE_DARK, width=3)
        ir = 25 if state != "surprised" else 21
        dy = 6 if state == "sad" else 3
        c.ell(cx, cy + dy, ir, ir, fill=IRIS)
        c.ell(cx, cy + dy, ir * 0.5, ir * 0.5, fill=EYE_DARK)
        c.ell(cx - 8, cy + dy - 10, 8, 8, fill=(255, 255, 255, 255))
        c.ell(cx + 9, cy + dy + 8, 4, 4, fill=(255, 255, 255, 230))
        if state == "half":
            c.poly([(cx - rx - 4, cy - ry - 6), (cx + rx + 4, cy - ry - 6), (cx + rx + 4, cy - 2), (cx - rx - 4, cy - 2)], fill=SKIN)
            c.line([(cx - rx, cy - 2), (cx + rx, cy - 2)], EYE_DARK, lw)
        elif state == "sad":
            c.poly([(cx - rx - 4, cy - ry - 6), (cx + rx + 4, cy - ry - 6), (cx + rx + 4, cy - ry + 14), (cx - rx - 4, cy - ry + 14)], fill=SKIN)
            c.line([(cx - rx, cy - ry + 14), (cx + rx, cy - ry + 14)], EYE_DARK, lw)
        else:
            c.arc(cx, cy, rx, ry, 200, 340, EYE_DARK, lw)
        # lashes
        ox = 1 if side > 0 else -1
        top = cy - (ry if state in ("open", "surprised") else 0)
        c.line([(cx + ox * rx * 0.75, top + ry * 0.35 if state in ("open", "surprised") else top), (cx + ox * (rx + 10), top - 2)], EYE_DARK, 4)
    elif state == "closed":
        c.arc(cx, cy - 6, 30, 22, 20, 160, EYE_DARK, lw)
        ox = 1 if side > 0 else -1
        c.line([(cx + ox * 27, cy + 2), (cx + ox * 38, cy + 8)], EYE_DARK, 4)
    elif state == "happy":
        c.arc(cx, cy + 14, 30, 26, 200, 340, EYE_DARK, lw + 1)


def draw_brows(c, state):
    for (cx, cy), side in ((L.EYE_L, -1), (L.EYE_R, 1)):
        y = cy - 62
        if state == "surprised":
            y -= 12
        inner = cx - side * 26
        outer = cx + side * 30
        if state == "sad":
            c.line([(inner, y - 6), (cx, y - 2), (outer, y + 8)], HAIR_DARK, 7)
        else:
            c.arc(cx + side * 2, y + 14, 30, 14, 200, 340, HAIR_DARK, 7)


def draw_mouth(c, state):
    x, y = L.MOUTH
    red = (196, 74, 84, 255)
    inside = (150, 40, 52, 255)
    tongue = (238, 120, 130, 255)
    if state == "smile":
        c.arc(x, y - 16, 34, 22, 25, 155, red, 6)
    elif state == "m":
        c.line([(x - 22, y), (x, y + 3), (x + 22, y)], red, 6)
    elif state == "a":
        c.ell(x, y + 2, 24, 20, fill=inside, outline=red, width=4)
        c.ell(x, y + 12, 14, 8, fill=tongue)
    elif state == "o":
        c.ell(x, y + 2, 15, 19, fill=inside, outline=red, width=4)
    elif state == "e":
        c.poly([(x - 30, y - 6), (x + 30, y - 6), (x + 22, y + 10), (x - 22, y + 10)], fill=inside, outline=red, width=4)
        c.rect(x - 26, y - 5, x + 26, y + 1, fill=(255, 255, 255, 255))
    elif state == "laugh":
        c.poly([(x - 36, y - 10), (x + 36, y - 10), (x + 22, y + 18), (x, y + 24), (x - 22, y + 18)], fill=inside, outline=red, width=4)
        c.rect(x - 30, y - 9, x + 30, y - 3, fill=(255, 255, 255, 255))
        c.ell(x, y + 14, 16, 8, fill=tongue)


def draw_face(c, eyes="open", mouth="smile"):
    silhouette(c, SKIN, SKIN_LINE, 6)
    # ears inner
    for e in (L.EAR_L, L.EAR_R):
        cx, cy, rx, ry = e
        c.arc(cx + (6 if cx < 512 else -6), cy, rx * 0.5, ry * 0.55, 0, 360, (226, 150, 112, 255), 4)
    # blush
    blush = Image.new("RGBA", c.img.size, (0, 0, 0, 0))
    bd = ImageDraw.Draw(blush)
    for bx in (410, 614):
        x0, y0 = c.p(bx - 40, 612 - 22)
        x1, y1 = c.p(bx + 40, 612 + 22)
        bd.ellipse([x0, y0, x1, y1], fill=BLUSH)
    blush = blush.filter(ImageFilter.GaussianBlur(c.s(10)))
    c.img.alpha_composite(blush)
    # nose
    nx, ny = L.NOSE
    c.arc(nx, ny - 6, 12, 9, 30, 150, (214, 140, 104, 255), 5)
    draw_brows(c, eyes)
    draw_eye(c, *L.EYE_L, eyes, -1)
    draw_eye(c, *L.EYE_R, eyes, 1)
    draw_mouth(c, mouth)


def draw_hair_pigtails(c, layer):
    if layer == "back":
        # volume behind the head and the two pigtails
        c.ell(512, 470, 214, 206, fill=HAIR, outline=HAIR_LINE, width=6)
        for side in (-1, 1):
            cx = 512 + side * 238
            pts = [(512 + side * 190, 360), (cx + side * 70, 330), (cx + side * 120, 420),
                   (cx + side * 96, 560), (cx + side * 50, 640), (cx + side * 20, 560), (512 + side * 180, 450)]
            c.poly(pts, fill=HAIR, outline=HAIR_LINE, width=6)
            for k in range(3):
                c.arc(cx + side * (60 + k * 10), 430 + k * 60, 40, 30, 0 if side > 0 else 180, 120 if side > 0 else 300, HAIR_DARK, 5)
            c.ell(512 + side * 196, 384, 26, 34, fill=SCRUNCHIE, outline=SCRUNCHIE_LINE, width=5)
    else:
        # hair cap with centre part, ends at the hairline
        pts = [(318, 520), (322, 420), (360, 336), (430, 292), (512, 278), (594, 292), (664, 336), (702, 420),
               (706, 520), (670, 470), (630, 420), (560, 390), (520, 360), (504, 360), (464, 392), (394, 420), (352, 470)]
        c.poly(pts, fill=HAIR, outline=HAIR_LINE, width=6)
        c.line([(512, 286), (512, 360)], HAIR_DARK, 6)
        for side in (-1, 1):
            c.arc(512 + side * 90, 380, 90, 70, 200 if side < 0 else 270, 270 if side < 0 else 340, HAIR_DARK, 5)
            c.ell(512 + side * 196, 384, 26, 34, fill=SCRUNCHIE, outline=SCRUNCHIE_LINE, width=5)


def feather_mask(zone, size, feather):
    """Alpha mask (in template space, then scaled) for a zone patch: opaque in the middle,
    fading to 0 at the zone border."""
    x, y, w, h = zone
    m = Image.new("L", (w, h), 0)
    d = ImageDraw.Draw(m)
    d.rounded_rectangle([feather, feather, w - feather, h - feather], radius=feather, fill=255)
    m = m.filter(ImageFilter.GaussianBlur(feather / 2))
    return m.resize(size, Image.LANCZOS)


def crop_zone(img512, zone):
    k = L.K
    x, y, w, h = [round(v * k) for v in zone]
    patch = img512.crop((x, y, x + w, y + h))
    mask = feather_mask(zone, (w, h), 14)
    a = patch.getchannel("A")
    from PIL import ImageChops
    patch.putalpha(ImageChops.multiply(a, mask))
    return patch


def make_placeholder():
    os.makedirs(os.path.join(HEAD_DIR, "eyes"), exist_ok=True)
    os.makedirs(os.path.join(HEAD_DIR, "mouth"), exist_ok=True)
    os.makedirs(os.path.join(HEAD_DIR, "hair"), exist_ok=True)
    G = (L.GAME_CANVAS, L.GAME_CANVAS)

    c = Canvas()
    draw_face(c)
    c.out(G).save(os.path.join(HEAD_DIR, "base.png"))

    for e in L.EYES:
        c = Canvas()
        draw_face(c, eyes=e)
        crop_zone(c.out(G), L.EYES_ZONE).save(os.path.join(HEAD_DIR, "eyes", e + ".png"))
    for m in L.MOUTHS:
        c = Canvas()
        draw_face(c, mouth=m)
        crop_zone(c.out(G), L.MOUTH_ZONE).save(os.path.join(HEAD_DIR, "mouth", m + ".png"))

    for layer in ("back", "front"):
        c = Canvas()
        draw_hair_pigtails(c, layer)
        c.out(G).save(os.path.join(HEAD_DIR, "hair", "pigtails_" + layer + ".png"))

    with open(os.path.join(HEAD_DIR, "layout.json"), "w") as f:
        json.dump(L.layout_json(), f, indent=2)


# ---------------------------------------------------------------- templates for ChatGPT
def dashed(c, pts, fill, width, dash=14):
    import math
    for (x0, y0), (x1, y1) in zip(pts, pts[1:]):
        n = max(1, int(math.hypot(x1 - x0, y1 - y0) / dash))
        for i in range(0, n, 2):
            a, b = i / n, min(1, (i + 1) / n)
            c.line([(x0 + (x1 - x0) * a, y0 + (y1 - y0) * a), (x0 + (x1 - x0) * b, y0 + (y1 - y0) * b)], fill, width)


def guide_marks(c, labels=True, zones=None):
    ink = (40, 40, 40, 255)
    blue = (30, 90, 220, 255)
    red = (220, 40, 40, 255)
    # vertical centre line
    dashed(c, [(512, 250), (512, 760)], (90, 90, 90, 255), 2)
    # eye line, eye centres, mouth, nose
    dashed(c, [(330, L.EYE_LINE), (694, L.EYE_LINE)], blue, 3)
    for ex, ey in (L.EYE_L, L.EYE_R):
        c.ell(ex, ey, 30, 36, outline=blue, width=3)
    c.ell(*L.NOSE, 6, 6, fill=ink)
    c.arc(L.MOUTH[0], L.MOUTH[1] - 16, 34, 22, 25, 155, red, 4)
    # chin cut line
    dashed(c, [(380, L.CHIN + 16), (644, L.CHIN + 16)], red, 3)
    if zones:
        for z, col in zones:
            x, y, w, h = z
            c.rect(x, y, x + w, y + h, outline=col, width=3)
    if labels:
        c.text(705, L.EYE_LINE, "eye line", 22, blue, "lm")
        c.text(600, L.MOUTH[1] + 4, "mouth", 22, red, "lm")
        c.text(660, L.CHIN + 18, "cut: nothing below", 20, red, "lm")
        c.text(512, 250, "top of skull (hair goes above/around)", 22, ink)


def make_templates():
    os.makedirs(GPT_DIR, exist_ok=True)
    T = (L.TEMPLATE, L.TEMPLATE)

    # 1. clean head template: grey bald-head silhouette on green
    c = Canvas(bg=GREEN)
    silhouette(c, SIL_GRAY)
    c.out(T).save(os.path.join(GPT_DIR, "template_head.png"))
    c.out(T).save(os.path.join(GPT_DIR, "template_hair.png"))

    # 2. guide (for reading, not for drawing on)
    c = Canvas(bg=(255, 255, 255, 255))
    silhouette(c, (225, 225, 225, 255), (120, 120, 120, 255), 4)
    guide_marks(c, zones=[(L.EYES_ZONE, (30, 90, 220, 255)), (L.MOUTH_ZONE, (220, 40, 40, 255))])
    c.text(512, 40, "HEAD GUIDE  1024 x 1024", 34, (0, 0, 0, 255))
    c.text(512, 84, "grey = bald head, front view. Blue box = eyes+brows zone, red box = mouth zone", 22, (0, 0, 0, 255))
    c.text(512, 960, "Background in real images: flat pure green #00FF00", 24, (0, 120, 0, 255))
    c.out(T).save(os.path.join(GPT_DIR, "guide_head.png"))

    # 3. sheets (eyes / mouth): 3x2 cells
    for kind, names, zone, col in (("eyes", L.EYES, L.EYES_ZONE, (30, 90, 220, 255)),
                                   ("mouth", L.MOUTHS, L.MOUTH_ZONE, (220, 40, 40, 255))):
        clean = Canvas(L.SHEET_W, L.SHEET_H, bg=GREEN)
        guide = Canvas(L.SHEET_W, L.SHEET_H, bg=(255, 255, 255, 255))
        for i, n in enumerate(names):
            ox, oy = L.cell_origin(i)
            # place the 1024 head at 0.5 scale centred in the 512 cell
            for cv in (clean, guide):
                cv.scale, cv.ox, cv.oy = L.SHEET_SCALE, ox, oy
            silhouette(clean, SIL_GRAY)
            silhouette(guide, (225, 225, 225, 255), (120, 120, 120, 255), 6)
            guide_marks(guide, labels=False, zones=[(zone, col)])
            guide.scale, guide.ox, guide.oy = 1.0, 0, 0
            guide.rect(ox + 2, oy + 2, ox + L.CELL - 2, oy + L.CELL - 2, outline=(160, 160, 160, 255), width=2)
            guide.text(ox + L.CELL / 2, oy + 40, f"{i + 1}. {kind}: {n}", 30, (0, 0, 0, 255))
            clean.scale, clean.ox, clean.oy = 1.0, 0, 0
        clean.out((L.SHEET_W, L.SHEET_H)).save(os.path.join(GPT_DIR, f"template_{kind}_sheet.png"))
        guide.out((L.SHEET_W, L.SHEET_H)).save(os.path.join(GPT_DIR, f"guide_{kind}_sheet.png"))


if __name__ == "__main__":
    what = sys.argv[1:] or ["placeholder", "templates"]
    if "placeholder" in what:
        make_placeholder()
    if "templates" in what:
        make_templates()
    print("ok")
