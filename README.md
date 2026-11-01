# Emily — 2D-кукла на скелете (Godot 4.3)

**Смотреть на телефоне:** https://igorbal-dev.github.io/Emily-game/puppets/

Запуск в Godot 4.3+: F5 — просмотрщик (`viewer/viewer.tscn`), тот же, что на сайте.
Демо с клавиатурой — `demo/demo.tscn`: ←/→ ходьба, Space прыжок, W помахать, T говорить, B моргнуть, 1–4 одежда, E глаза, M рот, H причёска.

## Просмотрщик (viewer/)
- Вкладки «Движения / Одежда / Причёски / Лицо», кнопки «Медленно», «Гуляет», «Развернуть», «−/+».
- Новый персонаж: добавить его сцену в `CHARACTERS` в `viewer/viewer.gd` — сверху появятся кнопки выбора персонажа.
  Движения берутся из его AnimationPlayer сами; одежда/причёски — из метода `viewer_options()` (пример в `emily/emily.gd`).
- Новая одежда (`emily/outfits/*.tres`) и причёски (`emily/head/hair/*_front.png`) появляются в просмотрщике сами.
- Обновить сайт: `GODOT=путь/к/godot sh tools/publish_viewer.sh` (нужны web-шаблоны экспорта Godot 4.3).

## Устройство
- `emily/emily.tscn` — персонаж: `Skeleton2D` + `Bone2D` (Hips → Torso → Neck → Head; UpperArm/Forearm/Hand и Thigh/Shin/Foot для каждой стороны). R — ближняя сторона (перед туловищем), L — дальняя (за туловищем). Смотрит вправо, вид 3/4.
- Тело — `Polygon2D` (векторное). Суставы — круги одного радиуса с центром в точке вращения, поэтому локти и колени не выпирают и швов нет: в каждой группе сначала рисуются все контуры, потом все заливки.
- `emily/emily.gd` — API:
  - `set_outfit({"top": "tshirt_pink", "bottom": "leggings_grey", "socks": "socks_pink"})`, `null` — снять. Боди (`base`) снять нельзя.
  - `set_hair("pigtails")`, `eyes = "happy"`, `mouth = "a"`, `play("walk")`, `talking = true`, `facing = -1`.
  - `WALK_SPEED` — скорость перемещения при ходьбе (ноги не скользят).
- Одежда — `emily/outfits/*.tres` (`OutfitItem`). Новая футболка: скопировать `tshirt_pink.tres`, поменять `color`, `decal` (heart/star/dot). Выкройки: tshirt, longsleeve, leggings, shorts, skirt, socks, bodysuit, dress (слот "dress" заменяет верх и низ) и др. — см. `emily/outfit_item.gd`.
- Голова — PNG в `emily/head/` (сейчас временная заглушка): `base.png`, `eyes/*.png`, `mouth/*.png`, `hair/<имя>_front.png` и `_back.png`, раскладка — `layout.json`.
- Анимации (AnimationPlayer): idle, walk, run, jump, spin, wave, talk, blink. FacePlayer — моргание и рот поверх любой анимации (автоморгание включено).

## Инструменты
- `godot --headless --path . --script res://tools/build_emily.gd` — пересобрать сцену и анимации (ходьба и прыжок считаются через IK, стопы на земле).
- `xvfb-run -a godot --path . --rendering-driver opengl3 --script res://tools/render_previews.gd` и `python3 tools/make_gifs.py` — превью в `previews/`.
- `python3 tools/make_head_assets.py` — заглушка головы и шаблоны для ChatGPT.
- `python3 tools/import_chatgpt.py` — картинки из `from_chatgpt/` → `emily/head/`.

## ChatGPT
Папка `for_chatgpt/`: `TASK_FOR_CHATGPT.md` (вставить целиком + «выполни это задание»), шаблоны, гайды, `emily_idle.png`, образцы причёсок.
