Продолжаем игру для Эмили. Работаем в ветке `claude/emily-game-port`:
`git fetch origin claude/emily-game-port && git checkout claude/emily-game-port`, потом прочитай `CLAUDE.md` целиком — там все правила и заметки.

Главное на сейчас:
- Кредиты ElevenLabs кончились. Всю новую озвучку делаем через Chatterbox, только на немецком, голоса клонируем по образцам `emily2.wav` и `abiha2.wav`, настройки «A» (exaggeration 0.6, cfg 0.5, temperature 0.8). Как это делать — раздел «Озвучка без кредитов — Chatterbox» в `CLAUDE.md` (через GitHub Actions в ветке `claude/chatterbox-proby-dmel1d`, потом `tools/cb_import.py` и `tools/build_minigames.py`).
- Разрешаю пушить в `claude/emily-game-port`, `claude/chatterbox-proby-dmel1d` и публиковать сайт через `sh tools/publish.sh`.
- Уровни 21–23 озвучены полностью (1.11). Любую новую фразу сразу озвучивай Chatterbox и добавляй в игру, без вопроса.
- Отвечай мне по-русски, просто и коротко — я не программист.

Задача на эту сессию: <напиши здесь, что делать>
