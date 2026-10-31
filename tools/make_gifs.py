#!/usr/bin/env python3
"""previews/_gif/<anim>/*.png  ->  previews/<anim>.gif (20 fps)"""
import glob, os
from PIL import Image
root = os.path.join(os.path.dirname(__file__), "..", "previews")
for d in sorted(glob.glob(os.path.join(root, "_gif", "*"))):
    frames = [Image.open(f).convert("RGB") for f in sorted(glob.glob(d + "/*.png"))]
    if frames:
        pal = [f.quantize(colors=128, method=Image.MEDIANCUT) for f in frames]
        pal[0].save(os.path.join(root, os.path.basename(d) + ".gif"), save_all=True, append_images=pal[1:], duration=50, loop=0)
print("gifs ok")
