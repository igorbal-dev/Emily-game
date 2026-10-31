# Task: head, faces and hairstyles for a 2D game puppet

You are drawing art for a 2D cutout puppet of a little girl named **Emily** in a children's game.
Her body is already done (vector, on a skeleton). You draw only her **head**, **facial expressions** and **hairstyles**.
These pieces get stacked on top of each other in the game, so **size and position must match the templates exactly**.

## Attached files

| File | What it is |
|---|---|
| `emily_idle.png` | **The character reference.** Draw Emily exactly like this: same face, same skin tone, same eyes, same art style (soft, warm, painterly 3D-cartoon look). Do not redesign her. |
| `template_head.png` | 1024×1024. Grey shape = her **bald head, front view**, on green. Draw ON this canvas. |
| `template_hair.png` | Same as `template_head.png`. Use it for the hairstyles. |
| `template_eyes_sheet.png` | 1536×1024, six grey heads in a 3×2 grid. For the eye expressions. |
| `template_mouth_sheet.png` | 1536×1024, six grey heads in a 3×2 grid. For the mouth shapes. |
| `guide_head.png`, `guide_eyes_sheet.png`, `guide_mouth_sheet.png` | Same layouts with labels and guide lines (eye line, eye and mouth zones, chin cut line). **Only for reading — do not copy the lines or text into your images.** |
| `hair_ref_1_pigtails.png` … `hair_ref_8_cap.png` | What each hairstyle should look like. |
| `body_preview_placeholder_head.png` | How the head sits on the body in the game (with a temporary placeholder head), just for understanding the scale. |

## Rules for EVERY image

1. **Exact canvas size**: 1024×1024 (head, hair) or 1536×1024 (sheets). Do not crop, pad, zoom or move the composition.
2. **Same position and size as the grey head in the template.** The head must cover the grey shape: top of the skull, cheeks, ears and chin exactly where the grey shape is. Keep the head **straight, front view, not tilted, not turned**, like the grey shape.
3. **Background: flat pure green `#00FF00`** everywhere outside the drawing. No shadows on the background, no gradient, no floor, no frame, no text, no watermark, no signature.
4. **Nothing below the chin**: no neck (or only a tiny neck stub), no shoulders, no clothes.
5. Same art style, same skin tone and same light (from the upper left) in all images, matching `emily_idle.png`.
6. Clean, sharp edges against the green (no green glow, no blur), so the background can be cut out.
7. Don't add anything that isn't asked for (no hands, no props, no extra characters).

## What to make (11 images)

### 1. `head_base.png` — 1024×1024, on `template_head.png`
- Emily's head **without any hair** (completely bald, like a doll head before the hair is put on — the hair is a separate layer in the game). Smooth skin on top of the skull, ears visible.
- Neutral friendly face: **eyes open looking at the viewer, eyebrows, closed gentle smile**, nose, rosy cheeks.
- Eyes on the eye line, mouth in the mouth zone (see `guide_head.png`).

### 2. `eyes_sheet.png` — 1536×1024, on `template_eyes_sheet.png`
The **same bald head as in `head_base.png`** six times, one per cell, each exactly over its grey head.
Everything identical to `head_base.png` (mouth = closed gentle smile) — **only the eyes and eyebrows change**:

| Cell | Name | Eyes and brows |
|---|---|---|
| 1 (top left) | `open` | exactly like `head_base.png` |
| 2 (top middle) | `half` | eyelids half closed (middle of a blink) |
| 3 (top right) | `closed` | eyes fully closed, relaxed (blink), lashes visible |
| 4 (bottom left) | `happy` | closed smiling eyes, upward arcs (laughing) |
| 5 (bottom middle) | `surprised` | eyes wide open, brows raised high |
| 6 (bottom right) | `sad` | brows raised in the middle, eyes slightly lowered, a little sad |

Keep eyes and brows **inside the blue zone** of `guide_eyes_sheet.png`.

### 3. `mouth_sheet.png` — 1536×1024, on `template_mouth_sheet.png`
The **same bald head** six times. Everything identical to `head_base.png` (eyes open) — **only the mouth changes** (for talking animation):

| Cell | Name | Mouth |
|---|---|---|
| 1 (top left) | `smile` | closed gentle smile (like `head_base.png`) |
| 2 (top middle) | `a` | open mouth saying "ah", tongue slightly visible |
| 3 (top right) | `o` | small round open mouth saying "oh" |
| 4 (bottom left) | `e` | wide mouth saying "ee", upper teeth visible |
| 5 (bottom middle) | `m` | lips pressed together, neutral ("m", "b", "p") |
| 6 (bottom right) | `laugh` | big open happy laugh, teeth and tongue visible |

Keep the mouth **inside the red zone** of `guide_mouth_sheet.png`. The chin must not move.

### 4. Hairstyles — 8 images, 1024×1024 each, on `template_hair.png`
Draw **only the hair (and hair accessories)** on top of the grey head. **Leave the grey head flat grey** where the hair doesn't cover it — **no face, no eyes, no skin colour**. The grey head is just the guide to place the hair.
- The hair must sit on the grey head exactly as it would on Emily's head (hairline, bangs, around the ears).
- Long hair may go down to the bottom of the canvas, pigtails may stick out to the sides — but stay inside the canvas.
- Same hair colour, curls and style as `emily_idle.png`, match the matching `hair_ref_*.png`.

| File | Hairstyle (see `hair_ref_N_*.png`) |
|---|---|
| `hair_pigtails.png` | two high pigtails with pink scrunchies (Emily's default, as in `emily_idle.png`) |
| `hair_ponytail.png` | half-up hair: a small ponytail on top with a pink scrunchie, the rest loose and curly |
| `hair_braids.png` | two braids hanging down, small pink ties |
| `hair_headband.png` | long loose curly hair with a pink headband |
| `hair_bun.png` | one big messy bun on top of the head |
| `hair_stars.png` | two pigtails held by small yellow star hair clips |
| `hair_flowers.png` | long loose curly hair with a crown of small pastel flowers |
| `hair_cap.png` | a pink baseball cap with a small light-blue heart, hair loose under it |

## Output
Give me the 11 PNG files with **exactly these names**:
`head_base.png`, `eyes_sheet.png`, `mouth_sheet.png`, `hair_pigtails.png`, `hair_ponytail.png`, `hair_braids.png`, `hair_headband.png`, `hair_bun.png`, `hair_stars.png`, `hair_flowers.png`, `hair_cap.png`.

If you can only make one image per message, make them in the order above and continue until all 11 are done.
Before finishing each image, check it against its template: same canvas size, head in the same place and size, green background, nothing below the chin.
