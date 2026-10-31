"""Shared head layout for Emily's puppet head.

All numbers are in TEMPLATE space: a 1024x1024 canvas (the size ChatGPT draws at).
The game uses the same canvas downscaled to 512x512 (GAME_CANVAS), so game
coordinates are template coordinates / 2.

The head bone pivot (where the head rotates on the neck) is PIVOT.
"""

TEMPLATE = 1024
GAME_CANVAS = 512
K = GAME_CANVAS / TEMPLATE  # template -> game texture pixels

# Head silhouette (bald head, front view), built from ellipses: (cx, cy, rx, ry)
CRANIUM = (512, 482, 192, 192)       # top of head at y=290
JAW = (512, 566, 178, 146)           # chin at y=712
EAR_L = (328, 580, 30, 44)           # ear on the left side of the image
EAR_R = (696, 580, 30, 44)
NECK = (466, 690, 558, 790)          # neck stub rectangle x0,y0,x1,y1 (guide only)

HEAD_TOP = 290
CHIN = 712
PIVOT = (512, 694)                   # head bone pivot (top of neck, behind the chin)

EYE_LINE = 535
EYE_L = (437, 535)                   # centre of the eye on the left side of the image
EYE_R = (587, 535)
NOSE = (512, 603)
MOUTH = (512, 660)

# Swappable feature zones (x, y, w, h). Eyes zone includes eyebrows.
EYES_ZONE = (352, 446, 320, 148)
MOUTH_ZONE = (440, 624, 144, 78)

# Expression lists (order = order of cells in the ChatGPT sheets, left->right, top->bottom)
EYES = ["open", "half", "closed", "happy", "surprised", "sad"]
MOUTHS = ["smile", "a", "o", "e", "m", "laugh"]

# Hairstyles (same order as in the web game)
HAIRS = [
    ("pigtails", "two high pigtails with pink scrunchies"),
    ("ponytail", "half-up hair: a small ponytail on top with a pink scrunchie, the rest loose and curly"),
    ("braids", "two braids hanging down in front of the shoulders, small pink ties"),
    ("headband", "long loose curly hair with a pink headband"),
    ("bun", "one big messy bun on top of the head"),
    ("stars", "two pigtails held by small yellow star hair clips"),
    ("flowers", "long loose curly hair with a crown of small pastel flowers"),
    ("cap", "a pink baseball cap with a small light-blue heart, hair loose under it"),
]

# Sheet layout: 1536x1024, 3 columns x 2 rows of 512x512 cells, head at scale 0.5
SHEET_W, SHEET_H, CELL = 1536, 1024, 512
SHEET_SCALE = 0.5


def cell_origin(i):
    return ((i % 3) * CELL, (i // 3) * CELL)


def zone_game(z):
    return [round(v * K) for v in z]


def layout_json():
    return {
        "canvas": GAME_CANVAS,
        "pivot": [PIVOT[0] * K, PIVOT[1] * K],
        "eyes_rect": zone_game(EYES_ZONE),
        "mouth_rect": zone_game(MOUTH_ZONE),
        "head_top": HEAD_TOP * K,
        "chin": CHIN * K,
        "eyes": EYES,
        "mouths": MOUTHS,
        "hairs": [h[0] for h in HAIRS],
    }
