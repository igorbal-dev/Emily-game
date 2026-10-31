"""Находит «суставы» у деталей рук и ног: центр верхнего и нижнего шарика.

Запуск: python3 -I tools/find_anchors.py assets/emily/parts
Результат пишет в assets/emily/parts/anchors.json — его читает сборщик скелета в Godot.
"""
import json
import os
import sys

import numpy as np
from PIL import Image

D = sys.argv[1]
LIMBS = ["upper_arm_r", "upper_arm_l", "forearm_r", "forearm_l", "hand_r", "hand_l",
         "thigh_r", "thigh_l", "shin_r", "shin_l", "foot_r", "foot_l"]
out = {}
for name in LIMBS:
    a = np.asarray(Image.open(os.path.join(D, name + ".png")))[..., 3] > 128
    ys, xs = np.nonzero(a)
    pts = np.stack([xs + 0.5, ys + 0.5], 1).astype(float)
    c = pts.mean(0)
    cov = np.cov((pts - c).T)
    w, v = np.linalg.eigh(cov)
    axis = v[:, np.argmax(w)]
    if axis[1] < 0:          # ось смотрит вниз (от верхнего сустава к нижнему)
        axis = -axis
    perp = np.array([-axis[1], axis[0]])
    t = (pts - c) @ axis
    s = (pts - c) @ perp
    tmin, tmax = t.min(), t.max()

    def end_center(from_top, frac_r):
        # ширина детали у этого конца -> радиус шарика
        if from_top:
            band = (t > tmin + 3) & (t < tmin + 0.25 * (tmax - tmin))
        else:
            band = (t < tmax - 3) & (t > tmax - 0.25 * (tmax - tmin))
        r = (np.percentile(s[band], 95) - np.percentile(s[band], 5)) / 2 * frac_r
        sel = (t < tmin + 2 * r) if from_top else (t > tmax - 2 * r)
        p = pts[sel].mean(0)
        return [round(float(p[0]), 1), round(float(p[1]), 1)], float(r)

    top, rt = end_center(True, 1.0)
    bottom, rb = end_center(False, 1.0)
    out[name] = {"top": top, "bottom": bottom, "r_top": round(rt, 1), "r_bottom": round(rb, 1)}
    print(f"{name:12s} top={top} bottom={bottom} r=({rt:.0f},{rb:.0f})")

json.dump(out, open(os.path.join(D, "anchors.json"), "w"), indent=1)
