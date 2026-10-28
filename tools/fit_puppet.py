"""Подгоняет раскрашенные части под шаблон и собирает куклу.

    python3 tools/fit_puppet.py emily P1 P2

Каждая раскрашенная часть масштабируется так, чтобы её высота совпала с серой формой
шаблона, и ставится по центру формы. Суставы берутся из шаблона (art/rigs/<имя>_t.json).
Результат: art/puppets/<имя>/<часть>.png и art/puppets/<имя>/puppet.json
(точка поворота и суставы в пикселях подогнанной картинки, наклейки лица)."""
import sys, json, os, math
import numpy as np
from PIL import Image

name, body_sheet, face_sheet = sys.argv[1], sys.argv[2], sys.argv[3]
rig = json.load(open(f'art/rigs/{name}_t.json'))
tpl = Image.open(f'art/templates/{name}_template.png').convert('RGB')
cols, rows = rig['grid']
cw, ch = tpl.width//cols, tpl.height//rows
out = f'art/puppets/{name}'
os.makedirs(out, exist_ok=True)

def alpha_bbox(im):
    a = np.asarray(im.getchannel('A')) > 40
    ys, xs = np.where(a)
    return xs.min(), ys.min(), xs.max() + 1, ys.max() + 1

def tpl_bbox(cell):
    """серая форма шаблона в своей ячейке: рамка в координатах части (как в rig size)"""
    r, c = (cell - 1)//cols, (cell - 1) % cols
    box = np.asarray(tpl.crop((c*cw, r*ch, (c + 1)*cw, (r + 1)*ch))).astype(int)
    m = (box.sum(2) < 700)
    ys, xs = np.where(m)
    return xs.min() + c*cw, ys.min() + r*ch, xs.max() + 1 + c*cw, ys.max() + 1 + r*ch

puppet = {'name': name, 'parts': {}, 'face': {}}
for pname, info in rig['parts'].items():
    painted = Image.open(f'art/parts/{body_sheet}/{info["cell"]}.png').convert('RGBA')
    px0, py0, px1, py1 = alpha_bbox(painted)
    painted = painted.crop((px0, py0, px1, py1))
    # где форма лежит внутри картинки части в шаблоне
    sw, sh = info['size']
    r, c = (info['cell'] - 1)//cols, (info['cell'] - 1) % cols
    ox, oy = c*cw + (cw - sw)//2, r*ch + (ch - sh)//2          # левый верх картинки части на листе
    tx0, ty0, tx1, ty1 = tpl_bbox(info['cell'])
    tx0, ty0, tx1, ty1 = tx0 - ox, ty0 - oy, tx1 - ox, ty1 - oy  # рамка формы в координатах части
    k = (ty1 - ty0)/painted.height
    nw, nh = max(1, round(painted.width*k)), max(1, round(painted.height*k))
    fitted = painted.resize((nw, nh), Image.LANCZOS)
    # новая картинка: рамка формы по центру по горизонтали, верх по верху формы
    left = (tx0 + tx1)/2 - nw/2
    # сдвиг всех суставов в координаты подогнанной картинки
    joints = {j: [round(float(x - left), 1), round(float(y - ty0), 1)] for j, (x, y) in info['joints'].items()}
    fitted.save(f'{out}/{pname}.png')
    at = info['at']
    puppet['parts'][pname] = {'src': f'{pname}.png', 'size': [nw, nh], 'z': info['z'], 'parent': info['parent'],
                              'at': at, 'rot': info['rot'], 'joints': joints}
# для хвостиков сустав на голове задан точкой в координатах шаблонной головы — переводим так же
head_shift = None
hinfo = rig['parts']['head']
for pname, p in puppet['parts'].items():
    if isinstance(p['at'], list):
        par = puppet['parts'][p['parent']]
        # смещение: шаблонная точка (x,y) -> координаты подогнанной головы через сдвиг её pivot
        tpx, tpy = rig['parts'][p['parent']]['joints']['pivot']
        fpx, fpy = par['joints']['pivot']
        p['at'] = [round(float(p['at'][0] - tpx + fpx), 1), round(float(p['at'][1] - tpy + fpy), 1)]

# наклейки лица: глаза 1..4, рты 5..8
FACE = {'eyes': ['open', 'half', 'closed', 'happy'], 'mouth': ['smile', 'talk', 'laugh', 'o']}
for i, (kind, names) in enumerate(FACE.items()):
    for j, n in enumerate(names):
        im = Image.open(f'art/parts/{face_sheet}/{i*4 + j + 1}.png').convert('RGBA')
        im.save(f'{out}/{kind}_{n}.png')
        puppet['face'][f'{kind}_{n}'] = {'src': f'{kind}_{n}.png', 'size': list(im.size)}
json.dump(puppet, open(f'{out}/puppet.json', 'w'), indent=1)
print('ok', len(puppet['parts']), 'частей,', len(puppet['face']), 'наклеек')

# ---- наклейки лица: цвет кожи как на лице, мягкий край без «заплатки» ----
from PIL import ImageFilter
head = Image.open(f'{out}/head.png').convert('RGBA'); HW, HH = head.size
ha = np.asarray(head).astype(float)
reg = ha[int(HH*0.55):int(HH*0.7), int(HW*0.42):int(HW*0.58)]
skin = reg[..., :3][reg[..., 3] > 200].mean(0)
for k in puppet['face']:
    im = Image.open(f'{out}/{k}.png').convert('RGBA'); x = np.asarray(im).astype(float); al = x[..., 3]
    inner = np.asarray(Image.fromarray(al.astype(np.uint8)).filter(ImageFilter.MinFilter(25)))
    edge = (al > 200) & (inner < 200)
    x[..., :3] = np.clip(x[..., :3] + (skin - x[..., :3][edge].mean(0)), 0, 255)
    m = Image.fromarray(al.astype(np.uint8)).filter(ImageFilter.MinFilter(21)).filter(ImageFilter.GaussianBlur(14))
    x[..., 3] = np.minimum(al, np.asarray(m).astype(float))
    Image.fromarray(x.astype(np.uint8)).save(f'{out}/{k}.png')

# ---- настройки куклы, подобранные на глаз (tools/puppet_preview.py) ----
TUNE = json.load(open(f'art/rigs/{name}_tune.json')) if os.path.exists(f'art/rigs/{name}_tune.json') else {}
for pn, v in TUNE.get('parts', {}).items(): puppet['parts'][pn].update(v)
if 'faceAnchor' in TUNE: puppet['faceAnchor'] = TUNE['faceAnchor']
json.dump(puppet, open(f'{out}/puppet.json', 'w'), indent=1)
print('наклейки и настройки готовы')
