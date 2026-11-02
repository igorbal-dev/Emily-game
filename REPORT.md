# Отчёт: новые уровни (с 2.11)

Пишется после каждого готового уровня. Простым языком.

## Нарезка фраз в старых уровнях — исправлено

На «Лёгком» уровне длинные фразы Эмили повторяет кусочками. Проверил все кусочки (файл `js/chunks.js`, общий для всех уровней) по новым правилам: каждый кусочек должен значить то же, что вся фраза; «nicht» не отрывать от глагола; приставку не отрывать (gib … zurück, mach … kaputt); короткие фразы не делить.

| Уровень | Фраза | Было | Стало |
|---|---|---|---|
| 7 Eisdiele | Ich war zuerst da. Bitte stell dich hinten an. | Ich war … / zuerst da. / Bitte stell dich … / hinten an. | Ich war zuerst da. / Bitte stell dich hinten an. |
| 11 Ballspiel | Ich spiele auch mit! | Ich spiele … / auch mit! | целиком (короткая, «mit» — приставка) |
| 15 Supermarkt | Theo, bleib hier! Wir kommen gleich wieder. | … / Wir kommen … / gleich wieder. | Theo, bleib hier! / Wir kommen gleich wieder. |
| 19 Stopp! | Stopp! Das mag ich nicht! | Stopp! / Das mag ich … / nicht! | Stopp! / Das mag ich nicht! |
| 19 | Nicht schubsen! | Nicht … / schubsen! | целиком |
| 19 | Lass meinen Bruder in Ruhe! Gib den Ball zurück! | 4 кусочка («Gib den Ball …» / «zurück!») | Lass meinen Bruder in Ruhe! / Gib den Ball zurück! |
| 19 | Siehst du? Das ist nicht schön! | … / Das ist … / nicht schön! | Siehst du? / Das ist nicht schön! |
| 19 | Heike! Leon macht meine Burg kaputt! | … / Leon macht … / meine Burg kaputt! | Heike! / Leon macht meine Burg kaputt! |
| 19 | Okay. Aber mach das nicht mehr! | … / Aber mach das … / nicht mehr! | Okay. / Aber mach das nicht mehr! |
| 20 | Nein! Ich bin nicht blöd. Das ist nicht nett! | Nein! Ich bin … / nicht blöd. / Das ist … / nicht nett! | Nein! / Ich bin nicht blöd. / Das ist nicht nett! |
| 20 | Nein, jetzt nicht. | Nein … / jetzt nicht. | целиком |
| 22 | Haha! Jetzt bin ich dran! | Haha! / Jetzt bin ich … / dran! | Haha! / Jetzt bin ich dran! |

Кусочки на всех уровнях, кроме 2, говорит немецкий голос телефона (так было и раньше), поэтому переозвучивать ничего не нужно. Уровень 2 (кусочки записаны) — там ошибок не было.

## Уровень 24 «Sankt Martin» — готов (озвучка: Chatterbox)

**Где:** садик днём (мастерим фонарики) → двор садика вечером (шествие с фонариками).
**Что происходит:**
1. Хайке раздаёт фонарики — Эмили сама выбирает цвет (красный, жёлтый, синий, зелёный — название совпадает с цветом) и говорит «Ich möchte die gelbe Laterne!».
2. **Конфликт:** Пауль хватает фонарик Эмили. Шаг 1 — вежливо: «Paul, gib mir bitte meine Laterne zurück.» — Пауль: «Nein! Die ist jetzt meine!». Шаг 2 — твёрже и громче: «Nein! Das ist meine Laterne!» — пока Эмили говорит, Пауль отступает тем дальше, чем громче её голос; если тихо — «Lauter! Sag es mit fester Stimme!». Пауль отдаёт фонарик.
3. Оказалось, фонарик Пауля порван. Две картинки: посмеяться (мягко: «Auslachen ist nicht nett») или позвать с собой. Эмили: «Paul, komm! Wir gehen zusammen.», Пауль: «Entschuldigung», Эмили: «Schon gut. Wieder Freunde?» — мирятся.
4. Вечер: зажигаем 5 фонариков по одному (считаем до 5), идём шествием под свою тихую мелодию, Эмили говорит народный стишок «Laterne, Laterne, Sonne, Mond und Sterne!», находим луну, считаем 3 звезды.
5. Две булочки Weckmann на четверых детей — ломаем пополам («Wir teilen! Jeder bekommt eine Hälfte.»), раздаём и считаем 4 половинки. Как Святой Мартин — поделились.

**Лестница:** до шага 2. **Счёт:** 1–5, 1–3, 2 → 4 половинки.
**Кусочки (Лёгкий):** «Paul, komm! | Wir gehen zusammen.», «Schon gut. | Wieder Freunde?», «Nein! | Das ist meine Laterne!», «Laterne, Laterne, … | Sonne, Mond und Sterne!», «Wir teilen! | Jeder bekommt eine Hälfte.»
**Заглушки картинок:** Пауль грустный = стоит + слёзы; фонарики нарисованы кодом и «висят» у руки. Задание на позы — `for_chatgpt/CONFLICT_POSES.md`.

## Уровень 25 «Ochs am Berg» — готов

**Где:** сад садика, большое осеннее дерево, линия старта мелом.
**Что происходит:**
1. Кто водит? Абиха: «Wer fängt an?». Эмили говорит народную считалку «Ene, mene, muh, und raus bist du!», палец бегает по детям — водит Пауль.
2. Пауль у дерева говорит «Eins, zwei, drei – Ochs am Berg!». **Пока он говорит — нажимаем на Эмили**, она делает шаг и сама считает шаги (1…6). Пауль обернулся — нажимать нельзя, иначе «Ich habe dich gesehen! Zurück zum Start!» (мягко: после 8 кругов Эмили всё равно доходит).
3. **Неправа Эмили:** во втором круге она качнулась сама, Пауль: «Du hast dich bewegt! Zurück zum Start!» — Эмили честно: «Stimmt. Entschuldigung.» и идёт на старт.
4. Дошла — «Angeschlagen! Jetzt bin ich dran!». Теперь водит Эмили: сама говорит спруч, оборачивается. Изабель шевельнулась — находим её нажатием, Эмили: «Isabel, du hast dich bewegt! Zurück zum Start!» — Изабель: «Gar nicht!» — **шаг 2**, громче: «Doch! Ich habe es gesehen.» — Изабель уходит на старт. Абиха добегает и «осаливает» Эмили, все смеются.

**Лестница:** шаг 2 (спор о правилах). **Счёт:** шаги 1–6.
**Кусочки:** «Ene, mene, muh, … | und raus bist du!», «Eins, zwei, drei … | Ochs am Berg!», «Isabel, … | du hast dich bewegt! | Zurück zum Start!», «Doch! | Ich habe es gesehen.», «Stimmt. Entschuldigung.» — целиком.
**Заглушки:** водящий стоит «к дереву» без отдельной картинки «спиной» (в задании ChatGPT — поза stand_back).

## Уровень 26 «Kreide» — готов (вся лестница до шага 4)

**Где:** двор садика, асфальт, коробка мелков.
**Что происходит:**
1. Эмили рисует солнце: выбираем жёлтый мелок (другой цвет — «Nicht diese Farbe. Die Sonne ist gelb!»), «Die Sonne ist gelb.», 5 лучей — считаем.
2. **Конфликт до конца лестницы.** Пауль забирает розовый мелок.
   - Шаг 1: «Paul, das ist meine Kreide. Gib sie mir bitte zurück.» — «Ich brauche sie aber!»
   - Шаг 2 (громче): «Nein! Frag bitte zuerst!» — «Pff!» — и он прыгает прямо по рисунку, солнце размазывается.
   - Шаг 3 (ладонь вперёд, ещё громче): «Stopp! Hör auf! Ich will das nicht!» — Пауль хихикает и прыгает дальше.
   - Что делать? Три картинки: толкнуть («Nein! Emily schubst nicht. Die Hände bleiben bei dir.»), плакать («Weinen hilft nicht. Tu etwas!»), позвать Хайке — верно.
   - Шаг 4: «Heike, Paul macht mein Bild kaputt!» — Хайке: «Frag Emily, ob du mitmalen darfst.» — Пауль: «Entschuldigung. Darf ich mitmalen?» — Эмили: «Ja! Du kannst die blaue Kreide haben.» Мелок возвращается, солнце снова яркое.
3. **Неправа Эмили:** её зелёный мелок сломан, она просто берёт мелок Изабель — «Hey! Das ist meine Kreide!». Картинки: убежать с мелком (нечестно) / спросить. «Entschuldigung. Darf ich die grüne Kreide haben?» — «Ja, klar! Hier.»
4. Рисуем цветок: стебель и 6 лепестков (считаем). Абиха: «Darf ich auch mitmalen?» — «Klar! Wir malen alle zusammen.»

**Счёт:** 5 лучей, 6 лепестков.
**Кусочки:** «Stopp! | Hör auf! | Ich will das nicht!» («nicht» вместе с «will»), «Heike, … | Paul macht mein Bild kaputt!» («kaputt» не отрываем), «Nein! | Frag bitte zuerst!», «Entschuldigung. | Darf ich … | die grüne Kreide haben?»

## Уровень 27 «Stopptanz» — готов

**Где:** зал для движения в садике (шведская стенка, флажки, скамейка).
**Что происходит:**
1. Хайке объясняет правило: музыка играет — танцуем, музыка стоп — стоим как статуя. Музыка своя (простая мелодия кодом, не чужая песня).
2. Эмили — ди-джей: жмёт на красную кнопку (музыка), ещё раз — тишина. Кто шевельнулся? Находим Пауля. «Paul, du hast dich bewegt! Du bist raus.» — «Das gilt nicht! Die Musik war noch an!» — **шаг 2**, громче: «Doch! Die Musik war aus. Das ist die Regel.» Пауль садится на скамейку. Сколько детей ещё танцуют? (выбор числа — 3)
3. По очереди: теперь музыку включает Пауль, Эмили танцует.
4. **Принять извинение:** Изабель в танце случайно толкнула Эмили — «Oh! Entschuldigung, Emily!» — Эмили: «Schon gut!»
5. **Попросить прощения (неправа Эмили):** Эмили наступила Абихе на ногу — «Aua!» — «Entschuldigung, Abiha! Tut es weh?» — «Nein, schon gut.»
6. Абиха засмеялась и выбыла — сколько осталось (2). Эмили и Изабель победили, Эмили делает пируэт.

**Лестница:** шаг 2. **Счёт:** сколько детей осталось (3, 2).
**Кусочки:** «Doch! | Die Musik war aus. | Das ist die Regel.», «Paul, … | du hast dich bewegt! | Du bist raus.», «Entschuldigung, Abiha! | Tut es weh?», «Schon gut!» — целиком.

## Уровень 28 «Memory mit Mark» — готов

**Где:** дома, ковёр в комнате, Тео лежит у дивана.
**Что происходит:**
1. Настоящая игра Memory: 12 карточек (6 пар: Тео, мяч, яблоко, солнце, машинка, звезда). Эмили: «Ich bin dran!» — открываем по две, ищем пары. Пара уходит в стопку Эмили.
2. **Конфликт с братом (до шага 3):** приходит Марк и хватает карточки («Meins!»), они разлетаются и перемешиваются.
   - Шаг 1: «Mark, bitte nicht die Karten nehmen.» — не помогает.
   - Шаг 2 (громче): «Nein, Mark! Das ist mein Spiel.» — снова хватает.
   - Шаг 3 (ладонь): «Stopp, Mark! Hör auf!» — Марк останавливается и грустит: «Mark auch!»
   - Картинки: прогнать Марка / играть вместе. Эмили: «Komm, Mark. Wir spielen zusammen.»
3. Дальше по очереди: «Jetzt bist du dran, Mark!» — Марк сам открывает карточки и тоже находит пары.
4. В конце нажимаем на стопки и считаем пары Эмили и Марка, кто больше; «Toll gemacht, Mark!»

**Лестница:** до шага 3 (взрослый не нужен — малыш останавливается). **Счёт:** пары, сравнение.
**Кусочки:** «Mark, … | bitte nicht die Karten nehmen.» («nicht» вместе с «nehmen»), «Nein, Mark! | Das ist mein Spiel.», «Stopp, Mark! | Hör auf!», «Komm, Mark. | Wir spielen zusammen.», «Ich bin dran!» — целиком.

