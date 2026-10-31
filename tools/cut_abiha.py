#!/usr/bin/env python3
"""Абиха: режет листы art_source/abiha/abiha_sheet_N.png на отдельные PNG с прозрачным фоном.

    python3 tools/cut_abiha.py

Фон — белый, связанный с краем листа. Края очищаются от белой каймы (цвет «отделяется» от белого
по прозрачности). Части группируются в ряды: позы, лица, глаза, рты, одежда; имена — в NAMES ниже.
Всё кладётся в art_source/abiha/cut/sheetN/abiha_<имя>.png, рядом contact.jpg для проверки.
Для игры (лист 1) — tools/abiha_game.py."""
import os, sys
import numpy as np
from PIL import Image
from scipy import ndimage

ROOT = 'art_source/abiha'
# имена частей по порядку чтения (как их находит нарезка); None — пропустить
POSES = {1: ['idle', 'wave', 'arms_crossed', 'peace', 'walk', 'walk_front', 'run', 'jump', 'sit_chin', 'sit'],
         2: ['idle', 'wave', 'peace', 'walk', 'walk2', 'run', 'jump', 'jump2', 'arms_crossed'],
         3: ['idle', 'wave', 'arms_crossed', 'peace', 'walk', 'walk_front', 'jump', 'sit_chin', 'sit'],
         4: ['idle', 'wave', 'arms_crossed', 'peace', 'walk', 'walk_front', 'run', 'jump', 'sit_chin', 'sit']}
FACES = {1: ['smile', 'talk', 'laugh', 'surprised', 'sad', 'worried', 'happy_closed', 'smile2', 'look_side'],
         2: [],  # на листе 2 лица слиплись в одну полосу — пропускаем
         3: ['smile', 'talk', 'laugh', 'surprised', 'sad', 'angry', 'wink', 'smile2', 'look_side'],
         4: ['smile', 'talk', 'laugh', 'surprised', 'sad', 'angry', 'wink', 'look_side']}
OUTFITS = {1: ['base', 'dress_pink', 'dress_purple', 'pajama_bunny', 'dress_denim', 'dress_rainbow', 'dress_green', 'winter', 'scooter', 'swimsuit', 'pajama_teddy'],
           2: ['base', 'dress_pink_purple', 'pajama_bunny', 'dress_denim', 'dress_rainbow', 'dress_green', 'winter', 'scooter', 'swimsuit', 'pajama_teddy'],
           3: ['base', 'dress_pink', 'dress_purple', 'pajama_bunny', 'dress_denim', 'dress_rainbow', 'dress_green', 'winter', 'scooter', 'swimsuit', 'pajama_teddy'],
           4: ['base', 'dress_pink', 'dress_purple', 'shorts_heart', 'dress_green', 'overall_denim', 'pajama_teddy', 'winter', 'scooter', 'swimsuit']}


def cut(n):
    src = f'{ROOT}/abiha_sheet_{n}.png'
    out = f'{ROOT}/cut/sheet{n}'
    os.makedirs(out, exist_ok=True)
    a = np.asarray(Image.open(src).convert('RGB')).astype(np.float32)
    H, W, _ = a.shape
    dist = 255*3 - a.sum(2)
    sat = a.max(2) - a.min(2)
    near_white = (dist < 40) & (sat < 22)
    lab, _ = ndimage.label(near_white)
    border = set(np.unique(np.concatenate([lab[0], lab[-1], lab[:, 0], lab[:, -1]]))) - {0}
    bg = np.isin(lab, list(border))
    # тонкие серые разделительные линии листа — тоже фон
    for y in range(H):
        row = ~bg[y]
        if row.mean() > 0.9 and sat[y].mean() < 12 and dist[y].mean() < 120: bg[y] = True
    fg = ndimage.binary_opening(~bg, iterations=1)
    # мягкий край шириной 3 px: прозрачность по «небелости», цвет очищается от белого
    edge = fg & ndimage.binary_dilation(~fg, iterations=3)
    alpha = np.where(fg, 1.0, 0.0)
    alpha[edge] = np.clip(dist[edge]/160.0, 0.0, 1.0)
    rgb = a.copy()
    al = np.maximum(alpha, 1e-3)[..., None]
    clean = np.clip((a - 255*(1 - al))/al, 0, 255)
    rgb[edge] = clean[edge]
    lab2, m = ndimage.label(fg)
    sizes = ndimage.sum(np.ones_like(lab2), lab2, range(1, m + 1))
    minbig = H*W*0.0015
    big = [i + 1 for i in range(m) if sizes[i] >= minbig]
    small = [i + 1 for i in range(m) if 30 <= sizes[i] < minbig]
    groups = {b: [b] for b in big}
    dt, (iy, ix) = ndimage.distance_transform_edt(~np.isin(lab2, big), return_indices=True)
    for sidx, (cy, cx) in zip(small, ndimage.center_of_mass(fg, lab2, small)):
        cy, cx = int(cy), int(cx)
        if dt[cy, cx] < min(H, W)*0.05: groups[lab2[iy[cy, cx], ix[cy, cx]]].append(sidx)
    boxes = []
    for b, ids in groups.items():
        ys, xs = np.where(np.isin(lab2, ids))
        boxes.append([ys.min(), ys.max() + 1, xs.min(), xs.max() + 1, ids])
    boxes.sort(key=lambda b: (b[0] + b[1])/2)
    rows, cur = [], []
    for bx in boxes:
        if cur and (bx[0] + bx[1])/2 > max(c[1] for c in cur): rows.append(cur); cur = []
        cur.append(bx)
    if cur: rows.append(cur)
    rows = [sorted(r, key=lambda b: b[2]) for r in rows]
    # ряды по виду: полный рост (высокие), лица (средние), глаза/рты (низкие и широкие)
    names = []
    poses, faces, outfits = list(POSES[n]), list(FACES[n]), list(OUTFITS[n])
    ne = nm = 0
    for r in rows:
        for bx in r:
            h, w = bx[1] - bx[0], bx[3] - bx[2]
            if h < 90:  # глаза или рот
                if w > 300: names.append('face_x')                      # лица листа 2 слиплись в полоску
                elif w > 125: ne += 1; names.append(f'eyes_{ne}')
                else: nm += 1; names.append(f'mouth_{nm}')
            elif h < 230 and bx[0] > H*0.45: names.append(f'eyes_mouth_{len(names)}')   # глаза и рот слиплись
            elif h < 230 and n == 2 and h > 150 and w < 300: names.append('sit_chin')      # на листе 2 сидит под прыжком
            elif h < 230: names.append('face_' + (faces.pop(0) if faces else f'x{len(names)}'))
            elif bx[0] < H*0.4: names.append(poses.pop(0) if poses else f'pose_x{len(names)}')
            else: names.append('outfit_' + (outfits.pop(0) if outfits else f'x{len(names)}'))
    rgba = np.dstack([rgb, alpha*255]).astype(np.uint8)
    pieces = []
    for name, (y0, y1, x0, x1, ids) in zip(names, [b for r in rows for b in r]):
        if name.startswith('face_x'): continue
        pad = 4
        y0, x0, y1, x1 = max(0, y0 - pad), max(0, x0 - pad), min(H, y1 + pad), min(W, x1 + pad)
        mask = np.isin(lab2[y0:y1, x0:x1], ids) | (ndimage.binary_dilation(np.isin(lab2[y0:y1, x0:x1], ids), iterations=3) & (alpha[y0:y1, x0:x1] > 0) & ~fg[y0:y1, x0:x1])
        piece = rgba[y0:y1, x0:x1].copy()
        piece[..., 3] = np.where(mask, piece[..., 3], 0)
        img = Image.fromarray(piece, 'RGBA')
        img.save(f'{out}/abiha_{name}.png')
        pieces.append((name, img, (x0, y0)))
    th = 200
    sheet = Image.new('RGB', (8*th, ((len(pieces) + 7)//8)*th), 'white')
    for i, (name, img, _) in enumerate(pieces):
        cell = Image.new('RGB', (th, th), (120, 190, 120))
        t = img.copy(); t.thumbnail((th - 10, th - 24)); cell.paste(t, ((th - t.width)//2, 2), t)
        sheet.paste(cell, ((i % 8)*th, (i//8)*th))
    sheet.save(f'{out}/contact.jpg', quality=80)
    print(src, '->', len(pieces), 'частей:', ' '.join(p[0] for p in pieces))
    return {p[0]: p[2] for p in pieces}


if __name__ == '__main__':
    for n in (map(int, sys.argv[1:]) if len(sys.argv) > 1 else range(1, 5)): cut(n)
