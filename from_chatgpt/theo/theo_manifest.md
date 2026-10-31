# Theo — sprite manifest

Reference: attached Theo sprite sheet. The sprites keep the apricot curly coat and blue harness. Individual pose canvases are 1024×1024 PNG with transparent backgrounds. Strip canvases are 3072×512 (6 frames) or 2048×512 (4 frames); cells run left to right and share a baseline.

## Individual poses (18)

- `theo_stand.png` — calm standing pose, mouth closed, facing right.
- `theo_stand_blink.png` — same stance with eyes closed; eye region composited over the base to preserve the rest of the pose.
- `theo_happy.png` — standing happily, tongue out.
- `theo_sit.png` — seated, facing right.
- `theo_sit_blink.png` — same seated pose with eyes closed; eye region composited over the base.
- `theo_lie.png` — lying down with head raised.
- `theo_sleep.png` — curled up asleep.
- `theo_bark.png` — standing bark pose, mouth open.
- `theo_sniff.png` — nose lowered to sniff the ground.
- `theo_dig.png` — low digging pose with front paws reaching forward.
- `theo_beg.png` — upright on hind legs with front paws raised.
- `theo_tilt.png` — seated, head tilted as if listening.
- `theo_jump_up.png` — upward leap pose.
- `theo_jump_air.png` — airborne leap with legs tucked.
- `theo_land.png` — crouched landing pose.
- `theo_front.png` — seated front view (requested direction exception).
- `theo_back.png` — seated rear view with tail and harness visible (requested direction exception).
- `theo_hide.png` — peeking pose with head and raised paws.

## Animation strips (4)

Frames are in chronological order from left to right; the last frame is intended to loop to the first.

- `theo_walk_strip.png` — 6 frames: alternating walk cycle.
- `theo_run_strip.png` — 6 frames: running cycle.
- `theo_shake_strip.png` — 4 frames: body shake sequence.
- `theo_wag_happy_strip.png` — 4 frames: happy standing pose with tail wag variation.

## Tail sprites (3)

- `theo_stand_notail.png` — standing pose without tail.
- `theo_sit_notail.png` — seated pose without tail.
- `theo_tail.png` — isolated curled tail with transparent background, sized and positioned for overlay under a body.

## Notes on imperfect matches

- `theo_hide.png` approximates peeking as an isolated sprite and has no corner/wall prop; some upper body is visible along with the head and paws.
- `theo_wag_happy_strip.png` has only subtle tail motion between frames; the standing body and head remain stable, but the wag may read weakly at normal playback speed.
- `theo_tail.png` was regenerated after review because the first tail image was cropped. The replacement used a generated checkerboard background; that neutral background was removed to transparency. A faint light fringe can remain around some fine fur strands.
- Independently generated poses have small natural differences in individual fur curls and facial detail. Blink variants were composed onto their base pose so only the eye region changes.
