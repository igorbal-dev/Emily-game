# Task: head, faces and hair of ABIHA for a 2D game puppet

Repository **igorbal-dev/Emily-game**, branch **`claude/emily-godot-rig`**.

You draw the **head, facial expressions and hair** of the girl **Abiha** for a 2D cutout puppet.
Her body is already done in the game (vector, on a skeleton). The pieces are stacked on top of each other,
so **size and position must match the templates exactly**. This is the same task that was done for Emily
(`for_chatgpt/TASK_FOR_CHATGPT.md`), only for Abiha and with one hairstyle.

## Files (all in branch `claude/emily-godot-rig`)

| File | What it is |
|---|---|
| `for_chatgpt/abiha/abiha_sheet_1.png` | **The character reference (main).** Draw Abiha exactly like on this sheet: same face, eyes, skin tone, dark-brown wavy hair, same soft painterly cartoon style. Do not redesign her. |
| `for_chatgpt/abiha/abiha_idle.png`, `for_chatgpt/abiha/abiha_face.png` | Small extra references (cut from the sheet). |
| `for_chatgpt/template_head.png` | 1024×1024, grey bald head (front view) on green. Draw ON this canvas. |
| `for_chatgpt/template_hair.png` | Same, for the hair. |
| `for_chatgpt/template_eyes_sheet.png` | 1536×1024, six grey heads in a 3×2 grid, for the eye expressions. |
| `for_chatgpt/template_mouth_sheet.png` | 1536×1024, six grey heads in a 3×2 grid, for the mouth shapes. |
| `for_chatgpt/guide_head.png`, `guide_eyes_sheet.png`, `guide_mouth_sheet.png` | The same layouts with labels and guide lines. **Only for reading, do not copy lines or text into the images.** |

**Ignore** `for_chatgpt/emily_idle.png` and `for_chatgpt/hair_ref_*.png`: that is Emily, a different girl.

Direct links (if needed):
`https://raw.githubusercontent.com/igorbal-dev/Emily-game/claude/emily-godot-rig/for_chatgpt/abiha/abiha_sheet_1.png`
`https://raw.githubusercontent.com/igorbal-dev/Emily-game/claude/emily-godot-rig/for_chatgpt/template_head.png` (and the same for the other template/guide files)

## Rules for EVERY image

1. **Exact canvas size**: 1024×1024 (head, hair) or 1536×1024 (sheets). Don't crop, pad, zoom or move the composition.
2. **The head covers the grey shape of the template exactly**: top of the skull, cheeks, ears and chin where the grey shape is. Straight front view, not tilted, not turned.
3. **Background: flat pure green `#00FF00`** around the drawing. No shadows, no gradient, no frame, no text, no watermark.
4. **Nothing below the chin**: no neck (a tiny stub is OK), no shoulders, no clothes.
5. Same style, same skin tone, same light (from the upper left) in all images, matching `abiha_sheet_1.png`.
6. Clean sharp edges against the green. **Accessories (scrunchie etc.) must be fully opaque**, never let the green show through them.

## What to make (4 images)

### 1. `head_base.png`: 1024×1024, on `template_head.png`
Abiha's head **without any hair** (completely bald, like a doll head before the hair is put on; the hair is a separate layer).
Ears visible. Neutral friendly face: **eyes open looking at the viewer, eyebrows, closed gentle smile**, nose, cheeks.

### 2. `eyes_sheet.png`: 1536×1024, on `template_eyes_sheet.png`
The **same bald head as `head_base.png`** six times, one per cell, each exactly over its grey head.
Mouth = closed gentle smile in all cells, **only eyes and eyebrows change**:
1 `open` (like head_base) · 2 `half` (eyelids half closed, mid-blink) · 3 `closed` (fully closed, relaxed) ·
4 `happy` (closed smiling eyes, upward arcs) · 5 `surprised` (wide open, brows high) · 6 `sad` (brows raised in the middle).

### 3. `mouth_sheet.png`: 1536×1024, on `template_mouth_sheet.png`
The **same bald head** six times, eyes open, **only the mouth changes**:
1 `smile` (closed gentle smile) · 2 `a` (open "ah", tongue slightly visible) · 3 `o` (small round "oh") ·
4 `e` (wide "ee", upper teeth visible) · 5 `m` (lips pressed together) · 6 `laugh` (big open laugh, teeth and tongue).
The chin must not move.

### 4. `hair_ponytail.png`: 1024×1024, on `template_hair.png`
Her usual hairstyle from the sheet: **high ponytail with a small purple scrunchie**, wavy dark-brown hair, a few loose strands.
Draw **only the hair** on top of the grey head. **The grey head stays flat grey** where the hair doesn't cover it:
no face, no skin colour. Hair sits on the grey head as it would on her real head (hairline, around the ears).

## Output

Save the 4 PNGs with exactly these names into **`from_chatgpt/abiha/`** in branch **`claude/emily-godot-rig`**:
`head_base.png`, `eyes_sheet.png`, `mouth_sheet.png`, `hair_ponytail.png`.
**Do not change, move or delete any other file** (Emily's files in `from_chatgpt/` must stay as they are).
Commit with the message `Abiha: head, faces, hair` and push to `claude/emily-godot-rig`.
If image generation is not available to you, stop and say so; do not draw the images with code.
