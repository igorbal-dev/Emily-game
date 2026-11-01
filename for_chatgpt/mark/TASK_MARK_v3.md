# Task (v3): Mark's head for a 2D game puppet — EDIT `mark_face.png`, do not redraw

`mark_face.png` IS Mark. Every image below is an **edit of that picture**: same face, same proportions,
same painting style, same colours. Do not invent a new baby face.

The previous attempt went wrong in these ways. Please avoid them:
- the face became a younger, rounder baby face with **smaller eyes** → keep the eyes as **big** as in `mark_face.png`;
- the nose became **upturned with visible nostrils**, so from far away it looked like **two noses** →
  the nose is a **small soft rounded button, seen straight from the front, NO nostril holes, no dark spots under it**;
- the hair became pale platinum → keep the **warm golden-honey blond** of `mark_face.png`;
- in the hat picture, curls hung down **over the eyes and nose** → under the hat, curls only at the **sides** and a little fringe
  that ends **above the eyebrows**.

## Attached files
| File | What it is |
|---|---|
| `mark_face.png` | **Mark himself. Source for every step.** |
| `mark_sheet_1.png`, `mark_idle.png` | More views of him (only for checking colours/character). |
| `mark_hat.png` | His navy knitted pom-pom hat (step 5). |
| `guide_head.png` | Where the head goes on the 1024×1024 canvas (grey shape = bald head). Only for reading. |
| `template_eyes_sheet.png`, `template_mouth_sheet.png` | 1536×1024, 3×2 grid: where the six heads go. |

## Rules for every image
1. Canvas exactly 1024×1024 (steps 1, 4, 5) or 1536×1024 (steps 2, 3). Background **flat pure green #00FF00**, no shadow, no text.
2. Front view, head straight. Ears visible. **Nothing below the chin** (no neck).
3. Head size and place like the grey shape in `guide_head.png`: top of the skull at y≈290, ear to ear ≈420 px, centred.
   Scale **uniformly** (never wider or taller than in `mark_face.png`).
4. Make the images **one at a time**, one per answer. Before each answer, put it next to `mark_face.png` and check:
   same eyes (big, blue, long lashes), same small button nose without nostrils, same thin pink smile, same skin.

## Steps (5 images)
1. **`head_base.png`** — `mark_face.png` with **all hair removed** (smooth bald skull like a doll head), neck removed, placed by rule 3.
   Eyes, brows, nose, mouth, cheeks and ears exactly as in `mark_face.png`.
2. **`eyes_sheet.png`** (3×2 grid as in `template_eyes_sheet.png`): six **exact copies of `head_base.png`**, same size and same place
   inside each cell. **Only the eyes and eyebrows change** — nose, mouth, cheeks, ears stay pixel-identical:
   1 open (unchanged) · 2 half-closed (sleepy) · 3 closed (calm lines with lashes) · 4 happy (smiling arcs ^ ^) ·
   5 surprised (eyes wide, brows high) · 6 sad (inner ends of the brows up).
3. **`mouth_sheet.png`** (3×2 grid as in `template_mouth_sheet.png`): six **exact copies of `head_base.png`**, same size and place.
   **Only the mouth changes**, it stays **between the nose and the chin**; the nose must not move or change:
   1 smile (unchanged) · 2 "a" (open, babbling) · 3 "o" (small round) · 4 "e" (wide, two tiny top teeth) · 5 "m" (lips pressed) ·
   6 laugh (big open, tongue).
4. **`hair_curls.png`** — the hair of `mark_face.png` (thick golden-honey loose curls, hairline high, forehead open), at the **same size
   and place as on `head_base.png`**. Everything that is not hair (face, ears) becomes **flat grey #BEBEBE**; the background stays green.
   Hair must be **fully opaque** (no see-through strands over the grey).
5. **`hair_hat.png`** — like step 4, plus the navy knitted pom-pom hat from `mark_hat.png` pulled onto the head: the hat covers the top of the
   head down to the middle of the forehead; golden curls peek out **only at the sides** (over the ears) and a short fringe **above the brows**.
   Hat fully opaque, no green or grey inside the knit or the pom-pom.

Give the 5 PNGs with exactly these names.
