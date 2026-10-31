# Герои-конструктор: промпты по шаблону

Новый способ. Части героя рисует не ChatGPT «как хочет», а я задаю их точными серыми формами (шаблон).
ChatGPT только раскрашивает формы. Тогда все части одного размера, суставы совпадают, и из них
можно собрать любые позы, а одежду и причёски менять слоями.

Стиль: мягкий объёмный мультик (2.5D): чистые формы, мягкие тени и блики, тонкий тёплый контур,
волосы крупными гладкими локонами, а не тысячей волосков. Не совсем плоско, но и не «живопись».

## Проба: Эмили, лист P1 (части тела)

Файлы для ChatGPT (лежат в art/templates):
1. emily_template.png — шаблон с серыми формами (ГЛАВНЫЙ, его раскрашиваем).
2. emily_reference.png — как выглядит Эмили.
3. emily_assembled.png — как части собираются в фигурку (только для понимания).

Как делать: новый чат в ChatGPT → загрузить все три картинки → вставить промпт ниже.
Получившийся лист назвать P1.png и прислать мне.

```
Image 1 is a TEMPLATE for a 2D cut-out animation puppet: 12 grey shapes on a white background. Image 2 shows the character, Emily, a 5-year-old girl. Image 3 shows how the 12 pieces fit together into one figure (for understanding only, do not draw it).

Task: paint each grey shape of Image 1 as the named body part of Emily, and return the whole sheet.

Strict rules:
- Keep every shape exactly where it is, with exactly the same outline and size. Do not move, resize, rotate, merge or add pieces. Paint only inside each shape and fill the shape completely, edge to edge.
- The round ends of the pieces are joints: paint them fully and round (they will hide under the neighbouring piece when the limb rotates).
- Pure white background (#FFFFFF) everywhere outside the shapes. No shadows on the background, no text, no numbers, no outlines around the sheet.
- Same light on every piece: soft light from the top left.

Style: a soft 3D-looking cartoon, like a modern animated preschool series: clean simple shapes, smooth soft shading with gentle highlights, a thin warm-brown outline around each piece, simple textures, warm bright colours. Hair is drawn as big smooth chunky curly locks, not thousands of thin strands. Keep Emily recognizable from Image 2: golden-blond curly hair, big brown eyes, rosy cheeks, pink t-shirt with a small light-blue heart, grey leggings, pink socks.

The pieces, row by row, left to right:
Row 1:
1. Head (front view) with neck: big fluffy golden-blond curly hair filling the top and sides of the shape, face in the lower middle with nose and rosy cheeks, eyebrows, but NO eyes and NO mouth (the face stays blank there, plain skin; eyes and mouth come as separate stickers). Pink hair ties on both sides of the head, high up, where the ponytails attach. The neck at the bottom is plain skin.
2. Left ponytail: the round top is a pink hair tie, below it a fluffy curly golden-blond ponytail.
3. Right ponytail, the same, mirrored.
4. Torso (front view): pink t-shirt with a small light-blue heart on the chest, short sleeve openings at the shoulders, the bottom part is the top of the grey leggings (hips). No head, no arms, no legs.
Row 2:
5. Left upper arm: the top two thirds is the short pink t-shirt sleeve, the bottom third is bare skin (elbow).
6. Right upper arm, the same.
7. Left forearm with hand: bare skin, the round bottom is a simple cartoon hand seen from the front, fingers together, thumb visible.
8. Right forearm with hand, the same, mirrored.
Row 3:
9. Left thigh: grey ribbed leggings.
10. Right thigh: grey ribbed leggings.
11. Left lower leg: grey leggings, the round foot at the bottom is a pink sock, seen from the front.
12. Right lower leg, the same, mirrored.
```

## Потом: лист P2 (глаза и рот — наклейки)

Делать в том же чате, сразу после P1, когда P1 получился.

```
Now draw Emily's eyes and mouths as separate stickers for the blank face of the head you just painted, in exactly the same style and at the same scale as on that head.
Grid: 4 columns x 2 rows, one item per cell, centered, items not touching. Pure white background, no shadows, no text.
Each eye sticker: both eyes together with the eyebrows, drawn on a small soft patch of the same skin colour as the face (the patch edge fades out softly), so it can be placed on the blank face.
Each mouth sticker: the mouth on a small soft patch of the same skin colour.
Row 1 (eyes, big brown cartoon eyes with a white highlight, dark outline):
1. Open, looking forward, gentle.
2. Half closed (middle of a blink).
3. Closed (relaxed, eyelashes).
4. Happy closed (curved up like ^ ^).
Row 2 (mouths):
5. Closed gentle smile.
6. Slightly open, talking.
7. Wide open happy laugh, teeth and tongue visible.
8. Round "O", surprised.
```
