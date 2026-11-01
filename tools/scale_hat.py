#!/usr/bin/env python3
"""ChatGPT sometimes draws the hat a bit smaller than the bald head (the skull peeks out around the hat).
Scale the whole hair_hat picture up around a point near the brim, on its green background, before the import.

  python3 tools/scale_hat.py from_chatgpt/mark/hair_hat.png 1.08 [cx cy]   (default centre 512 560)
The original is kept as <name>.unscaled.png (always the starting point, so running it again does not add up)."""
import os
import sys

from PIL import Image

p, k = sys.argv[1], float(sys.argv[2])
cx, cy = (float(sys.argv[3]), float(sys.argv[4])) if len(sys.argv) > 4 else (512.0, 560.0)
src = p[:-4] + ".unscaled.png"
if not os.path.exists(src):
    Image.open(p).convert("RGB").save(src)
im = Image.open(src).convert("RGB")
w, h = im.size
big = im.resize((round(w * k), round(h * k)), Image.LANCZOS)
out = Image.new("RGB", (w, h), (0, 255, 0))
out.paste(big, (round(cx - cx * k), round(cy - cy * k)))
out.save(p)
print(p, "scaled", k, "around", (cx, cy))
