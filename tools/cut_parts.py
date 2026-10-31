"""Нарезка листа частей Эмили на отдельные PNG с прозрачным фоном.

Запуск:  python3 -I tools/cut_parts.py tools/source/emily_parts_sheet_preview.jpg assets/emily/parts

Что делает:
  * вырезает каждую часть с чёрного фона и делает фон прозрачным
    (полупрозрачные края пересчитываются, чтобы не было тёмной каймы);
  * у кофточки отрезает рукава (они уже есть на деталях плеч) и лишнюю «кожу» под подолом;
  * делает новые бёдра нормальной формы в серых леггинсах (из текстуры голени)
    и отдельный кусок «таз в леггинсах», которого на листе нет;
  * рисует закрытые глаза для моргания, носик и румянец;
  * подгоняет размеры частей под оригинал emily_idle.png (масштабы в SCALES).
Цвета глаз и волос не меняются.
"""
import os
import sys

import numpy as np
from PIL import Image, ImageDraw, ImageFilter
from scipy import ndimage as nd

SRC, OUT = sys.argv[1], sys.argv[2]
os.makedirs(OUT, exist_ok=True)

sheet = np.asarray(Image.open(SRC).convert("RGB")).astype(np.float32)
H, W, _ = sheet.shape
MAXC = sheet.max(axis=2)
YY, XX = np.mgrid[0:H, 0:W]

# Крупные «острова» на листе — каждая часть.
LAB, _n = nd.label(MAXC > 30)
_sizes = nd.sum(np.ones_like(MAXC), LAB, index=np.arange(1, _n + 1))
BIG = [i + 1 for i, s in enumerate(_sizes) if s > 300]

# Прямоугольники частей на листе 1024x576: (x0, y0, x1, y1)
RECTS = {
    "head": (20, 30, 216, 250),
    "hair": (200, 0, 590, 285),
    "eye_r": (596, 84, 664, 155),   # глаз слева на экране (правый глаз Эмили)
    "eye_l": (704, 84, 772, 156),
    "mouth": (646, 176, 727, 212),
    "torso": (780, 18, 1016, 282),
    "upper_arm_r": (85, 261, 184, 382),
    "upper_arm_l": (248, 261, 346, 381),
    "forearm_r": (423, 265, 498, 385),
    "forearm_l": (530, 265, 603, 386),
    "hand_r": (697, 266, 770, 382),
    "hand_l": (798, 267, 872, 382),
    "shin_r": (412, 393, 485, 561),
    "shin_l": (539, 393, 613, 561),
    "foot_r": (700, 427, 780, 544),
    "foot_l": (816, 427, 899, 546),
}


def rect_mask(r):
    x0, y0, x1, y1 = r
    return (XX >= x0) & (XX < x1) & (YY >= y0) & (YY < y1)


def allowed_for(name):
    """Пиксели, которые принадлежат этой части (а не соседним)."""
    m = rect_mask(RECTS[name])
    own = set(np.unique(LAB[m & (LAB > 0)]))
    # голова и волосы на листе касаются — у них общий «остров», делим вручную
    if name == "head":
        m &= (XX < 206) | ((XX < 212) & (YY > 130))
        others = np.isin(LAB, [b for b in BIG if _sizes[b - 1] < 50000])
    elif name == "hair":
        m &= ~((XX < 206) | ((XX < 212) & (YY > 130)))
        others = np.isin(LAB, [b for b in BIG if _sizes[b - 1] < 50000])
    else:
        others = np.isin(LAB, [b for b in BIG if b not in own])
    m &= ~nd.binary_dilation(others, iterations=3)
    return m


def extract(name, extra_mask=None, fill_holes=True):
    """Вырезать часть: RGBA float32 (0..1), обрезанная по содержимому."""
    allowed = allowed_for(name)
    if extra_mask is not None:
        allowed &= extra_mask
    if fill_holes:
        filled = nd.binary_fill_holes((MAXC > 40) & allowed)
        # «ядро» — внутренняя часть, где цвет точно не испорчен чёрным фоном
        solid = nd.binary_erosion(filled, iterations=3)
    else:   # у волос дырки между локонами — это настоящий фон
        filled = (MAXC > 40) & allowed
        solid = (MAXC > 120) & allowed
    # Цвет полупрозрачного края берём у ближайшего «плотного» пикселя этой же части,
    # а прозрачность — по тому, насколько край темнее этого цвета (фон чёрный).
    # Так нет ни тёмной каймы, ни белых крапинок.
    dist, (iy, ix) = nd.distance_transform_edt(~solid, return_indices=True)
    near = sheet[iy, ix]
    near_max = np.maximum(near.max(axis=2), 30.0)
    soft = np.clip((MAXC - 8.0) / (near_max - 8.0), 0.0, 1.0) * (dist < 8)
    if fill_holes:   # внутри детали (дырки, тени) — непрозрачно
        inner = nd.binary_erosion(filled, iterations=1)
        soft = np.where(inner & (dist <= 3), np.maximum(soft, 0.0), soft)
    alpha = np.where(solid, 1.0, soft) * allowed
    if fill_holes:   # убрать крошки (например, кончики волос рядом с рукой)
        lab, n = nd.label(alpha > 0.05)
        if n > 1:
            sizes = nd.sum(np.ones_like(alpha), lab, index=np.arange(1, n + 1))
            keep = nd.binary_dilation(lab == (np.argmax(sizes) + 1), iterations=2)
            alpha = alpha * keep
    rgb = np.where(solid[..., None], sheet, near) / 255.0
    if not fill_holes:
        # Волосы: тёмные пряди — это смесь волос с чёрным фоном листа.
        # Делаем их полупрозрачными с цветом волос (яркие пряди не меняются).
        ref = 135.0   # ярче этого — волосы как есть, темнее — край на чёрном фоне
        alpha = np.clip((MAXC - 10.0) / (ref - 10.0), 0.0, 1.0) * allowed
        rgb = np.clip(sheet / 255.0 / np.maximum(alpha[..., None], 1e-3), 0.0, 1.0)
        rgb = np.where(alpha[..., None] > 0.02, rgb, near / 255.0)
    rgb = np.clip(rgb, 0.0, 1.0)
    rgba = np.dstack([rgb, alpha]).astype(np.float32)
    ys, xs = np.where(alpha > 0.02)
    y0, y1, x0, x1 = ys.min(), ys.max() + 1, xs.min(), xs.max() + 1
    return rgba[max(0, y0 - 2): y1 + 2, max(0, x0 - 2): x1 + 2].copy()


def to_img(rgba):
    return Image.fromarray((np.clip(rgba, 0, 1) * 255 + 0.5).astype(np.uint8), "RGBA")


def from_img(img):
    return np.asarray(img.convert("RGBA")).astype(np.float32) / 255.0


def ellipse_feather(rgba, cx=0.5, cy=0.5, rx=0.5, ry=0.5, edge=0.22):
    h, w = rgba.shape[:2]
    y, x = np.mgrid[0:h, 0:w]
    r = np.sqrt(((x + 0.5) / w - cx) ** 2 / rx ** 2 + ((y + 0.5) / h - cy) ** 2 / ry ** 2)
    f = np.clip((1.0 - r) / edge, 0.0, 1.0)
    out = rgba.copy()
    out[..., 3] *= f
    return out


def resize(rgba, sx, sy):
    """Масштабирование с правильной прозрачностью (premultiplied)."""
    h, w = rgba.shape[:2]
    nw, nh = max(1, round(w * sx)), max(1, round(h * sy))
    pm = rgba.copy()
    pm[..., :3] *= pm[..., 3:4]
    chans = [np.asarray(Image.fromarray(pm[..., c]).resize((nw, nh), Image.LANCZOS)) for c in range(4)]
    out = np.dstack(chans).astype(np.float32)
    out = np.clip(out, 0, 1)
    a = out[..., 3:4]
    out[..., :3] = np.where(a > 1e-3, out[..., :3] / np.maximum(a, 1e-3), 0)
    return np.clip(out, 0, 1)


def warp_width(rgba, top_scale, bottom_scale):
    """Расширить деталь: сверху в top_scale раз, снизу в bottom_scale раз (плавно)."""
    h, w = rgba.shape[:2]
    nw = int(np.ceil(w * max(top_scale, bottom_scale))) + 2
    y, x = np.mgrid[0:h, 0:nw].astype(np.float32)
    s = top_scale + (bottom_scale - top_scale) * (y / (h - 1))
    src_x = (x - nw / 2.0) / s + w / 2.0
    pm = rgba.copy()
    pm[..., :3] *= pm[..., 3:4]
    out = np.dstack([nd.map_coordinates(pm[..., c], [y, src_x], order=1, mode="constant") for c in range(4)])
    a = out[..., 3:4]
    out[..., :3] = np.where(a > 1e-3, out[..., :3] / np.maximum(a, 1e-3), 0)
    return np.clip(out, 0, 1).astype(np.float32)


parts = {}

# --- простые части ---------------------------------------------------------
parts["hair"] = extract("hair", fill_holes=False)
for name in ["head", "upper_arm_r", "upper_arm_l", "forearm_r", "forearm_l",
             "hand_r", "hand_l", "shin_r", "shin_l", "foot_r", "foot_l"]:
    parts[name] = extract(name)

# --- плечи: убираем шарик кожи над рукавом (он торчал над кофточкой) ---------
for name in ["upper_arm_r", "upper_arm_l"]:
    ua = parts[name]
    h = ua.shape[0]
    rr, gg, bb = ua[..., 0], ua[..., 1], ua[..., 2]
    yy = np.arange(h)[:, None] * np.ones((1, ua.shape[1]))
    skin_top = (gg > bb + 0.03) & (yy < h * 0.5) & (ua[..., 3] > 0)
    skin_top = nd.binary_dilation(skin_top, iterations=1) & (yy < h * 0.5)
    ua[..., 3] = np.where(skin_top, 0.0, ua[..., 3])
    ua[..., 3] = nd.gaussian_filter(ua[..., 3], 0.6) * (ua[..., 3] > 0)

# --- кофточка: без рукавов и без кожи под подолом ---------------------------
body_poly = [(826, 10), (974, 10), (966, 70), (961, 150), (1016, 236), (1016, 285),
             (778, 285), (778, 236), (839, 150), (834, 70)]
pm = Image.new("L", (W, H), 0)
ImageDraw.Draw(pm).polygon(body_poly, fill=255)
body = np.asarray(pm) > 0
r, g, b = sheet[..., 0], sheet[..., 1], sheet[..., 2]
skin = (g > b + 8) & (YY > 205)          # кожа (у розового синий > зелёного)
skin = nd.binary_dilation(skin, iterations=1)
parts["torso"] = extract("torso", body & ~skin)

# --- глаза и рот: мягкие края, чтобы «заплатка» кожи сливалась с лицом -------
parts["eye_r"] = ellipse_feather(extract("eye_r"), rx=0.5, ry=0.52, edge=0.3)
parts["eye_l"] = ellipse_feather(extract("eye_l"), rx=0.5, ry=0.52, edge=0.3)
parts["mouth"] = ellipse_feather(extract("mouth"), rx=0.5, ry=0.55, edge=0.35)


def closed_eye(eye, mirror):
    """Закрытый глаз: от открытого остаётся только бровь, вместо глаза — дуга ресниц."""
    h, w = eye.shape[:2]
    out = eye.copy()
    yy = np.arange(h)[:, None]
    brow_keep = np.clip((h * 0.36 - yy) / (h * 0.06), 0.0, 1.0)   # плавно гасим всё ниже брови
    out[..., 3] *= brow_keep
    S = 4
    lash = Image.new("RGBA", (w * S, h * S), (0, 0, 0, 0))
    d = ImageDraw.Draw(lash)
    cx, cy = w * S * 0.52, h * S * 0.58
    rx = w * S * 0.40
    pts = []
    for i in range(41):
        t = i / 40
        pts.append((cx - rx + 2 * rx * t, cy + np.sin(np.pi * t) * h * S * 0.10))
    d.line(pts, fill=(80, 45, 30, 255), width=int(S * 2.6), joint="curve")
    for t in [0.1, 0.27, 0.73, 0.9]:
        x = cx - rx + 2 * rx * t
        y = cy + np.sin(np.pi * t) * h * S * 0.10
        dx = (-1 if t < 0.5 else 1) * S * 2.5
        d.line([(x, y), (x + dx, y + S * 3.5)], fill=(80, 45, 30, 255), width=int(S * 1.5))
    lash = from_img(lash.resize((w, h), Image.LANCZOS))
    a = lash[..., 3:4]
    out[..., :3] = out[..., :3] * (1 - a) + lash[..., :3] * a
    out[..., 3:4] = a + out[..., 3:4] * (1 - a)
    return out


HEAD_SKIN = np.median(parts["head"][int(parts["head"].shape[0] * 0.45): int(parts["head"].shape[0] * 0.6),
                                    int(parts["head"].shape[1] * 0.3): int(parts["head"].shape[1] * 0.7), :3]
                      .reshape(-1, 3), axis=0)


def keep_features(rgba, skin_ref):
    """Оставить только глаз/брови/губы, а кожу вокруг сделать прозрачной
    (тогда видна кожа самой головы и нет «заплатки»).
    Кожу, которая остаётся у края глаза, подкрашиваем под цвет головы;
    сам глаз (белок, радужка, зрачок, ресницы) не меняется."""
    d = np.sqrt(((rgba[..., :3] - skin_ref[None, None, :]) ** 2).sum(axis=2))
    w = 1.0 - np.clip((d - 0.06) / 0.16, 0.0, 1.0)
    rgba = rgba.copy()
    rgba[..., :3] = np.clip(rgba[..., :3] + w[..., None] * (HEAD_SKIN - skin_ref)[None, None, :], 0, 1)
    m = np.clip((d - 0.13) / 0.12, 0.0, 1.0)
    m = nd.grey_dilation(m, size=(3, 3))
    m = nd.gaussian_filter(m, 0.8)
    out = rgba.copy()
    out[..., 3] *= np.clip(m, 0, 1)
    return out


def patch_skin(rgba):
    a = rgba[..., 3]
    h, w = a.shape
    ring = np.zeros_like(a, bool)
    ring[int(h * 0.75):, :] = True
    ring[:, : int(w * 0.12)] = True
    ring[:, int(w * 0.88):] = True
    sel = ring & (a > 0.5)
    return np.median(rgba[..., :3][sel], axis=0)


for nm in ["eye_r", "eye_l", "mouth"]:
    parts[nm] = keep_features(parts[nm], patch_skin(parts[nm]))
parts["eye_r_closed"] = closed_eye(parts["eye_r"], False)
parts["eye_l_closed"] = closed_eye(parts["eye_l"], True)

# --- новые бёдра: нормальная форма, серые леггинсы ---------------------------
# Берём текстуру голени (там правильная ткань и форма) и расширяем кверху.
parts["thigh_r"] = warp_width(parts["shin_r"], 1.30, 1.04)
parts["thigh_l"] = warp_width(parts["shin_l"], 1.30, 1.04)


# --- таз в леггинсах (на листе его нет, вместо него был кусок кожи) ---------
def make_pelvis(grey, w=142, h=88):
    S = 4
    m = Image.new("L", (w * S, h * S), 0)
    d = ImageDraw.Draw(m)
    # верх под кофточкой и плавный переход в бёдра (без выпуклостей)
    d.polygon([(w * S * 0.04, 0), (w * S * 0.96, 0), (w * S * 0.93, h * S * 0.62),
               (w * S * 0.5, h * S * 0.98), (w * S * 0.07, h * S * 0.62)], fill=255)
    d.rounded_rectangle([0, 0, w * S - 1, h * S * 0.5], radius=S * 18, fill=255)
    m = m.resize((w, h), Image.LANCZOS)
    a = np.asarray(m).astype(np.float32) / 255.0
    y, x = np.mgrid[0:h, 0:w].astype(np.float32)
    u = (x + 0.5) / w * 2 - 1
    shade = 0.80 + 0.26 * np.sqrt(np.clip(1 - u ** 2, 0, 1))      # объём по ширине
    shade *= 1.0 - 0.10 * (y / h)                                    # чуть темнее книзу
    rng = np.random.default_rng(7)
    noise = nd.gaussian_filter(rng.normal(0, 1, (h, w)), 0.8) * 0.025
    rgb = np.clip(grey[None, None, :] * (shade + noise)[..., None], 0, 1)
    # тень от подола кофточки сверху
    rgb *= (1 - 0.25 * np.clip(1 - y / 14.0, 0, 1))[..., None]
    return np.dstack([rgb, a]).astype(np.float32)


shin = parts["shin_r"]
core = shin[int(shin.shape[0] * 0.35): int(shin.shape[0] * 0.65),
            int(shin.shape[1] * 0.3): int(shin.shape[1] * 0.7)]
grey = np.median(core[..., :3].reshape(-1, 3), axis=0)

# --- носик и румянец (на листе нет) -----------------------------------------
def make_face_details(w=150, h=70):
    S = 4
    img = Image.new("RGBA", (w * S, h * S), (0, 0, 0, 0))
    # румянец
    for cx in (0.16, 0.84):
        blob = Image.new("RGBA", (w * S, h * S), (0, 0, 0, 0))
        ImageDraw.Draw(blob).ellipse([w * S * (cx - 0.15), h * S * 0.28, w * S * (cx + 0.15), h * S * 0.78],
                                     fill=(240, 120, 120, 95))
        blob = blob.filter(ImageFilter.GaussianBlur(S * 6))
        img = Image.alpha_composite(img, blob)
    # носик: мягкая тень и блик
    nose = Image.new("RGBA", (w * S, h * S), (0, 0, 0, 0))
    d = ImageDraw.Draw(nose)
    d.arc([w * S * 0.44, h * S * 0.30, w * S * 0.56, h * S * 0.52], 20, 160, fill=(200, 120, 95, 200), width=S * 2)
    nose = nose.filter(ImageFilter.GaussianBlur(S * 1.0))
    img = Image.alpha_composite(img, nose)
    hl = Image.new("RGBA", (w * S, h * S), (0, 0, 0, 0))
    ImageDraw.Draw(hl).ellipse([w * S * 0.475, h * S * 0.27, w * S * 0.515, h * S * 0.36], fill=(255, 235, 220, 150))
    hl = hl.filter(ImageFilter.GaussianBlur(S * 1.0))
    img = Image.alpha_composite(img, hl)
    return from_img(img.resize((w, h), Image.LANCZOS))


# --- подгонка размеров под оригинал (sx, sy) --------------------------------
# 1 пиксель итоговых картинок = 1/1.5 пикселя оригинала emily_idle.png.
SCALES = {
    "head": (1.12, 1.12),
    "hair": (1.08, 1.08),
    "eye_r": (0.80, 0.80), "eye_l": (0.80, 0.80),
    "eye_r_closed": (0.80, 0.80), "eye_l_closed": (0.80, 0.80),
    "mouth": (0.62, 0.62),
    "torso": (1.20, 1.10),
    "upper_arm_r": (1.25, 1.25), "upper_arm_l": (1.25, 1.25),
    "forearm_r": (1.1, 1.1), "forearm_l": (1.1, 1.1),
    "hand_r": (0.62, 0.62), "hand_l": (0.62, 0.62),
    "thigh_r": (0.76, 0.74), "thigh_l": (0.76, 0.74),
    "shin_r": (0.82, 0.82), "shin_l": (0.82, 0.82),
    "foot_r": (0.78, 0.78), "foot_l": (0.78, 0.78),
}
if len(sys.argv) > 3:   # можно переопределить масштабы из json-файла
    import json
    SCALES.update({k: tuple(v) for k, v in json.load(open(sys.argv[3])).items()})

for name, rgba in parts.items():
    sx, sy = SCALES[name]
    out = resize(rgba, sx, sy)
    to_img(out).save(os.path.join(OUT, name + ".png"))
to_img(make_pelvis(grey)).save(os.path.join(OUT, "pelvis.png"))

# Подложка волос: тот же силуэт, плотнее и темнее — кладётся под голову,
# чтобы волосы у основания хвостиков не просвечивали.
hair = from_img(Image.open(os.path.join(OUT, "hair.png")))
back = hair.copy()
back[..., 3] = np.clip(nd.gaussian_filter(np.clip(hair[..., 3] * 2.5, 0, 1), 1.0), 0, 1) * (hair[..., 3] > 0.05)
back[..., :3] = hair[..., :3] * 0.72
to_img(back).save(os.path.join(OUT, "hair_back.png"))

# Голова: плавно убираем низ шеи — шею даёт туловище (иначе видна линия на шее).
head = from_img(Image.open(os.path.join(OUT, "head.png")))
hh = head.shape[0]
yy = np.arange(hh)[:, None]
head[..., 3] *= np.clip((hh * 0.925 - yy) / (hh * 0.035), 0.0, 1.0)
to_img(head).save(os.path.join(OUT, "head.png"))
to_img(make_face_details()).save(os.path.join(OUT, "face_details.png"))

for f in sorted(os.listdir(OUT)):
    if f.endswith(".png"):
        im = Image.open(os.path.join(OUT, f))
        print(f"{f:22s} {im.size[0]:4d} x {im.size[1]:4d}")
