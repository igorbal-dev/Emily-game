#!/usr/bin/env python3
"""Абиха для игры: берёт нарезку листа 1 (tools/cut_abiha.py) и делает картинки героя.

    python3 tools/abiha_game.py

- Все позы одного наряда ложатся на общий холст (ноги внизу по центру, один масштаб), чтобы при смене
  позы Абиха не прыгала и не меняла рост. Рост = рост Эмили на сцене (h: 1 в js/talk.js).
- blink (глаза закрыты) и mouth1/mouth2 (рот открыт) — к позе idle приклеиваются глаза и рты с листа
  (ряд 2), уменьшенные по расстоянию между зрачками, с мягким краем и подгонкой цвета кожи.
- Наряды: '' — футболка и фиолетовые штаны (в помещении), out — розовая зимняя куртка (на улице).
Результат: assets/img/abiha_*.webp и ключи в art/talk_img.json (abiha_idle, abiha_idle_out, ...)."""
import json, os, hashlib
import numpy as np
from PIL import Image, ImageFilter

CUT = 'art_source/abiha/cut/sheet1/'
# позы с листа 1 → имя в игре
POSES = {'idle': 'idle', 'wave': 'wave', 'cross': 'arms_crossed', 'peace': 'peace', 'walk': 'walk',
         'walkf': 'walk_front', 'run': 'run', 'jump': 'jump', 'think': 'sit_chin', 'sit': 'sit',
         'laugh': 'jump'}
# лица на позе idle: (глаза или None, рот или None)
FACES = {'blink': ('eyes_3', None), 'mouth1': (None, 'mouth_2'), 'mouth2': (None, 'mouth_4')}
# где на позе глаза (зрачки) и рот, в пикселях картинки
SPOTS = {'idle': ((53.3, 91.7), (85.0, 91.7), (68.3, 113.3)),
         'outfit_winter': ((54.2, 88.3), (85.0, 88.3), (69.2, 107.5))}


def load(n): return Image.open(CUT + f'abiha_{n}.png').convert('RGBA')


def pupils(strip):
    """центры двух зрачков на полоске глаз: самые тёмные пятна в левой и правой половине"""
    a = np.asarray(strip).astype(float); lum = a[..., :3].mean(2); al = a[..., 3]
    out = []
    for lo, hi in ((0, strip.width//2), (strip.width//2, strip.width)):
        part = np.where(al[:, lo:hi] > 200, lum[:, lo:hi], 999)
        thr = np.percentile(part[part < 999], 6)
        ys, xs = np.where(part <= thr)
        out.append((xs.mean() + lo, ys.mean()))
    return out


def paste_feature(base, feat, center, scale, rx, ry):
    """приклеить кусок лица: масштаб, центр, мягкий эллипс rx×ry (доли размера куска), подгонка тона кожи"""
    f = feat.resize((max(1, round(feat.width*scale)), max(1, round(feat.height*scale))), Image.LANCZOS)
    fa = np.asarray(f).astype(float)
    h, w = fa.shape[:2]
    yy, xx = np.mgrid[0:h, 0:w]
    e = ((xx - w/2)/(w*rx/2))**2 + ((yy - h/2)/(h*ry/2))**2
    m = np.clip((1.0 - e)/0.35, 0, 1)*(fa[..., 3]/255)
    x0, y0 = round(center[0] - w/2), round(center[1] - h/2)
    b = np.asarray(base).astype(float).copy()
    reg = b[y0:y0 + h, x0:x0 + w]
    # тон кожи: средний цвет края куска против цвета под ним
    ring = (e > 0.3) & (e < 1.0) & (fa[..., 3] > 200) & (reg[..., :3].mean(2) > 140) & (fa[..., :3].mean(2) > 140)
    if ring.sum() > 10:
        gain = np.median(reg[..., :3][ring], 0)/np.maximum(np.median(fa[..., :3][ring], 0), 1)
        fa[..., :3] = np.clip(fa[..., :3]*gain, 0, 255)
    reg[..., :3] = reg[..., :3]*(1 - m[..., None]) + fa[..., :3]*m[..., None]
    b[y0:y0 + h, x0:x0 + w] = reg
    return Image.fromarray(b.astype(np.uint8), 'RGBA')


def faces(base, spot):
    (lx, ly), (rx_, ry_), mouth = SPOTS[spot]
    d = rx_ - lx
    ref = pupils(load('eyes_1')); sd = ref[1][0] - ref[0][0]; s = d/sd
    out = {}
    for name, (eyes, mo) in FACES.items():
        im = base
        if eyes:
            strip = load(eyes)
            # центр полоски ставим так, чтобы её зрачки (по открытым глазам) легли на зрачки позы
            cx = (lx + rx_)/2 - ((ref[0][0] + ref[1][0])/2 - strip.width/2)*s
            cy = ly - ((ref[0][1] + ref[1][1])/2 - strip.height/2)*s
            im = paste_feature(im, strip, (cx, cy), s, 0.86, 0.72)
        if mo:
            im = paste_feature(im, load(mo), mouth, s, 0.72, 0.7)
        out[name] = im
    return out


def canvas(imgs):
    """общий холст: ширина — самая широкая поза, высота — самая высокая, ноги внизу по центру"""
    W = max(i.width for i in imgs.values()); H = max(i.height for i in imgs.values())
    res = {}
    for k, i in imgs.items():
        c = Image.new('RGBA', (W, H)); c.alpha_composite(i, ((W - i.width)//2, H - i.height)); res[k] = c
    return res


def save(imgs, suffix, table):
    os.makedirs('assets/img', exist_ok=True)
    for k, im in imgs.items():
        tmp = '/tmp/abiha_tmp.webp'; im.save(tmp, 'WEBP', quality=88, method=6)
        h = hashlib.sha1(open(tmp, 'rb').read()).hexdigest()[:12]
        dst = f'assets/img/{h}.webp'; os.replace(tmp, dst)
        key = f'abiha_{k}{suffix}'
        old = table.get(key)
        if old and old[0] != dst and os.path.exists(old[0]): os.remove(old[0])
        table[key] = [dst, im.width, im.height]


def main():
    table = json.load(open('art/talk_img.json'))
    # в помещении: позы листа 1
    base = {k: load(v) for k, v in POSES.items()}
    base.update(faces(base['idle'], 'idle'))
    base = canvas(base)
    save(base, '', table)
    # на улице: зимняя куртка (пока одна поза; остальные позы — после листа ABIHA_TASK.md)
    w = load('outfit_winter')
    k = 361/w.height*1.04            # ряд нарядов нарисован мельче поз; шапка выше хвостика
    w = w.resize((round(w.width*k), round(w.height*k)), Image.LANCZOS)
    for p in SPOTS['outfit_winter']: pass
    SPOTS['outfit_winter'] = tuple((x*k, y*k) for x, y in SPOTS['outfit_winter'])
    out = {'idle': w}; out.update(faces(w, 'outfit_winter'))
    out = canvas(out)
    save(out, '_out', table)
    # других поз в куртке пока нет (заказ — for_chatgpt/ABIHA_TASK.md): ближайшая — стоит в куртке
    for p in POSES:
        if p != 'idle': table[f'abiha_{p}_out'] = table['abiha_idle_out']
    json.dump(table, open('art/talk_img.json', 'w'), ensure_ascii=False, indent=1)
    # проверка: все картинки рядом
    allimg = [(k, v) for k, v in list(base.items()) + [(k + '_out', v) for k, v in out.items()]]
    th = 260; sheet = Image.new('RGB', (len(allimg)*th//2 + th, 2*th), (130, 195, 130))
    for i, (k, im) in enumerate(allimg):
        t = im.copy(); t.thumbnail((th - 10, th - 10)); sheet.paste(t, ((i % ((len(allimg) + 1)//2))*th, (i//((len(allimg) + 1)//2))*th), t)
    sheet.save('art_source/abiha/game_contact.jpg', quality=85)
    print('готово:', ', '.join(k for k, _ in allimg))


if __name__ == '__main__':
    main()
