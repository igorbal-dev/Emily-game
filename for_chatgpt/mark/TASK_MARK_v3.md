# Task: Mark's head for a 2D game puppet — make all 5 images at once

Make **all 5 PNG images in one go** (no questions, no drafts) and give them as **one ZIP file `mark_v3.zip`**
with exactly these file names inside:
`head_base.png`, `eyes_sheet.png`, `mouth_sheet.png`, `hair_curls.png`, `hair_hat.png`.

## Who Mark is
A **baby boy about 1 year old** (the youngest character of the game: toddles, babbles).
Take his look from `mark_face.png`: **colouring, blue eyes, golden curls, soft painterly 3D-cartoon style, skin tone**.
Make him clearly a **one-year-old**:
- round soft head, **chubby round cheeks**, small soft chin, big round forehead;
- **big round blue eyes** (as big as in `mark_face.png` — never small), wide apart, light thin brows;
- **tiny button nose**: a small soft rounded bump seen straight from the front — **NO nostrils, no dark holes, not upturned**;
- small soft mouth, pink lips;
- **soft golden-honey baby curls** like in `mark_face.png` (NOT pale platinum, NOT orange), forehead open.

## Attached files
| File | Use |
|---|---|
| `mark_face.png` | Mark (look, colours, style). |
| `mark_sheet_1.png`, `mark_idle.png` | More pictures of Mark (colours, character). |
| `mark_hat.png` | His navy knitted pom-pom hat (image 5). |
| `guide_head.png` | **Layout of the head on the 1024×1024 canvas** (grey head, blue box = eyes, black dot = nose tip, red box = mouth). Read it, do not copy its text/lines. |
| `template_eyes_sheet.png`, `template_mouth_sheet.png` | 1536×1024 sheets, 3 columns × 2 rows: one grey head per cell = where each head goes. |

## Layout (the game cuts the eyes and the mouth out of the pictures by these coordinates — keep them exact)
On a 1024×1024 canvas, head seen straight from the front, centred at x = 512:
- top of the bald skull: **y = 290**; chin: **y = 712**; ears: outer edges at about **x = 300 and x = 724**;
- **eyes**: centres at **(437, 535)** and **(587, 535)**; eyes + brows fit inside the box **x 352–672, y 446–594**;
- **nose tip: (512, 603)** — the nose is small and ends **above y = 620**;
- **mouth**: centre **(512, 660)**, fits inside the box **x 440–584, y 624–702**;
- **nothing below the chin** (no neck, no body).

Sheets (1536×1024): each cell is 512×512 and holds the **same head at half size**, placed like the grey head of the template in that cell
(cell's top-left corner + all coordinates above ÷ 2).

## Rules for all images
- Background **flat pure green #00FF00** everywhere (no shadow, no gradient, no text, no frame).
- Exactly the canvas size given. Same head size and position in every image and every cell.
- Every head in the sheets is a **copy of `head_base.png`**: same face, same size, same place. Only the part named below changes.

## The 5 images
1. **`head_base.png`** (1024×1024) — baby Mark's face, **completely bald** (smooth skull like a doll head), ears visible, open eyes, gentle closed smile.
2. **`eyes_sheet.png`** (1536×1024) — six copies of `head_base.png`; **only eyes and brows change** (nose, mouth, cheeks unchanged).
   Order left→right, top row then bottom row:
   1 open (unchanged) · 2 half-closed, sleepy · 3 closed, calm lines with lashes · 4 happy, smiling arcs ^ ^ ·
   5 surprised, eyes wide, brows high · 6 sad, inner ends of the brows raised.
3. **`mouth_sheet.png`** (1536×1024) — six copies of `head_base.png`; **only the mouth changes**, always inside the mouth box
   (below the nose, above the chin). The **nose stays exactly the same** in all six.
   1 smile (unchanged) · 2 "a", open, babbling · 3 "o", small round · 4 "e", wide, two tiny top teeth · 5 "m", lips pressed ·
   6 laugh, big open mouth with tongue.
4. **`hair_curls.png`** (1024×1024) — Mark's golden curls on the head, at the same size and place as `head_base.png`.
   **Everything that is not hair (face, ears) = flat grey #BEBEBE**, background green. Hair fully opaque.
   The curls start high, the forehead and the eyes stay free (no hair below y = 470 in the middle of the face).
5. **`hair_hat.png`** (1024×1024) — like image 4 plus the navy knitted pom-pom hat from `mark_hat.png` pulled onto the head:
   the hat covers the top of the head down to about **y = 440**; curls peek out **only at the sides** (over the ears) and a short
   fringe that ends **above the brows (y < 470)**. **Nothing over the eyes or the nose.** Hat fully opaque, no green or grey holes.

## Before giving the ZIP, check each image
- one-year-old baby face; big blue eyes; button nose **without nostrils**; warm golden curls (not white, not orange);
- eyes, nose and mouth at the coordinates above, the same in every image;
- green background, exact canvas sizes, 5 files with exactly the right names.
