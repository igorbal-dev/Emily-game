# Task (v3): Mark's head (baby, ~1 year old) for a 2D game puppet

Mark is a **baby boy about 1 year old** (in the game he is the youngest: he toddles, babbles, falls on his bottom).
`mark_face.png` shows who he is: **his colouring, his blue eyes, his golden curls, the painting style**. Keep all of that,
but make sure he reads as a **one-year-old**:
- head a soft round oval, **chubby round cheeks**, small soft chin, high round forehead (babies have big foreheads);
- **big round blue eyes** set wide apart, like in `mark_face.png` (do NOT make them small), light thin brows;
- **tiny button nose**: a small soft rounded bump, seen straight from the front, **NO nostril holes, no dark spots, not upturned**;
- small soft mouth, pink lips;
- hair: **soft, light baby curls** — warm golden-honey blond like `mark_face.png` (NOT pale platinum, NOT orange), a bit shorter
  and softer than in the reference, forehead open.

The previous attempt was almost right in age, but these things went wrong — avoid them:
- the nose was **upturned with visible nostrils**, so from far away it looked like **two noses**;
- the **eyes became small** — keep them big;
- the hair became **pale platinum** — keep it warm golden;
- in the hat picture, curls hung down **over the eyes and nose** — under the hat, curls only at the **sides** and a short fringe
  **above the eyebrows**.

## Attached files
| File | What it is |
|---|---|
| `mark_face.png` | **Mark himself** (colours, eyes, curls, style). Make him look about 1 year old. |
| `mark_sheet_1.png`, `mark_idle.png` | More views of him (only for checking colours/character). |
| `mark_hat.png` | His navy knitted pom-pom hat (step 5). |
| `guide_head.png` | Where the head goes on the 1024×1024 canvas (grey shape = bald head). Only for reading. |
| `template_eyes_sheet.png`, `template_mouth_sheet.png` | 1536×1024, 3×2 grid: where the six heads go. |

## Rules for every image
1. Canvas exactly 1024×1024 (steps 1, 4, 5) or 1536×1024 (steps 2, 3). Background **flat pure green #00FF00**, no shadow, no text.
2. Front view, head straight. Ears visible. **Nothing below the chin** (no neck).
3. Head size and place like the grey shape in `guide_head.png`: top of the skull at y≈290, ear to ear ≈420 px, centred.
   Scale **uniformly** (never wider or taller than in `mark_face.png`).
4. Make the images **one at a time**, one per answer. Before each answer check: a one-year-old baby face, big blue eyes,
   tiny button nose **without nostrils**, golden curls, same skin and style as `mark_face.png`.

## Steps (5 images)
1. **`head_base.png`** — baby Mark's face (as described above) with **all hair removed** (smooth bald skull like a doll head),
   no neck, placed by rule 3. **All the next images are copies of this one** — draw it carefully.
2. **`eyes_sheet.png`** (3×2 grid as in `template_eyes_sheet.png`): six **exact copies of `head_base.png`**, same size and same place
   inside each cell. **Only the eyes and eyebrows change** — nose, mouth, cheeks, ears stay pixel-identical:
   1 open (unchanged) · 2 half-closed (sleepy) · 3 closed (calm lines with lashes) · 4 happy (smiling arcs ^ ^) ·
   5 surprised (eyes wide, brows high) · 6 sad (inner ends of the brows up).
3. **`mouth_sheet.png`** (3×2 grid as in `template_mouth_sheet.png`): six **exact copies of `head_base.png`**, same size and place.
   **Only the mouth changes**, it stays **between the nose and the chin**; the nose must not move or change:
   1 smile (unchanged) · 2 "a" (open, babbling) · 3 "o" (small round) · 4 "e" (wide, two tiny top teeth) · 5 "m" (lips pressed) ·
   6 laugh (big open, tongue).
4. **`hair_curls.png`** — Mark's soft golden-honey baby curls (forehead open), at the **same size
   and place as on `head_base.png`**. Everything that is not hair (face, ears) becomes **flat grey #BEBEBE**; the background stays green.
   Hair must be **fully opaque** (no see-through strands over the grey).
5. **`hair_hat.png`** — like step 4, plus the navy knitted pom-pom hat from `mark_hat.png` pulled onto the head: the hat covers the top of the
   head down to the middle of the forehead; golden curls peek out **only at the sides** (over the ears) and a short fringe **above the brows**.
   Hat fully opaque, no green or grey inside the knit or the pom-pom.

Give the 5 PNGs with exactly these names.
