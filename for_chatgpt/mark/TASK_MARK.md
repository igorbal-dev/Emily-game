# Task: head, faces and hair of MARK for a 2D game puppet

You are drawing art for a 2D cutout puppet of **Mark**, a 1.5-year-old toddler boy in a children's game
(he is the little brother of Emily). His body is already done (vector, on a skeleton).
You draw only his **head**, **facial expressions** and **hair**.
These pieces get stacked on top of each other in the game, so **size and position must match the templates exactly**.

## Attached files

| File | What it is |
|---|---|
| `mark_sheet_1.png` | **The character reference (main).** Draw Mark exactly like on this sheet: same chubby toddler face, big blue eyes, rosy cheeks, short reddish-golden curls, same soft warm painterly 3D-cartoon style. Do not redesign him, do not make him older. |
| `mark_face.png` | His head close-up (best face reference). |
| `mark_idle.png` | Full body, standing. |
| `mark_hat.png` | His navy knitted hat with a pom-pom (for image 5). |
| `template_head.png` | 1024×1024. Grey shape = his **bald head, front view**, on green. Draw ON this canvas. |
| `template_hair.png` | Same as `template_head.png`. Use it for the hair. |
| `template_eyes_sheet.png` | 1536×1024, six grey heads in a 3×2 grid. For the eye expressions. |
| `template_mouth_sheet.png` | 1536×1024, six grey heads in a 3×2 grid. For the mouth shapes. |
| `guide_head.png`, `guide_eyes_sheet.png`, `guide_mouth_sheet.png` | Same layouts with labels and guide lines. **Only for reading, do not copy the lines or text into your images.** |
| `mark_body_preview.png` | How the head sits on his body in the game (with a temporary head), just for understanding the scale. |

## Rules for EVERY image

1. **Exact canvas size**: 1024×1024 (head, hair) or 1536×1024 (sheets). Don't crop, pad, zoom or move the composition.
2. **The head covers the grey shape of the template exactly**: top of the skull, cheeks, ears and chin where the grey shape is. Straight front view, not tilted, not turned. (He is a toddler: round chubby face, full cheeks, small nose, but keep it inside the grey shape.)
3. **Background: flat pure green `#00FF00`** around the drawing. No shadows, no gradient, no frame, no text, no watermark.
4. **Nothing below the chin**: no neck (a tiny stub is OK), no collar, no shoulders, no clothes.
5. Same style, same skin tone, same light (from the upper left) in all images, matching `mark_sheet_1.png`.
6. Clean sharp edges against the green. **The hat must be fully opaque**, never let the green show through it.

## What to make (5 images)

### 1. `head_base.png`: 1024×1024, on `template_head.png`
Mark's head **without any hair** (completely bald, like a doll head before the hair is put on; the hair is a separate layer).
Ears visible. Neutral happy face: **big blue eyes open looking at the viewer, light eyebrows, small closed smile**, button nose, rosy cheeks.

### 2. `eyes_sheet.png`: 1536×1024, on `template_eyes_sheet.png`
The **same bald head as `head_base.png`** six times, one per cell, each exactly over its grey head.
Mouth = small closed smile in all cells, **only eyes and eyebrows change**:
1 `open` (like head_base) · 2 `half` (eyelids half closed, mid-blink) · 3 `closed` (fully closed, relaxed) ·
4 `happy` (closed smiling eyes, upward arcs) · 5 `surprised` (wide open, brows high) · 6 `sad` (brows raised in the middle, about to cry).

### 3. `mouth_sheet.png`: 1536×1024, on `template_mouth_sheet.png`
The **same bald head** six times, eyes open, **only the mouth changes**:
1 `smile` (small closed smile) · 2 `a` (open "ah", babbling) · 3 `o` (small round "oh") ·
4 `e` (wide "ee", a few tiny baby teeth) · 5 `m` (lips pressed together) · 6 `laugh` (big open toddler laugh, tongue visible).
The chin must not move.

### 4. `hair_curls.png`: 1024×1024, on `template_hair.png`
His hair from the sheet: **short fluffy reddish-golden curls**, a curl on top of the forehead, curls over and around the ears.
Draw **only the hair** on top of the grey head. **The grey head stays flat grey** where the hair doesn't cover it:
no face, no skin colour. Hair sits on the grey head as it would on his real head (hairline, around the ears).

### 5. `hair_hat.png`: 1024×1024, on `template_hair.png`
The same curls **with his navy knitted hat with a pom-pom** on (like `mark_hat.png`): the hat covers the top of the head
down to the forehead, the curls show under it at the forehead, sides and over the ears.
Same rules as image 4: only hat + hair, the grey head stays flat grey, the face area is not covered.

## Output
Give me the 5 PNG files with **exactly these names**:
`head_base.png`, `eyes_sheet.png`, `mouth_sheet.png`, `hair_curls.png`, `hair_hat.png`.

If you can only make one image per message, make them in the order above and continue until all 5 are done.
Before finishing each image, check it against its template: same canvas size, head in the same place and size, green background, nothing below the chin.
