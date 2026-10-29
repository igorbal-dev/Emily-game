"""Шаблон-конструктор героя для ChatGPT.

Рисует серые силуэты частей точно нужного размера (лист 1536x1024, как отдаёт ChatGPT),
собранный манекен для проверки и файл риг (art/rigs/<имя>_t.json) с суставами.
Части проектируются как капсулы: конец, которым часть крепится, — круг, центр круга — сустав.
Тогда при повороте конец всегда остаётся под соседней частью и дырок нет.

    python3 tools/make_template.py emily
"""
import sys, json, math, os
from PIL import Image, ImageDraw, ImageFilter

K = 2                      # рисуем в 2 раза крупнее и уменьшаем — гладкие края
SHEET = (1536, 1024)
GREY = (176, 178, 190, 255)
name = sys.argv[1] if len(sys.argv) > 1 else 'emily'
os.makedirs('art/templates', exist_ok=True)

def canvas(w, h):
    im = Image.new('RGBA', (w*K, h*K), (0, 0, 0, 0))
    return im, ImageDraw.Draw(im)

def capsule(d, x0, y0, x1, y1, r):
    """вертикальная капсула от (x0,y0) до (x1,y1) (центры торцевых кругов), радиус r"""
    ang = math.atan2(y1 - y0, x1 - x0)
    nx, ny = -math.sin(ang)*r, math.cos(ang)*r
    d.polygon([((x0 + nx)*K, (y0 + ny)*K), ((x1 + nx)*K, (y1 + ny)*K), ((x1 - nx)*K, (y1 - ny)*K), ((x0 - nx)*K, (y0 - ny)*K)], fill=GREY)
    for (x, y) in ((x0, y0), (x1, y1)):
        d.ellipse(((x - r)*K, (y - r)*K, (x + r)*K, (y + r)*K), fill=GREY)

def ell(d, cx, cy, rx, ry):
    d.ellipse(((cx - rx)*K, (cy - ry)*K, (cx + rx)*K, (cy + ry)*K), fill=GREY)

def rrect(d, x0, y0, x1, y1, r):
    d.rounded_rectangle((x0*K, y0*K, x1*K, y1*K), r*K, fill=GREY)

def finish(im):
    w, h = im.size
    return im.resize((w//K, h//K), Image.LANCZOS)

# ---------------- Эмили ----------------
# Единица — пиксели листа. Рост собранной фигуры около 900 (больше листа: части лежат порознь).
def emily_parts():
    P = {}
    # голова вместе с волосами-шапкой (без хвостиков) и шеей; сустав шеи внизу
    im, d = canvas(270, 330)
    ell(d, 135, 140, 128, 132)             # голова с объёмом волос
    ell(d, 135, 210, 98, 80)               # щёки и подбородок
    rrect(d, 110, 240, 160, 326, 22)       # шея (уходит под футболку)
    P['head'] = (finish(im), {'pivot': (135, 304)})
    # хвостик: капля, крепится верхним кругом
    for side in ('L', 'R'):
        im, d = canvas(150, 230)
        ell(d, 75, 44, 38, 38)             # резинка и основание
        ell(d, 75, 120, 62, 82)            # пышный хвост
        ell(d, 75, 182, 44, 40)
        P['tail' + side] = (finish(im), {'pivot': (75, 44)})
    # туловище: футболка и шортики леггинсов; плечевые и тазовые круги внутри силуэта
    im, d = canvas(230, 270)
    rrect(d, 18, 20, 212, 200, 70)         # плечи, грудь и живот
    rrect(d, 28, 150, 202, 262, 46)        # бёдра (верх леггинсов)
    P['torso'] = (finish(im), {'pivot': (115, 150), 'neck': (115, 26), 'shoulderL': (40, 66), 'shoulderR': (190, 66), 'hipL': (78, 226), 'hipR': (152, 226)})
    # плечо (с рукавом), предплечье с кистью
    for side in ('L', 'R'):
        im, d = canvas(76, 170)
        capsule(d, 38, 38, 38, 128, 31)
        P['uarm' + side] = (finish(im), {'pivot': (38, 38), 'elbow': (38, 128)})
        im, d = canvas(72, 180)
        capsule(d, 36, 30, 36, 105, 26)
        ell(d, 36, 138, 30, 36)            # кисть
        P['farm' + side] = (finish(im), {'pivot': (36, 30)})
    # бедро, голень со ступнёй (ступня смотрит вперёд и чуть наружу)
    for side, fx in (('L', -10), ('R', 10)):
        im, d = canvas(96, 200)
        capsule(d, 48, 44, 48, 156, 40)
        P['thigh' + side] = (finish(im), {'pivot': (48, 44), 'knee': (48, 156)})
        im, d = canvas(130, 240)
        capsule(d, 65, 36, 65, 176, 34)
        ell(d, 65 + fx, 200, 50, 32)       # ступня в носочке
        P['shin' + side] = (finish(im), {'pivot': (65, 36)})
    return P

LAYOUT = {   # ячейки 4x3: какая часть где лежит на листе
    'emily': [['head', 'tailL', 'tailR', 'torso'],
              ['uarmL', 'uarmR', 'farmL', 'farmR'],
              ['thighL', 'thighR', 'shinL', 'shinR']],
}
RIG = {      # кто к кому крепится: часть -> (родитель, сустав родителя), порядок слоёв (z)
    'emily': {
        'torso': (None, None, 50), 'head': ('torso', 'neck', 80),
        'tailL': ('head', (22, 120), 20), 'tailR': ('head', (248, 120), 20),
        'uarmL': ('torso', 'shoulderL', 40), 'uarmR': ('torso', 'shoulderR', 40),
        'farmL': ('uarmL', 'elbow', 85), 'farmR': ('uarmR', 'elbow', 85),
        'thighL': ('torso', 'hipL', 30), 'thighR': ('torso', 'hipR', 30),
        'shinL': ('thighL', 'knee', 25), 'shinR': ('thighR', 'knee', 25),
    }
}
REST_ROT = {'uarmL': 8, 'uarmR': -8, 'farmL': -6, 'farmR': 6, 'tailL': 16, 'tailR': -16}

parts = {'emily': emily_parts}[name]()
layout = LAYOUT[name]
rows, cols = len(layout), len(layout[0])
cw, ch = SHEET[0]//cols, SHEET[1]//rows
sheet = Image.new('RGBA', SHEET, (255, 255, 255, 255))
rig = {'name': name, 'sheet': list(SHEET), 'grid': [cols, rows], 'parts': {}}
for r, row in enumerate(layout):
    for c, pname in enumerate(row):
        im, joints = parts[pname]
        assert im.width <= cw - 20 and im.height <= ch - 10, (pname, im.size, (cw, ch))
        x, y = c*cw + (cw - im.width)//2, r*ch + (ch - im.height)//2
        sheet.alpha_composite(im, (x, y))
        parent, at, z = RIG[name][pname]
        rig['parts'][pname] = {'cell': r*cols + c + 1, 'size': list(im.size), 'z': z,
                               'joints': {k: list(v) for k, v in joints.items()},
                               'parent': parent, 'at': at if isinstance(at, str) or at is None else list(at),
                               'rot': REST_ROT.get(pname, 0)}
sheet.convert('RGB').save(f'art/templates/{name}_template.png')
json.dump(rig, open(f'art/rigs/{name}_t.json', 'w'), indent=1)

# собранный манекен — по тем же суставам; так же будет собирать игра
def assemble(images, pose, size=(700, 1000), root=(350, 470)):
    out = Image.new('RGBA', size, (0, 0, 0, 0))
    W = {}
    def place(p):
        if p in W: return W[p]
        info = rig['parts'][p]
        rot = info['rot'] + pose.get(p, 0)
        if info['parent']:
            prot, ppos = place(info['parent'])
            pi = rig['parts'][info['parent']]
            jx, jy = pi['joints'][info['at']] if isinstance(info['at'], str) else info['at']
            px, py = pi['joints']['pivot']
            a = math.radians(prot)
            dx, dy = jx - px, jy - py
            pos = (ppos[0] + dx*math.cos(a) - dy*math.sin(a), ppos[1] + dx*math.sin(a) + dy*math.cos(a))
            rot += prot
        else:
            pos = root
        W[p] = (rot, pos)
        return W[p]
    for p in sorted(rig['parts'], key=lambda p: rig['parts'][p]['z']):
        rot, (x, y) = place(p)
        im = images[p]; px, py = rig['parts'][p]['joints']['pivot']
        big = Image.new('RGBA', (im.width*3, im.height*3), (0, 0, 0, 0))
        big.alpha_composite(im, (im.width*3//2 - px, im.height*3//2 - py))
        big = big.rotate(-rot, resample=Image.BICUBIC, center=(im.width*3//2, im.height*3//2))
        out.alpha_composite(big, (int(x - im.width*3//2), int(y - im.height*3//2)))
    return out

if __name__ == '__main__':
    shaded = {}
    for p, (im, _) in parts.items():   # каждой части свой оттенок, чтобы были видны стыки
        h = (hash(p) % 40) - 20
        tint = Image.new('RGBA', im.size, (150 + h, 160, 185 - h, 255))
        tint.putalpha(im.getchannel('A'))
        edge = im.getchannel('A').filter(ImageFilter.FIND_EDGES)
        line = Image.new('RGBA', im.size, (70, 70, 90, 255)); line.putalpha(edge)
        tint.alpha_composite(line)
        shaded[p] = tint
    poses = [{}, {'uarmR': -150, 'farmR': -30, 'tailL': 8},
             {'thighL': 20, 'shinL': -10, 'thighR': -18, 'shinR': 16, 'uarmL': -16, 'uarmR': 16},
             {'uarmL': -30, 'uarmR': 30, 'farmL': -70, 'farmR': 70, 'head': -6}]
    guide = Image.new('RGB', (700*len(poses), 1000), (255, 255, 255))
    for i, pose in enumerate(poses):
        g = assemble(shaded, pose); guide.paste(g, (i*700, 0), g)
    guide.save(f'art/templates/{name}_guide.png')
    plain = assemble({p: im for p, (im, _) in parts.items()}, {})
    pg = Image.new('RGB', plain.size, 'white'); pg.paste(plain, (0, 0), plain)
    pg.save(f'art/templates/{name}_assembled.png')
    print('ok')
