# Task (v2): Mark's head, faces and hair — EDIT the reference, do not redraw

The first version drew Mark anew and he stopped looking like himself (rounder, wider face, smaller eyes,
orange hair low on the forehead). This time **edit `mark_face.png` itself**: it IS Mark. Keep his face
pixel-faithful; change only what each step asks.

## Attached files
| File | What it is |
|---|---|
| `mark_face.png` | **Mark himself. The source image for every step.** |
| `mark_sheet_1.png`, `mark_idle.png` | More views of him (expressions, colours). |
| `mark_hat.png` | His knitted hat (step 5). |
| `guide_head.png` | Where the head goes on the 1024×1024 canvas (grey shape = bald head, front view). Only for reading. |
| `template_eyes_sheet.png`, `template_mouth_sheet.png` | 1536×1024, 3×2 grid: where the six heads go. |

## What makes him Mark (keep all of it)
- Head a soft **tall oval**, chubby cheeks, **round chin**, high forehead.
- **Very big blue eyes**, set fairly close, long lashes, thin light-brown brows high above the eyes.
- Small button nose; small, thin, pink closed smile.
- Hair: **soft golden-blond / light strawberry-blond** (NOT orange, NOT red), loose curls, the hairline starts **high** — the forehead stays open.
- Same light, same soft painterly 3D-cartoon look, same skin tone as in `mark_face.png`.

## Rules for every image
1. Canvas exactly 1024×1024 (head, hair) or 1536×1024 (sheets). Background **flat pure green `#00FF00`**.
2. Front view, not tilted. Ears visible. **Nothing below the chin** (remove the neck).
3. The head (without hair) sits like the grey shape in `guide_head.png`: top of the skull at about y=290,
   ear to ear about 420 px wide, centred. Scale the face **uniformly** — never stretch it wider or taller.
4. No text, no frame, no shadow on the background.

## Steps (5 images)
1. **`head_base.png`** — `mark_face.png` with **all the hair removed** (completely bald, like a doll head), neck removed,
   put on the green 1024 canvas as in rule 3. The face (eyes, brows, nose, mouth, cheeks, ears) must stay exactly as in `mark_face.png`.
2. **`eyes_sheet.png`** (1536×1024, 3×2, each head over its cell of `template_eyes_sheet.png`): six copies of `head_base.png`,
   **only eyes and brows change**: 1 open (unchanged) · 2 half-closed · 3 closed · 4 happy (closed smiling arcs) · 5 surprised (wide, brows up) · 6 sad (brows up in the middle).
3. **`mouth_sheet.png`** (same grid): six copies of `head_base.png`, **only the mouth changes**:
   1 smile (unchanged) · 2 "a" (open, babbling) · 3 "o" (small round) · 4 "e" (wide, a few tiny teeth) · 5 "m" (lips pressed) · 6 laugh (big open, tongue).
4. **`hair_curls.png`** — `mark_face.png` at the **same size and place as in `head_base.png`**, but keep **only his hair**
   exactly as it is in the reference; everything that is not hair (face, ears, neck) becomes **flat grey `#BEBEBE`**.
5. **`hair_hat.png`** — the same as 4, plus his navy knitted pom-pom hat (`mark_hat.png`) on top: the hat covers the top of the
   head down to the forehead, curls show under it. Hat fully opaque, no green inside the pom-pom.

Give the 5 PNGs with exactly these names. Before each one, compare it with `mark_face.png`: same face, same eyes, same hair colour.
