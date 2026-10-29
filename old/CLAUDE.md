# Игра для Эмили — правила для Claude Code

Немецкий для Эмили (5 лет, Берлин): уровни-сценки, мини-игры, косточки Тео. Игорь пишет по-русски, не программист — отвечать просто и коротко.

## Устройство
- Статический HTML/JS, без сборщика. `index.html` — карта: уровни (LEVELS), мини-игры (MINIS), альбом, причёски, сундучок косточек, настройка «Повторение фраз».
- Уровни `l0.html`–`l12.html` — самостоятельные страницы (код, IMG, SND, TEXT внутри). Уровни 13–16 и мини-игры собираются: правишь `l13.src.html`… / `m1.src.html`…, потом `python3 tools/build_minigames.py`.
- Общий код в `js/`: `common.js` (мягкий микрофон, кнопка «дальше», `countBones` и `Wallet` — подсчёт косточек и баланс), `mini.js` (основа мини-игр и уровней 13–16), `talk.js` (движок разговорных уровней 13–16), `screen.js` (полный экран), `world.js` (фон), `repeat.js` + `chunks.js` (уровни сложности повторения).
- Фразы: TEXT в странице уровня (тексты), записи — `SND` уровня и `art/voice_new.json` (ключ → `assets/snd/*.mp3`). Кусочки фраз — `js/chunks.js` (CHUNKS + CHUNK_SND). Картинки — `assets/img/`, ключи в IMG уровня и `art/race_img.json`, `art/talk_img.json`.
- ТЗ уровней 13–16 и мини-игр — `docs/tz/`. Ход работы — `docs/progress.md`, голоса — `docs/voice.md`, список фраз по голосам — `voice-next.md`.
- Прогресс на устройстве: localStorage `emily-game` {done, bones (баланс), earned (всего, для причёсок), friends, mini}; `emily-repeat` — easy/medium/normal.

## Публикация и ссылки
- Игра публикуется через GitHub Pages (не Artifact): `git push origin claude/emily-game-port` и `git push origin claude/emily-game-port:gh-pages`.
- Игра: https://igorbal-dev.github.io/Emily-game/ (с большой E), уровни `…/l0.html`–`…/l16.html`, мини-игры `…/m1.html`–`…/m3.html`.
- Документы-артефакты: мини-игры https://claude.ai/artifact/PdCvJkVHETNrJGTTPoyQku · ТЗ уровня 1 https://claude.ai/artifact/HuwbdGpa4ChYkohnPWqQJ8 · позы героев https://claude.ai/artifact/4S9QqPLhejcH1cHSmYoBSF · анимации https://claude.ai/artifact/KP9H1An5ZKgQhwxjdDLSK1 · озвучка https://claude.ai/artifact/Nc8XXCGsjJmxcvG9PJ7yZf

## Правила игры
- Сначала немецкий: подсказка два раза по-немецки, потом русская. Повтор фразы: образец, образец, «Sag es nach!» + образец, русская подсказка + образец.
- Микрофон засчитывает любой звук голоса или нажатие синей кнопки; слова не распознаются.
- Текста на экране нет (только картинки, значки, цифры). Без чужих брендов. Новых персонажей из ChatGPT не добавлять, остальных рисовать кодом.
- Конец уровня: Эмили считает косточки цифра за цифрой, они падают в сундучок (баланс виден только на карте). Мини-игры пока бесплатны, потом будут за косточки (`Wallet.spend`).

## Озвучка (ElevenLabs, подключение в сессии)
- Любая новая фраза сразу озвучивается, без вопроса. Синтезатор браузера — только временная замена.
- Голоса (voice_id): ведущая и русские подсказки — Skittle Bee `xLCJR8xcZX2YjImGFyGw`; Эмили — Tilly `MkTSSXNgnBULS6ek4pon`; Марк — Tilly +5 полутонов (ключи `k_…`, делается автоматически); Изабель — Gungun `nfMYisZqs1GOjTFllho3`; Пауль — Prayan `p7nMaiIUHqy2txuz7pTB`; Heike — Rhea `m6hUIEYgmiiZhDVrbFQM`; Frau Becker — Irene `NkMe1eztMQReztnhYfeX`; продавец — Balduin `mxKT7i54GxdxU105gJrm`; всё по слогам и кусочками — Barbara Brave – TV Narrator `SfNQWfFVL6TQ3DIRvFyM` (eleven_multilingual_v2, без тегов). Eleonore не использовать.
- Фразы персонажей: модель eleven_v3, теги эмоций в начале, 1 вариант. Одна генерация на фразу; если пришёл общий файл — нарезать по тишине, файлы определять по имени голоса и числу фраз в блоке.
- Импорт: `python3 tools/voice_import.py --map keymap.txt status.json…` (обрезка тишины, 24 кГц моно mp3 в `assets/snd/`, ключи в `art/voice_new.json`), ключ добавить в `SND` уровня; `node tools/voice_check.js` → 0 фраз без записи.
- Распознавание речи (speech-to-text) НЕ использовать — дорого. Ключи API не сохранять в репозиторий.

## Экономия
- Делать один раз в общем коде (`js/`), не копировать по уровням.
- Не гонять долгие проверки и автопрогоны: максимум одна короткая проверка. На телефоне (844×390, гонки m1 — 390×844) и iPad (1180×820) Игорь проверяет сам.

## Текущая задача: три уровня повторения (пока только уровень 2 «Spielplatz»)
- Сделано: настройка на карте (Лёгкий по умолчанию / Средний / Обычный). Лёгкий — сложные фразы кусочками: облачко с точками над Эмили, кусочек говорит Barbara, любой звук = точка горит, потом Эмили говорит фразу целиком. Средний — запись Эмили медленнее (0.8, высота сохраняется). Код `js/repeat.js` (заменяет repeatAfter уровня, подключён только в `l2.html`), деление и записи 23 кусочков — `js/chunks.js`.
- Осталось: Игорь проверяет на телефоне и iPad; сверить на слух 5 фраз знакомства (тексты восстановлены по сцене: Hallo! Ich heiße Emily. / Ich bin fünf Jahre alt. / Das ist mein Bruder Mark. / Das ist mein Hund Theo. / Darf ich mitspielen?) и «hinter dem Sandkasten»; после одобрения — перенести на остальные уровни (подключить `chunks.js` + `repeat.js`, добавить деление их фраз в `js/chunks.js`, озвучить кусочки Barbara).
