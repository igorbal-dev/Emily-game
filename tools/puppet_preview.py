"""Собирает куклу из art/puppets/<имя> и рисует позы (так же будет собирать игра).
python3 tools/puppet_preview.py emily out.jpg"""
import sys, json, math
from PIL import Image

name, outp = sys.argv[1], sys.argv[2]
base = f'art/puppets/{name}'
P = json.load(open(f'{base}/puppet.json'))
img = {k: Image.open(f'{base}/{v["src"]}').convert('RGBA') for k, v in P['parts'].items()}
face = {k: Image.open(f'{base}/{v["src"]}').convert('RGBA') for k, v in P['face'].items()}
FA = P.get('faceAnchor', {'eyes': [0.5, 0.5, 0.5], 'mouth': [0.5, 0.7, 0.3]})

def head_with_face(eyes, mouth):
    h = img['head'].copy(); W, H = h.size
    for kind, key in (('eyes', eyes), ('mouth', mouth)):
        cx, cy, w = FA[kind]; st = face[f'{kind}_{key}']
        k = w*W/st.width; s = st.resize((round(st.width*k), round(st.height*k)), Image.LANCZOS)
        h.alpha_composite(s, (round(cx*W - s.width/2), round(cy*H - s.height/2)))
    return h

def assemble(pose, eyes='open', mouth='smile', size=(700, 1000), root=(350, 470)):
    images = dict(img); images['head'] = head_with_face(eyes, mouth)
    out = Image.new('RGBA', size, (0, 0, 0, 0)); W = {}
    def place(p):
        if p in W: return W[p]
        info = P['parts'][p]; rot = info['rot'] + pose.get(p, 0)
        if info['parent']:
            prot, ppos = place(info['parent']); pi = P['parts'][info['parent']]
            jx, jy = pi['joints'][info['at']] if isinstance(info['at'], str) else info['at']
            px, py = pi['joints']['pivot']; a = math.radians(prot); dx, dy = jx - px, jy - py
            pos = (ppos[0] + dx*math.cos(a) - dy*math.sin(a), ppos[1] + dx*math.sin(a) + dy*math.cos(a)); rot += prot
        else: pos = root
        W[p] = (rot, pos); return W[p]
    for p in sorted(P['parts'], key=lambda p: P['parts'][p]['z']):
        rot, (x, y) = place(p); im = images[p]; px, py = P['parts'][p]['joints']['pivot']
        S = 3*max(im.size); big = Image.new('RGBA', (S, S), (0, 0, 0, 0))
        big.alpha_composite(im, (round(S/2 - px), round(S/2 - py)))
        big = big.rotate(-rot, resample=Image.BICUBIC, center=(S/2, S/2))
        out.alpha_composite(big, (round(x - S/2), round(y - S/2)))
    return out

POSES = [({}, 'open', 'smile'), ({'uarmR': -150, 'farmR': -30, 'tailL': 8, 'tailR': -4, 'head': -4}, 'happy', 'laugh'),
         ({'thighL': 18, 'shinL': -8, 'thighR': -16, 'shinR': 14, 'uarmL': -16, 'uarmR': 16, 'farmL': -10, 'farmR': -10}, 'open', 'talk'),
         ({'uarmL': -28, 'uarmR': 28, 'farmL': -60, 'farmR': 60, 'head': 5}, 'half', 'o')]
if __name__ == '__main__':
    ref = Image.open(f'assets/sprites/{name}_idle.png').convert('RGBA')
    sheet = Image.new('RGB', (700*len(POSES) + 360, 1000), (236, 240, 248))
    r = ref.copy(); r.thumbnail((340, 900)); sheet.paste(r, (10, 960 - r.height), r)
    for i, (pose, e, m) in enumerate(POSES):
        g = assemble(pose, e, m); sheet.paste(g, (360 + i*700, 0), g)
    sheet.save(outp, quality=85)
