"""Режет лист из ChatGPT на отдельные части с прозрачным фоном.

    python3 tools/cut_sheet.py art/incoming/T1.png art/parts/T1 [колонки x ряды]

Фон: почти белые пиксели, связанные с краем листа (белые воротнички и белки глаз внутри
частей остаются). Мелкие кусочки (шерсть, песок) прикрепляются к ближайшей большой части.
С сеткой части нумеруются по ячейкам (1..N слева направо, сверху вниз); без сетки —
по рядам в порядке чтения. Рядом кладётся contact.png — все части на шахматке для проверки."""
import sys, os
import numpy as np
from PIL import Image
from scipy import ndimage

src, out = sys.argv[1], sys.argv[2]
grid = sys.argv[3] if len(sys.argv) > 3 else None
os.makedirs(out, exist_ok=True)
a = np.asarray(Image.open(src).convert('RGB')).astype(np.int16)
H, W, _ = a.shape

dist = 255*3 - a.sum(2)                  # насколько пиксель темнее белого
sat = a.max(2) - a.min(2)
near_white = (dist < 45) & (sat < 24)
lab, _ = ndimage.label(near_white)
border = set(np.unique(np.concatenate([lab[0], lab[-1], lab[:, 0], lab[:, -1]]))) - {0}
bg = np.isin(lab, list(border))
fg = ndimage.binary_opening(~bg, iterations=1)

# мягкий край: в кайме шириной 2 пикселя прозрачность по близости к белому
edge = fg & ndimage.binary_dilation(~fg, iterations=2)
alpha = np.where(fg, 255.0, 0.0)
alpha[edge] = 255*np.clip(dist[edge]/140.0, 0.2, 1.0)

lab2, m = ndimage.label(fg)
sizes = ndimage.sum(np.ones_like(lab2), lab2, range(1, m + 1))
minbig = H*W*0.0015
big = [i + 1 for i in range(m) if sizes[i] >= minbig]
small = [i + 1 for i in range(m) if 40 <= sizes[i] < minbig]
groups = {b: [b] for b in big}
if big and small:
    # мелкие — к ближайшей большой по расстоянию до её пикселей
    dt, (iy, ix) = ndimage.distance_transform_edt(~np.isin(lab2, big), return_indices=True)
    for sidx, (cy, cx) in zip(small, ndimage.center_of_mass(fg, lab2, small)):
        cy, cx = int(cy), int(cx)
        if dt[cy, cx] < min(H, W)*0.06:
            groups[lab2[iy[cy, cx], ix[cy, cx]]].append(sidx)

boxes = []
for b, ids in groups.items():
    mask = np.isin(lab2, ids)
    ys, xs = np.where(mask)
    boxes.append((ys.min(), ys.max() + 1, xs.min(), xs.max() + 1, ids))

if grid:
    cols, rows = map(int, grid.split('x'))
    def key(bx):
        cy, cx = (bx[0] + bx[1])/2, (bx[2] + bx[3])/2
        return int(cy // (H/rows))*cols + int(cx // (W/cols))
    named = {}
    for bx in boxes:
        k = key(bx)
        if k in named:   # две части в одной ячейке — склеиваем (например, пара хвостиков)
            o = named[k]; named[k] = (min(o[0], bx[0]), max(o[1], bx[1]), min(o[2], bx[2]), max(o[3], bx[3]), o[4] + bx[4])
        else: named[k] = bx
    order = [(k + 1, named[k]) for k in sorted(named)]
else:
    # ряды: группируем по вертикальному перекрытию
    boxes.sort(key=lambda b: (b[0] + b[1])/2)
    rows_, cur = [], []
    for bx in boxes:
        if cur and (bx[0] + bx[1])/2 > max(c[1] for c in cur): rows_.append(cur); cur = []
        cur.append(bx)
    if cur: rows_.append(cur)
    order, n = [], 1
    for r in rows_:
        for bx in sorted(r, key=lambda b: b[2]): order.append((n, bx)); n += 1

rgba = np.dstack([a.astype(np.uint8), alpha.astype(np.uint8)])
pieces = []
for n, (y0, y1, x0, x1, ids) in order:
    pad = 6
    y0, x0, y1, x1 = max(0, y0 - pad), max(0, x0 - pad), min(H, y1 + pad), min(W, x1 + pad)
    mask = np.isin(lab2[y0:y1, x0:x1], ids)
    piece = rgba[y0:y1, x0:x1].copy()
    piece[..., 3] = np.where(mask, piece[..., 3], 0)
    img = Image.fromarray(piece, 'RGBA')
    img.save(f'{out}/{n}.png')
    pieces.append((n, img))
    print(f'  {n}: {x1-x0}x{y1-y0} от ({x0},{y0})')

# лист для проверки: части на шахматке
th = 220
cw = max(1, len(pieces))
sheet = Image.new('RGB', (min(cw, 8)*th, ((cw + 7)//8)*th), 'white')
chk = Image.new('RGB', (th, th))
for y in range(0, th, 16):
    for x in range(0, th, 16):
        chk.paste((205, 205, 215) if (x//16 + y//16) % 2 else (240, 240, 245), (x, y, x + 16, y + 16))
for i, (n, img) in enumerate(pieces):
    t = img.copy(); t.thumbnail((th - 10, th - 10))
    cell = chk.copy(); cell.paste(t, ((th - t.width)//2, (th - t.height)//2), t)
    sheet.paste(cell, ((i % 8)*th, (i//8)*th))
sheet.save(f'{out}/contact.jpg', quality=80)
print(os.path.basename(src), '->', len(pieces), 'частей')
