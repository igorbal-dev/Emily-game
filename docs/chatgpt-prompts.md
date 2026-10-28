# Промпты для ChatGPT: герои по частям, одежда, новые позы

Чеклист с отметками по листам: https://claude.ai/artifact/YLb2FeKrgTHcXF5bgQZ618

Зачем это нужно. Сейчас Эмили, Марк и Тео — цельные картинки: игра подменяет одну позу на другую и чуть покачивает её. Чтобы они двигались живо (дышали, махали руками, шли шагами, крутили головой, Тео вилял хвостом и шевелил ушами), каждого нужно нарисовать **по частям**. Игра соберёт героя из частей и будет поворачивать их в суставах. Так делают простые мультики вроде Peppa Pig.

## Как я буду анимировать (чтобы было понятно, зачем такие части)

- **Руки и ноги из двух частей**: плечо и предплечье с кистью, бедро и голень со стопой. Из двух частей код сам сделает любую позу: помахать, протянуть, взять, отдать, шагать, присесть. Поэтому не нужно рисовать много вариантов рук.
- **Голова отдельно**: кивает, наклоняется. **Хвостики Эмили отдельно**: покачиваются, когда она идёт и прыгает.
- **Глаза и рот отдельными наклейками** поверх головы: моргание, взгляд в сторону, рот при разговоре, улыбка, удивление.
- **Тео**: туловище, голова, два уха, хвост и четыре лапы отдельно. Хвост виляет, уши подпрыгивают, лапы шагают.
- **Концы частей скруглённые и с запасом** (как у бумажной куклы на заклёпках): верх плеча, верх бедра, шея и т. п. дорисованы под соседнюю часть, чтобы при повороте не было дырок.

## Как устроена смена одежды (бумажная кукла)

Одежда на цельную картинку «сверху» плохо работает: рука поднимается, а рукав остаётся на месте. Поэтому одежду лучше рисовать **так же по частям**: туловище в куртке, плечо в рукаве, предплечье в рукаве, нога в штанине, стопа в ботинке. Игра просто подменяет нужные части. Так одежда двигается вместе с руками и ногами.

- Футболки, платья, куртки, кофты: туловище + 2 плеча + 2 предплечья.
- Штаны, леггинсы: 2 бедра + 2 голени. Обувь рисуется вместе с голенью (носок или ботинок на стопе).
- Длинные пальто и платья закрывают верх ног: рисуем юбку/подол вместе с туловищем, а бёдра под ними можно оставить базовые.
- Шапки и причёски: отдельно «задняя часть» (за головой) и «передняя часть» (поверх головы). Для этого нужна голова Эмили с гладко зачёсанными волосами (лист E8).
- Рюкзак: отдельной частью (лямки рисуем на туловище куртки).

## Сколько листов и в каком порядке

Всего **17 листов**. Делай по порядку, начиная с E1. Каждый лист — отдельная картинка.

| № | Файл | Что на листе | Сетка |
|---|------|--------------|-------|
| 1 | E1.png | Эмили: голова, хвостики, туловище, плечи, предплечья | 4×2 |
| 2 | E2.png | Эмили: ноги и запасные кисти | 4×2 |
| 3 | E3.png | Эмили: глаза и рты, набор 1 | 4×2 |
| 4 | E4.png | Эмили: глаза и рты, набор 2 | 4×2 |
| 5 | E5.png | Эмили: уличная одежда (голубая куртка, рюкзак, кроссовки) | 4×2 |
| 6 | E6.png | Эмили: летнее платье и сандалии | 4×2 |
| 7 | E7.png | Эмили: зимняя одежда | 4×2 |
| 8 | E8.png | Эмили: голова без причёски и 3 причёски | 4×2 |
| 9 | E9.png | Эмили: ещё 4 причёски | 4×2 |
| 10 | E10.png | Эмили: новые позы целиком | 4×2 |
| 11 | M1.png | Марк по частям | 4×2 |
| 12 | M2.png | Марк: глаза и рты | 4×2 |
| 13 | M3.png | Марк: уличная одежда | 4×2 |
| 14 | M4.png | Марк: новые позы целиком | 4×2 |
| 15 | T1.png | Тео по частям | 5×2 |
| 16 | T2.png | Тео: морда, глаза, рот | 4×2 |
| 17 | T3.png | Тео: новые позы целиком | 4×2 |

### Как делать каждый лист

1. Открой **тот же чат в ChatGPT**, где рисовались Эмили, Марк и Тео (или новый чат и загрузи туда референс: лист с героем и картинку героя в полный рост).
2. Вставь **общее начало** (ниже) и сразу после него **текст листа**. Одним сообщением.
3. Если ChatGPT что-то перерисовал по-своему (другое лицо, другой цвет, другой размер), напиши: «Redo it. Copy the reference exactly, only split it into parts» и попроси заново.
4. Скачай **оригинал** (не скриншот) и назови файл как в таблице: E1.png, E2.png и т. д.
5. Пришли мне файлы в этот чат (можно все сразу или по несколько). Белый фон уберу я.

---

## Общее начало (вставлять перед каждым листом)

```
Keep the reference sheet above as the only source of truth for this character: face, proportions, hair, colors, clothes and the soft painted children's-book style. Do not redesign anything. Do not make the character older, younger, thinner or cuter. Same exact scale as the full-body reference: every part must have the same size it has on the reference figure.

This is a production sheet for 2D cut-out animation (like a paper doll with pins at the joints).
Rules for the sheet:
- One character only.
- Grid: {GRID}, one item per cell, centered in its cell. Items must not touch each other or the cell edges; leave wide empty space between them.
- Pure white background (#FFFFFF). No shadows, no ground, no outlines around the sheet, no text, no numbers, no labels, no arrows.
- Front view, the same camera angle as the reference.
- Every body part is drawn complete as a separate piece. The end that joins another part (top of the upper arm, top of the thigh, neck, elbow, knee) is rounded and extended a little further than visible, so it can hide under the neighbouring part when it rotates. No cut-off flat edges, no holes, no missing areas where parts overlap.
- Same lighting and colors on all pieces.
```

В каждом листе вместо `{GRID}` уже вписана нужная сетка.

---

## Эмили

### Лист 1 — E1.png: голова, хвостики, туловище, руки

```
Grid: 4 columns x 2 rows.
Character: Emily, 5-year-old girl (golden-blond curly hair in two ponytails with pink hair ties, pink t-shirt with a small light-blue heart, grey leggings, pink socks).
Rest pose for all pieces: standing straight, front view, arms hanging down slightly away from the body.

Row 1:
1. Head with face, front view: open eyes looking forward, closed gentle smile. Hair pulled back, hair ties visible, but WITHOUT the two ponytails. Include the neck, extended down.
2. Left ponytail only (her left, our right), hanging down, with the pink hair tie at the top.
3. Right ponytail only, hanging down, with the pink hair tie at the top.
4. Torso only: pink t-shirt body with the heart, from neck to hips, including the top of the grey leggings at the hips. No head, no arms, no legs. Rounded shoulder areas.

Row 2:
5. Left upper arm (shoulder to elbow) with the short pink sleeve, hanging down.
6. Right upper arm with the short pink sleeve, hanging down.
7. Left forearm with open relaxed hand (elbow to fingertips), hanging down. Bare skin.
8. Right forearm with open relaxed hand, hanging down. Bare skin.
```

### Лист 2 — E2.png: ноги и запасные кисти

```
Grid: 4 columns x 2 rows.
Character: Emily (same as reference).

Row 1:
1. Left thigh (hip to knee) in grey leggings, straight.
2. Right thigh in grey leggings, straight.
3. Left lower leg (knee to toes) in grey leggings with pink sock foot, foot pointing slightly outward, front view.
4. Right lower leg in grey leggings with pink sock foot.

Row 2:
5. Left forearm with a hand that holds something (fingers curled around an invisible round object, like holding a ball or a cup handle). Bare skin.
6. Right forearm with the same holding hand.
7. Left forearm with a pointing hand (index finger pointing forward-down).
8. Right forearm with a pointing hand.
```

### Лист 3 — E3.png: глаза и рты, набор 1

```
Grid: 4 columns x 2 rows.
Character: Emily (same face as reference). These are stickers that will be placed on top of her face, so draw each one large and clearly, at the same scale as on the reference head.
Each eye sticker includes BOTH eyes together with the eyebrows and a small patch of surrounding skin (soft edge), so it fully covers the original eyes.
Each mouth sticker includes the mouth with a small patch of surrounding skin and cheeks (soft edge), so it fully covers the original mouth.

Row 1 (eyes):
1. Eyes open, looking forward (as on the reference).
2. Eyes half closed (sleepy blink in the middle).
3. Eyes fully closed (relaxed, eyelashes visible).
4. Happy closed eyes (curved upward like smiling ^ ^).

Row 2 (mouths):
5. Mouth closed, gentle smile.
6. Mouth slightly open, talking.
7. Mouth wide open, happy laugh, teeth and tongue visible.
8. Mouth round "O", surprised.
```

### Лист 4 — E4.png: глаза и рты, набор 2

```
Grid: 4 columns x 2 rows.
Character: Emily. Same sticker rules as before: both eyes with eyebrows and a skin patch; mouth with a skin patch.

Row 1 (eyes):
1. Eyes looking to her left (to our right).
2. Eyes looking to her right (to our left).
3. Eyes wide open, surprised, eyebrows raised.
4. Sad eyes, eyebrows tilted up in the middle.

Row 2 (mouths):
5. Mouth open saying "ee", teeth visible, wide.
6. Mouth saying "f/v": upper teeth on lower lip.
7. Small sad mouth, corners down.
8. Big open smile with tongue slightly out, giggling.
```

### Лист 5 — E5.png: уличная одежда (по частям)

```
Grid: 4 columns x 2 rows.
Character: Emily in her outdoor clothes from the reference: light-blue hooded jacket, yellow backpack, grey leggings, lilac/pink sneakers.
Draw clothing pieces that exactly match the body pieces of the rest pose (front view, arms hanging down slightly away from the body), so they can replace the indoor pieces.

Row 1:
1. Torso in the open light-blue jacket over the pink t-shirt, hood lying on the back of the shoulders, yellow backpack straps on the shoulders. No head, no arms, no legs.
2. Left upper arm in the jacket sleeve (shoulder to elbow).
3. Right upper arm in the jacket sleeve.
4. Yellow backpack alone, seen from the front-side, as it peeks from behind her shoulders (only the part that would be visible).

Row 2:
5. Left forearm in the jacket sleeve with open relaxed hand.
6. Right forearm in the jacket sleeve with open relaxed hand.
7. Left lower leg (knee to toes) in grey leggings with the sneaker.
8. Right lower leg in grey leggings with the sneaker.
```

### Лист 6 — E6.png: летнее платье

```
Grid: 4 columns x 2 rows.
Character: Emily (same face, hair, body and scale as reference). New summer clothes, designed in the same style: a light yellow cotton sundress with small white flowers, short puffed sleeves, sandals.
Draw clothing pieces that match the rest pose (front view, arms hanging down slightly away from the body).

Row 1:
1. Torso in the sundress, including the full skirt down to just above the knees. No head, no arms, no legs.
2. Left upper arm with the short puffed sleeve.
3. Right upper arm with the short puffed sleeve.
4. A matching straw sun hat with a yellow ribbon, front view, sized for her head.

Row 2:
5. Left thigh, bare skin (it will be mostly under the skirt).
6. Right thigh, bare skin.
7. Left lower leg, bare skin, with a light yellow sandal.
8. Right lower leg, bare skin, with a light yellow sandal.
```

### Лист 7 — E7.png: зимняя одежда

```
Grid: 4 columns x 2 rows.
Character: Emily (same face, hair, body and scale as reference). New winter clothes in the same style: a puffy raspberry-pink winter coat down to mid-thigh, white knitted mittens, dark-grey snow trousers, brown winter boots, a white knitted hat with a pink pom-pom.
Draw clothing pieces that match the rest pose (front view, arms hanging down slightly away from the body).

Row 1:
1. Torso in the puffy coat, coat hem to mid-thigh. No head, no arms, no legs.
2. Left upper arm in the puffy coat sleeve.
3. Right upper arm in the puffy coat sleeve.
4. Knitted winter hat with pom-pom, front view, sized for her head (her ponytails will hang out below it).

Row 2:
5. Left forearm in the coat sleeve with a white mitten.
6. Right forearm in the coat sleeve with a white mitten.
7. Left lower leg in snow trousers with a brown winter boot.
8. Right lower leg in snow trousers with a brown winter boot.
```

### Лист 8 — E8.png: голова без причёски и 3 причёски

```
Grid: 4 columns x 2 rows.
Character: Emily. Hairstyles are separate layers: a BACK part (hair behind the head) and a FRONT part (hair on top of the head and around the face). All at the exact scale of her head on the reference.

Row 1:
1. Emily's head with the face (open eyes, gentle smile) and neck, with her hair combed flat and tight to the scalp like a smooth cap, no ponytails, no loose strands, no fringe. This is the base for hairstyles.
2. Hairstyle "loose curls": BACK part only (long golden curls behind the head and shoulders).
3. Hairstyle "loose curls": FRONT part only (top of the head, curls around the face, fringe), with a transparent hole where the face is.
4. Hairstyle "two braids": BACK part only.

Row 2:
5. Hairstyle "two braids": FRONT part with the two braids hanging forward over the shoulders.
6. Hairstyle "top bun": BACK part only.
7. Hairstyle "top bun": FRONT part with the bun on top of the head.
8. Pink baseball cap with a small light-blue heart, front view, sized for her head.
```

### Лист 9 — E9.png: ещё 4 причёски

```
Grid: 4 columns x 2 rows.
Character: Emily. Same rules as the previous hairstyle sheet: BACK part and FRONT part for each hairstyle, exact scale of her head.

Row 1:
1. Hairstyle "long hair with pink headband": BACK part.
2. Hairstyle "long hair with pink headband": FRONT part with the headband.
3. Hairstyle "flower crown": BACK part (loose wavy hair).
4. Hairstyle "flower crown": FRONT part with a crown of small pink, white and yellow flowers.

Row 2:
5. Hairstyle "two ponytails with yellow star clips": the two ponytails only, left and right, as one piece each side (draw both in this cell, side by side, not touching).
6. Hairstyle "two ponytails with yellow star clips": FRONT part with the star clips.
7. Hairstyle "short bob": BACK part.
8. Hairstyle "short bob": FRONT part.
```

### Лист 10 — E10.png: новые позы целиком

Это запасные цельные позы для моментов, которые трудно собрать из частей.

```
Grid: 4 columns x 2 rows.
Character: Emily in her indoor clothes (pink t-shirt with heart, grey leggings, pink socks), full body, each pose complete.

Row 1:
1. Crouching down small to hide, hugging her knees, looking up with a sneaky smile.
2. Peeking out from behind something: body leaning to the side, only head, one shoulder and one hand would be visible (draw the full figure leaning sideways).
3. Standing with her back to us, both hands covering her eyes against a wall (counting in hide and seek), back view.
4. Sitting on the floor cross-legged, hands on her knees.

Row 2:
5. Throwing a ball with both hands over her head, side-front view, (no ball drawn).
6. Arms stretched forward to catch a ball, excited face.
7. Kneeling and digging in sand with both hands forward (no shovel drawn).
8. Walking away from us, back view, mid-step.
```

---

## Марк

### Лист 11 — M1.png: Марк по частям

```
Grid: 4 columns x 2 rows.
Character: Mark, 1.5-year-old toddler boy (reddish-golden curls, big blue eyes, navy-blue velvet romper with white collar and footed legs).
Rest pose: standing, front view, arms hanging down slightly away from the body, legs slightly apart.

Row 1:
1. Head with face (open eyes, small smile) and neck, extended down.
2. Torso in the navy romper with the white collar, from neck to hips, no head, no arms, no legs.
3. Left whole arm in the romper sleeve, from shoulder to open hand, hanging down (toddler arms: one piece is fine, but draw the shoulder end rounded and extended).
4. Right whole arm, same.

Row 2:
5. Left whole leg in the romper with the footed foot, from hip to foot.
6. Right whole leg, same.
7. Left arm raised up high (reaching), one piece from shoulder to hand.
8. Right arm stretched forward (holding out), one piece from shoulder to hand.
```

### Лист 12 — M2.png: Марк, глаза и рты

```
Grid: 4 columns x 2 rows.
Character: Mark (same face as reference). Stickers placed on top of his face, same scale as on the reference head. Each eye sticker includes both eyes, eyebrows and a skin patch; each mouth sticker includes a skin patch and cheeks.

Row 1 (eyes):
1. Eyes open, looking forward.
2. Eyes half closed.
3. Eyes fully closed.
4. Eyes looking to the side (to our right).

Row 2 (mouths):
5. Mouth closed, small smile.
6. Mouth slightly open, babbling.
7. Mouth wide open laughing.
8. Pouting sad mouth, lower lip out.
```

### Лист 13 — M3.png: Марк, уличная одежда

```
Grid: 4 columns x 2 rows.
Character: Mark in his outdoor clothes from the reference: navy puffy jacket, navy knitted hat with pom-pom, brown boots. Pieces must match his rest pose (front view, arms hanging down slightly away from the body).

Row 1:
1. Torso in the navy puffy jacket. No head, no arms, no legs.
2. Left whole arm in the jacket sleeve with open hand.
3. Right whole arm in the jacket sleeve with open hand.
4. Navy knitted hat with pom-pom, front view, sized for his head.

Row 2:
5. Left whole leg in navy trousers with a brown boot.
6. Right whole leg in navy trousers with a brown boot.
7. Left arm in the jacket sleeve raised up high.
8. Right arm in the jacket sleeve stretched forward.
```

### Лист 14 — M4.png: Марк, новые позы

```
Grid: 4 columns x 2 rows.
Character: Mark in the navy romper, full body, each pose complete.

Row 1:
1. Crawling on hands and knees, side-front view.
2. Sitting on the floor with legs stretched out, happy.
3. Peeking out from behind something, body leaning to the side, curious.
4. Hiding under a table: crouching low with head ducked, giggling.

Row 2:
5. Holding a big ball with both arms against his tummy.
6. Rolling a ball forward with both hands, bending down.
7. Sitting down suddenly on his bottom (plop), surprised.
8. Toddling away from us, back view.
```

---

## Тео

### Лист 15 — T1.png: Тео по частям

```
Grid: 5 columns x 2 rows.
Character: Theo, small apricot curly maltipoo dog with a blue mesh harness.
Rest pose for all pieces: standing on four legs, SIDE view facing to our right (like the walking/running reference), the same scale as the reference.

Row 1:
1. Body only with the blue harness: chest, back and belly, no head, no legs, no tail. Rounded fluffy joints where the head, legs and tail attach.
2. Head without ears, side-front view facing right, eyes open, mouth closed, with a bit of fluffy neck extended.
3. Near ear (the ear on our side), hanging fluffy ear.
4. Far ear (the ear on the other side), the same ear slightly smaller/darker.
5. Tail, fluffy curled tail, separate.

Row 2:
6. Near front leg with paw, straight.
7. Far front leg with paw, straight, slightly darker (it is behind).
8. Near back leg with paw.
9. Far back leg with paw, slightly darker.
10. Tongue only, pink, hanging out (for panting).
```

### Лист 16 — T2.png: морда Тео

```
Grid: 4 columns x 2 rows.
Character: Theo. Stickers for the face of the side-front head from the previous sheet, same scale. Each sticker includes a small patch of surrounding fur.

Row 1:
1. Eye open (the visible eye, side-front view).
2. Eye closed (happy).
3. Muzzle with mouth closed.
4. Muzzle with mouth open, tongue out (panting, happy).

Row 2:
5. Muzzle with mouth open barking.
6. Muzzle sniffing (nose wrinkled slightly, mouth closed).
7. Front view head without ears (like the sitting reference), mouth closed.
8. Front view head without ears, mouth open with tongue.
```

### Лист 17 — T3.png: Тео, новые позы

```
Grid: 4 columns x 2 rows.
Character: Theo with his blue harness, full body, each pose complete.

Row 1:
1. Digging with front paws, side view, bottom up.
2. Jumping up to catch something in the air, side view, all paws off the ground.
3. Sitting up and begging on his back legs, front paws up.
4. Lying on his back, belly up, paws in the air, happy.

Row 2:
5. Sleeping curled up in a ball.
6. Carrying a ball in his mouth, walking, side view (draw a plain red ball).
7. Shaking himself (fur flying), front view.
8. Sitting with his back to us, looking over his shoulder.
```

---

## Если что-то не получается

- ChatGPT рисует части слитно или с тенью: «Separate every piece with wide white space. Remove all shadows.»
- Части разного размера: «All pieces must be at exactly the same scale as the reference figure. Do not enlarge small parts.»
- Рисует лицо по-другому: начни заново с референсом в новом сообщении и вставь общее начало ещё раз.
- Если лист совсем не выходит (например, хвостики или уши), пришли то, что получилось: я дорисую недостающее в коде или обойдусь без этой части.
