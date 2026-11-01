# Abiha — missing poses (task for Codex / ChatGPT)

The game already has enough indoor poses of Abiha (sheet 1: standing, waving, arms crossed, peace, walking, running, jumping, sitting).
What is missing are **outdoor poses in the winter clothes**: in the game everybody wears a jacket and shoes outside,
and sheet 1 has only one picture of Abiha in the pink winter jacket (standing, hands in pockets).
Until the new sheet arrives, the game shows that one standing picture for every outdoor pose.

**Order: 1 sheet.** Nothing else is needed.

## How to send it

**Codex (has access to the repository):** paste the "Task for Codex" below — it takes the reference from the repo and puts the result back.

**ChatGPT (no repository):** attach **`art_source/abiha/abiha_sheet_1.png`** as the reference, paste the prompt from the box,
save the result as `art_source/abiha/abiha_sheet_5_winter.png` (upload on GitHub to branch `claude/emily-game-port`) and tell Claude Code it is there.

## Task for Codex (copy as it is)

```
Repository igorbal-dev/Emily-game, branch claude/emily-game-port.
1. Open the reference image art_source/abiha/abiha_sheet_1.png (character sheet of the girl Abiha).
2. Generate ONE new image using that file as the reference and the prompt from the section
   "Prompt (copy everything inside the box)" in for_chatgpt/ABIHA_TASK.md. Landscape, about 1536x1024 px, PNG.
3. Save it as art_source/abiha/abiha_sheet_5_winter.png. Do not change, move or delete any other file.
4. Commit only that file to branch claude/emily-game-port with the message "Abiha: winter poses sheet" and push.
If image generation is not available to you, stop and say so; do not draw it with code.
```

## Prompt (copy everything inside the box)

```
Draw a new character sheet of the SAME girl as in the attached reference image (Abiha).
Draw strictly from the attached reference. Do not change her appearance: same face, same brown eyes,
same skin tone, same dark-brown wavy hair, same proportions and the same soft cartoon style and rendering
as the reference sheet.

Outfit for every pose: the winter outfit from the bottom row of the reference (8th figure from the left):
pink puffer jacket, pink knitted beanie with a pompom, a little dark-brown hair visible under the beanie,
blue jeans, pink winter boots. Keep this outfit identical in all 8 poses.

Layout: a grid of 4 columns × 2 rows, 8 full-body poses, all the same height scale (she is 5 years old,
same size as in the reference). Every pose is complete from the top of the beanie to the soles of the boots.
The poses do NOT touch or overlap each other; leave clear white space between them.

Row 1:
1. standing, facing the viewer, arms relaxed down at her sides (not in pockets), friendly smile
2. waving with one hand raised, happy
3. running to the right (side view, 3/4), one leg lifted, arms swinging
4. jumping for joy, both arms up, mouth open laughing
Row 2:
5. sitting on the ground with legs stretched forward, hands resting beside her (as if sliding down a slide), seen from the side, facing right
6. pushing forward with both arms straight out in front of her, leaning forward, facing right (as if pushing a friend on a swing)
7. squatting / kneeling, one hand reaching down to the ground (as if playing in the sand), facing the viewer, hands empty
8. walking to the right, side view, calm step

Rules: pure flat white background (#FFFFFF), no shadows on the ground, no props, no scenery, no frames, no text,
no labels, no numbers. Do not change her appearance.
```

## What the game will do with it

The sheet is cut automatically (white background removed), each pose becomes `abiha_<pose>_out`:
idle, wave, run, jump, sit (slide), push (swing), crouch (sand), walk. Blinking and talking are added to pose 1 by code,
the same way as for the indoor poses.
