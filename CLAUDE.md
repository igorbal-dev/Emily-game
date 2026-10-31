# Куклы персонажей на 2D-скелете (Godot 4.3) — правила для Claude Code

Игорь пишет по-русски, не программист: отвечать просто и коротко. Сама игра (HTML/JS) — в ветке `claude/emily-game-port`, у неё свой CLAUDE.md. Эта ветка — `claude/emily-godot-rig`: куклы персонажей для будущей игры на Godot.

## Начало сессии
1. `git checkout claude/emily-godot-rig` (если ещё не на ней).
2. `sh tools/setup_godot.sh` — Godot 4.3 + web-шаблоны + scipy/opencv.
3. Подробности устройства — README.md.

## Что сделано
- Эмили: векторное тело (Polygon2D) на Skeleton2D, суставы без швов, одежда-слои (`emily/outfits/*.tres`, `set_outfit`), голова из PNG от ChatGPT (6 глаз, 6 ртов, 8 причёсок), анимации idle/walk/run/jump/spin/wave/talk/blink (ноги через IK).
- Просмотрщик для телефона: `viewer/` → https://igorbal-dev.github.io/Emily-game/puppets/ (публикация: `GODOT=... sh tools/publish_viewer.sh`, папка puppets/ в gh-pages; publish.sh игры её сохраняет и не копирует в vN/).
- Конвейер картинок ChatGPT/Codex: шаблоны в `for_chatgpt/`, результат в `from_chatgpt/`, импорт `python3 tools/import_chatgpt.py` (фон, выравнивание, патчи глаз/рта, волосы front/back); дыры в украшениях — `python3 tools/repair_accessories.py from_chatgpt/hair_*.png` (до импорта).
- Проверка: `tools/build_emily.gd` (пересобрать сцену и анимации), `tools/render_previews.gd` + `tools/make_gifs.py` (кадры в previews/), `tools/shot_viewer.gd` (скриншот просмотрщика). Рендер — через `xvfb-run -a ... --rendering-driver opengl3`.

## Марк (готов: тело, голова, одежда)
- Кости, код и анимации те же, что у Эмили; пропорции малыша — `EmilyShapes.BODIES["mark"]` (emily/emily_shapes.gd): фигура Эмили «пересчитывается» по костям (туловище/таз/шея растягиваются, у рук/ног меняется длина и толщина, суставы остаются круглыми), `motion` уменьшает шаги и прыжки. Одежда тоже пересчитывается сама.
- Сцена `mark/mark.tscn` собирается `build_emily.gd -- mark` (персонажи — `CHARS` в сборщике). Одежда — `mark/outfits/` (комбинезон `romper`: воротничок, манжеты, пуговки).
- Голова от ChatGPT (`from_chatgpt/mark/`): 6 глаз, 6 ртов, причёски curls и hat (шапка с помпоном). Дырки в вязаной шапке закрыты `python3 tools/fill_knit_holes.py from_chatgpt/mark/hair_hat.png` (до импорта; repair_accessories закрывает не всё). Импорт `import_chatgpt.py --src from_chatgpt/mark --dst mark/head`, потом `build_emily.gd -- mark`. Задание было `for_chatgpt/mark/TASK_MARK.md`.
- Уличная одежда сделана: выкройки `jacket` (пуховик: стёжка, молния, капюшон, манжеты), `trousers`, `boots` (подошва, мех, липучки; слот "shoes") — `mark/outfits/jacket_navy, trousers_navy, boots_brown`. Шапка будет причёской `hat` от ChatGPT.
- Свитер и нарядный сделаны (по описаниям M6/M7 в docs/chatgpt-prompts.md ветки игры): выкройки `sweater` (вязка, мишка `decal="bear"`), `shirt` (воротник, пуговицы, `decal="bowtie"`), `vest` (слот "outer" — поверх верха), `shoes`; у `trousers` параметр `cuffs` (джоггеры). Вещи: sweater_mustard, joggers_navy, socks_navy, shirt_white, vest_grey, trousers_grey, shoes_brown.
- Осторожно: украшения одежды (cat "decal") рисуются поверх ВСЕЙ одежды на этой кости; то, что должно прятаться под верхней вещью, — cat своей вещи + z_add.
- Сравнить персонажей: `xvfb-run -a godot --path . --rendering-driver opengl3 --script res://tools/shot_poses.gd -- out.png res://emily/emily.tscn res://mark/mark.tscn`; просмотрщик с Марком: `shot_viewer.gd -- out.png idle 0 1`.

## Абиха (голова и тело сделаны)
- Картинки ChatGPT в `from_chatgpt/abiha/` (repair_accessories НЕ запускать: на её волосах он заливает просветы между прядями), импорт в `abiha/head/`, сцена `abiha/abiha.tscn` (`build_emily.gd -- abiha`), пропорции как у Эмили. Одна причёска — ponytail.
- Импорт волос улучшен (unmix_grey в import_chatgpt.py): серый шаблон «вычитается» из прядей, убираются тени серой головы и кусочки кожи лба, передний слой волос плотнее и заходит за край головы. Эмили этим не переимпортирована — если переимпортировать, сравнить скриншоты.
- Одежда: `abiha/outfits/` — tshirt_black (звезда вместо картинки), cargo_purple (trousers с `pockets`), sneakers_pink (shoes с белой подошвой).
- Цвета подогнаны к референсу: `python3 tools/recolor_head.py abiha/head for_chatgpt/abiha/abiha_face.png` (и `mark/head for_chatgpt/mark/mark_face.png`). Запускать ПОСЛЕ каждого import_chatgpt.py (сначала удалить `<head>/.orig/`, иначе возьмёт старые оригиналы). Меняет только кожу (по всем глазам/ртам одинаково) и волосы (не резинки/шапку), обновляет "skin" в layout.json.
- Дальше: платья (розовое, сиреневое, джинсовое, радужное, зелёное — новая выкройка dress), пижамы, купальник, куртка+шапка+джинсы+сапоги (листы в ветке игры art_source/abiha/).
- Известные мелочи: у Эмили узкая щель у ободка (headband); голова живописная, тело плоское (можно добавить мягкие тени).

## Экономия
- Длинные проверки не гонять зря; смотреть кадры previews/ и скриншоты просмотрщика.
- Коммитить в `claude/emily-godot-rig`, main не трогать.
