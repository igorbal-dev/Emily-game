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

## Марк (сделано тело, ждём голову)
- Кости, код и анимации те же, что у Эмили; пропорции малыша — `EmilyShapes.BODIES["mark"]` (emily/emily_shapes.gd): фигура Эмили «пересчитывается» по костям (туловище/таз/шея растягиваются, у рук/ног меняется длина и толщина, суставы остаются круглыми), `motion` уменьшает шаги и прыжки. Одежда тоже пересчитывается сама.
- Сцена `mark/mark.tscn` собирается `build_emily.gd -- mark` (персонажи — `CHARS` в сборщике). Одежда — `mark/outfits/` (комбинезон `romper`: воротничок, манжеты, пуговки).
- Голова ВРЕМЕННАЯ: старая картинка игры с волосами (`mark/head/base.png`), глаза/рот не меняются. Задание для ChatGPT: `for_chatgpt/mark/TASK_MARK.md` (+ всё в одном `mark_for_chatgpt.zip`): голова, 6 глаз, 6 ртов, кудряшки, шапка. Ответ положить в `from_chatgpt/mark/`, импорт `python3 tools/import_chatgpt.py --src from_chatgpt/mark --dst mark/head`, потом пересобрать `build_emily.gd -- mark`.
- Дальше: уличная одежда (куртка, штаны, ботинки — новые выкройки), свитер, нарядный костюмчик (см. листы M3/M6/M7 в ветке игры, docs/chatgpt-prompts.md).
- Сравнить персонажей: `xvfb-run -a godot --path . --rendering-driver opengl3 --script res://tools/shot_poses.gd -- out.png res://emily/emily.tscn res://mark/mark.tscn`; просмотрщик с Марком: `shot_viewer.gd -- out.png idle 0 1`.

## Текущая задача: Абиха на том же скелете
- Codex рисует 4 картинки по `for_chatgpt/abiha/TASK_ABIHA.md` (референс `for_chatgpt/abiha/abiha_sheet_1.png`) и кладёт в `from_chatgpt/abiha/`: head_base, eyes_sheet, mouth_sheet, hair_ponytail. Сначала проверить, пришли ли (`git pull`).
- Решено: у Абихи ОДНА причёска (хвостик с фиолетовой резинкой), смена причёсок только у Эмили.
- Сделать:
  1. Импорт: `import_chatgpt.py --src from_chatgpt/abiha --dst abiha/head` (до этого repair_accessories). Цвет кожи — из её головы (layout.json "skin").
  2. Персонаж `abiha/abiha.tscn`: обобщение уже сделано для Марка — добавить "abiha" в `CHARS` (build_emily.gd) и при нужде в `BODIES` (emily_shapes.gd), `build_emily.gd -- abiha`.
  3. Одежда Абихи векторно по её листу: чёрная футболка с картинкой, фиолетовые штаны-карго, розовые кроссовки (обувь — новая выкройка), платья (розовое, сиреневое, джинсовое, радужное, зелёное), пижамы, купальник, куртка+шапка+джинсы+сапоги.
  4. Добавить в `CHARACTERS` в viewer/viewer.gd, проверить скриншотом, опубликовать publish_viewer.sh.
- Известные мелочи: у Эмили узкая щель у ободка (headband); голова живописная, тело плоское (можно добавить мягкие тени).

## Экономия
- Длинные проверки не гонять зря; смотреть кадры previews/ и скриншоты просмотрщика.
- Коммитить в `claude/emily-godot-rig`, main не трогать.
