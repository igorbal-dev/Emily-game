# Task: a REAL walk cycle for Theo (the dog)

Attached: `theo_stand_ref.png` (Theo: apricot curly toy poodle, blue harness, facing right).

Make **`theo_walk8_strip.png`**: 4096×512, **8 cells of 512×512**, left to right = one full walk cycle
(the 8th frame loops back to the 1st). Side view, facing right, same style, same colours.

Very important (the previous strip was wrong: the paws stayed in the same place, the dog paddled on the spot):
1. **Real steps.** In every frame the paws that stand on the ground move BACKWARD relative to the body
   by the same amount (as if the camera follows the dog). A paw goes: lands in front → slides back under the
   body while on the ground → lifts behind → swings forward in the air → lands in front again.
2. Normal dog walk order: left hind, left front, right hind, right front (always 2–3 paws on the ground).
3. **Same scale in every cell**: the dog is exactly the same size in all 8 frames (do NOT fit each frame to the
   cell). The head and back stay at almost the same height (a tiny bob only).
4. Same ground line in every cell (paws on the ground touch y = 475), the body centre at the same x in every cell.
5. Transparent background (or flat pure green #00FF00), no shadow, no text.
