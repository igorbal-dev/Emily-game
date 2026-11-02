"""Собирает героя из частей по art/rigs/<имя>.json и рисует превью нескольких поз.
python3 tools/rig_preview.py emily out.jpg"""
import sys, json, math
import numpy as np
from PIL import Image, ImageDraw

rig = json.load(open(f'art/rigs/{sys.argv[1]}.json'))
P = rig['parts']
imgs = {k: Image.open(f"art/parts/{v['src']}.png").convert('RGBA') for k, v in P.items()}

def M_t(x, y): return np.array([[1, 0, x], [0, 1, y], [0, 0, 1.0]])
def M_r(deg):
    a = math.radians(deg); c, s = math.cos(a), math.sin(a)
    return np.array([[c, -s, 0], [s, c, 0], [0, 0, 1.0]])
def M_s(k): return np.array([[k, 0, 0], [0, k, 0], [0, 0, 1.0]])

def world(pose, root=(0, 0)):
    """матрица часть-пиксели -> экран для каждой части; масштаб у каждой части свой (не наследуется)"""
    W, ROT = {}, {}
    def get(k):
        if k in W: return W[k]
        p = P[k]; w, h = imgs[k].size
        if 'parent' in p:
            get(p['parent']); pw, ph = imgs[p['parent']].size
            x, y, _ = W[p['parent']] @ np.array([p['at'][0]*pw, p['at'][1]*ph, 1.0])
            ROT[k] = ROT[p['parent']] + p.get('rot', 0) + pose.get(k, 0)
        else:
            x, y = root; ROT[k] = p.get('rot', 0) + pose.get(k, 0) + pose.get('lean', 0)
        W[k] = M_t(x, y) @ M_r(ROT[k]) @ M_s(p['s']) @ M_t(-p['pivot'][0]*w, -p['pivot'][1]*h)
        return W[k]
    for k in P: get(k)
    return W

def render(pose, size=(420, 600), root=(210, 330), marks=False):
    out = Image.new('RGBA', size, (255, 255, 255, 0))
    W = world(pose, root)
    for k in sorted(P, key=lambda k: P[k]['z']):
        inv = np.linalg.inv(W[k])
        out.alpha_composite(imgs[k].transform(size, Image.AFFINE, tuple(inv[:2].ravel()), Image.BICUBIC))
    if marks:
        d = ImageDraw.Draw(out)
        for k in P:
            w, h = imgs[k].size; p = P[k]
            x, y, _ = W[k] @ np.array([p['pivot'][0]*w, p['pivot'][1]*h, 1])
            d.ellipse((x-3, y-3, x+3, y+3), fill=(255, 0, 0, 255))
    return out

POSES_E = {
  'rest': {},
  'wave': {'uarmR': -125, 'farmR': -40, 'tailL': 6, 'tailR': -6},
  'walk': {'thighL': 18, 'shinL': -8, 'thighR': -16, 'shinR': 14, 'uarmL': -14, 'uarmR': 14, 'head': 3},
  'reach': {'uarmL': -35, 'uarmR': 35, 'farmL': -45, 'farmR': 45},
  'talk': {'head': -4, 'uarmL': 12, 'farmL': -20, 'tailL': 8, 'tailR': 4},
}
POSES_BY = {
  'emily': POSES_E,
  'mark': {'rest': {}, 'wave': {'armR': -140}, 'walk': {'legL': 14, 'legR': -14, 'armL': -12, 'armR': 12}, 'reach': {'armL': -60, 'armR': 60}, 'tilt': {'head': 8}},
  'theo': {'rest': {}, 'wag': {'tail': 25, 'earN': 10, 'earF': 8}, 'walk': {'legFN': 22, 'legBF': 22, 'legFF': -20, 'legBN': -20, 'head': -4}, 'bark': {'head': -12, 'earN': -15}, 'pant': {'head': 5}},
}
if __name__ == '__main__':
    POSES = POSES_BY[rig['name']]
    marks = '--marks' in sys.argv
    sheet = Image.new('RGB', (420*len(POSES), 600), (235, 238, 245))
    ref = Image.open(f'assets/sprites/{rig["name"]}_' + ('run' if rig['name'] == 'theo' else 'idle') + '.png').convert('RGBA')
    for i, (n, pose) in enumerate(POSES.items()):
        im = render(pose, marks=marks)
        sheet.paste(im, (i*420, 0), im)
    if ref:
        r = ref.copy(); r.thumbnail((rig['height'], rig['height']))
        r2 = Image.new('RGB', (r.width + 20, 600), (255, 245, 235)); r2.paste(r, (10, 600 - r.height - 40), r)
        full = Image.new('RGB', (sheet.width + r2.width, 600)); full.paste(r2, (0, 0)); full.paste(sheet, (r2.width, 0)); sheet = full
    d = ImageDraw.Draw(sheet)
    sheet.save(sys.argv[2], quality=85)
