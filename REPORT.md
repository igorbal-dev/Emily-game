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

## Уровень 29 «Seilspringen» — готов

**Где:** двор садика (тот же асфальт, что в «Kreide» — фон теперь общий, `drawYard` в `js/scenes.js`).
**Что происходит:**
1. Эмили и Абиха крутят скакалку, Изабель прыгает. Эмили говорит народную считалку «Teddybär, Teddybär, dreh dich um!» — Изабель кружится.
2. Считаем прыжки Изабель (Эмили считает вслух до 7), на восьмом она запуталась. Изабель хвастается: «Ich habe zwanzig geschafft!» — выбираем число, сколько было на самом деле (7). «Nein, das stimmt nicht. Es waren sieben.» — «Doch! Zwanzig!» — **шаг 2**, громче: «Nein! Ich habe mitgezählt. Es waren sieben.» — «Okay … sieben.»
3. **Дразнилка:** «Jetzt möchte ich springen!» — «Du bist zu klein! Du kannst das nicht!» — «Doch! Ich kann das!» — «Hihi! Nein, kannst du nicht!» — **шаг 2**: «Hör auf! Das ist nicht nett. Ich will es probieren!»
4. Эмили прыгает сама: верёвка крутится, когда она внизу — Эмили светится, нажимаем — прыжок (5 прыжков, считаем). Не успела — ничего страшного, верёвка просто идёт дальше.
5. Изабель: «Wow! Du kannst das ja wirklich! Entschuldigung, Emily.» — «Schon gut. Wieder Freunde?» — «Ja!»

**Лестница:** шаг 2 (два раза). **Счёт:** 1–7, выбор числа, 1–5.
**Кусочки:** «Teddybär, Teddybär, … | dreh dich um!» (приставка «um» с глаголом), «Hör auf! | Das ist nicht nett. | Ich will es probieren!», «Nein! | Ich habe mitgezählt. | Es waren sieben.», «Doch! Ich kann das!» — целиком.

## Уровень 30 «Arzt spielen» — готов

**Где:** уголок ролевых игр в группе (табличка с красным крестом, кушетка).
**Что происходит:**
1. Стетоскоп один. **Неправа Эмили:** она быстро хватает его, а Абиха хотела первой — «Hey! Ich wollte das Stethoskop zuerst haben!». Картинки: оставить себе / отдать. «Entschuldigung. Du kannst zuerst.»
2. Абиха — врач: «Wo tut es weh?» — «Mein Bauch tut weh.» Абиха слушает сердце: нажимаем на сердечко 5 раз и считаем удары. «Alles gut! Du bist gesund.»
3. Меняемся ролями: «Jetzt tauschen wir! Jetzt bin ich die Ärztin.»
4. Пауль: «Aua! Frau Doktor!» — Эмили сама спрашивает «Wo tut es weh?» — «Mein Knie tut weh.» — нажимаем Паулю на коленку, пластырь.
5. **Договориться:** Изабель тоже хочет быть врачом: «Gib mir den Koffer!» — Эмили: «Wir können tauschen. Erst ich, dann du.» — лечим Изабель голову (нажать на голову, холодный компресс), потом Эмили сама отдаёт чемоданчик: «Jetzt bist du dran. Hier, bitte!»

**Лестница:** шаг 1 хватило (договорились словами). **Счёт:** 5 ударов сердца. **Новые слова:** Bauch, Knie, Kopf, Ärztin, tauschen.
**Кусочки:** «Entschuldigung. | Du kannst zuerst.», «Wir können tauschen. | Erst ich, … | dann du.», «Jetzt tauschen wir! | Jetzt bin ich … | die Ärztin.» (артикль со словом), «Mein Bauch tut weh.» и «Wo tut es weh?» — целиком.

## Уровень 31 «Stille Post» — готов

**Где:** утренний круг в группе садика.
**Новое в игре:** здесь надо говорить **тихо**. Микрофон проверяет, что Эмили шепчет: если громко — «Psst! Leiser! Du musst flüstern!» и ещё раз (мягко, после 4 попыток игра идёт дальше). Это общий код `T.soft` в `js/firm.js`.
**Что происходит:**
1. Считаем детей в кругу (4). Хайке объясняет правило.
2. Слово идёт по кругу: Хайке → Абиха → Эмили; Эмили шепчет Паулю «Theo mag Kekse.», а Изабель в конце говорит вслух «Theo mag Hexe!» — все смеются.
3. **Конфликт:** во втором круге Пауль выкрикивает слово: «DIE KATZE SCHLÄFT!» — Абиха: «Oh nein! Jetzt wissen es alle!». Шаг 1: «Psst, Paul! Du musst flüstern.» — «Aber laut ist lustiger!» — **шаг 2**, твёрдо: «Nein, Paul. Bei Stiller Post flüstert man. Das ist die Regel.» — «Okay, ich flüstere.»
4. Третий круг: «Der Mond ist gelb.» доходит правильно — «Richtig! Diesmal hat es geklappt!»

**Лестница:** шаг 2. **Счёт:** дети в кругу (4).
**Кусочки:** «Psst, Paul! | Du musst flüstern.», «Nein, Paul. | Bei Stiller Post … | flüstert man. | Das ist die Regel.», короткие фразы-слова («Theo mag Kekse.») — целиком.

## Уровень 32 «Ich sehe was, was du nicht siehst» — готов

**Где:** группа садика: на ковре и полке 8 вещей — красные (мяч, яблоко), синие (стул, машинка), жёлтые (утка, банан), зелёные (лягушка, лист). Цвет на экране = цвет в словах.
**Что происходит:**
1. Пауль: «Ich sehe was, was du nicht siehst, und das ist rot!» — нажимаем на красную вещь (не красная — «Das ist nicht rot. Schau genau!»), Эмили спрашивает «Ist es der Ball?» — «Nein!», «Ist es der Apfel?»
2. **Пауль жульничает:** «Nein! Es ist der Stuhl!» — а стул синий. Шаг 1: «Paul, der Stuhl ist nicht rot. Das gilt nicht!» — «Doch! Der Stuhl!» — **шаг 2**, громче: «Nein! Du hast geschummelt. Der Stuhl ist blau.» — Пауль признаётся: «Okay … es war der Apfel. Entschuldigung.»
3. Считаем красные вещи (2).
4. Загадывает Эмили: сама выбирает жёлтую или зелёную вещь и говорит «Ich sehe was, was du nicht siehst, und das ist gelb/grün!». Пауль сначала ошибается — «Nein, das ist es nicht.», потом угадывает — «Ja, richtig! Jetzt bist du dran.»

**Лестница:** шаг 2. **Счёт:** 2 красные вещи.
**Кусочки:** «Paul, … | der Stuhl ist nicht rot. | Das gilt nicht!», «Nein! | Du hast geschummelt. | Der Stuhl ist blau.», «Nein, … | das ist es nicht.» («nicht» с глаголом), «Ich sehe was, … | was du nicht siehst, … | und das ist gelb!»

## Уровень 33 «Himmel und Hölle» — готов

**Где:** двор садика, на асфальте мелом нарисованы классики (клетки 1–8).
**Что происходит:**
1. Абиха: «Wer fängt an? Macht Schnick Schnack Schnuck!» — Эмили говорит «Schnick, Schnack, Schnuck!» и сама выбирает руку: ножницы, камень или бумагу. Эмили выигрывает и начинает.
2. **Влезла без очереди (до шага 3, без взрослого):** Изабель встаёт первой: «Ich fange an! Ich bin schneller!»
   - Шаг 1: «Isabel, ich bin dran. Ich habe gewonnen.» — «Egal!»
   - Шаг 2 (громче): «Nein! Du hast verloren. Stell dich hinten an.» — «Aber ich will zuerst!»
   - Шаг 3 (ладонь): «Stopp, Isabel! Das ist nicht fair!» — «Okay … Entschuldigung. Du bist dran.»
3. Эмили прыгает: нажимаем на клетки по порядку, Эмили считает 1…6. **Неправа Эмили:** на шестой наступила на линию — «Du bist auf die Linie getreten!» — честно: «Stimmt. Jetzt bist du dran.»
4. Прыгает Изабель, Эмили считает до 8. Изабель: «Danke, Emily! Du spielst fair.» Абиха просится — «Klar! Du bist nach Isabel dran.»

**Лестница:** до шага 3 (без взрослого). **Счёт:** 1–8.
**Кусочки:** «Nein! | Du hast verloren. | Stell dich hinten an.» («an» не отрываем), «Stopp, Isabel! | Das ist nicht fair!» («nicht» вместе), «Stimmt. | Jetzt bist du dran.», «Schnick, Schnack, Schnuck!» — целиком.

## Уровень 34 «Mama, Papa, Kind» — готов

**Где:** кукольный уголок в садике (игрушечная плита, стол, кукла).
**Что происходит:**
1. Изабель и Пауль играют в «маму, папу и ребёнка». Эмили: «Darf ich mitspielen?» — **«Nein! Du darfst nicht mitspielen!»**
2. Лестница:
   - Шаг 1: «Bitte! Ich kann das Baby sein.» — «Nein! Wir haben schon ein Baby. Die Puppe!»
   - Шаг 2 (громче): «Das ist nicht nett. Ich will auch mitspielen!» — «Trotzdem nein!»
   - Что делать? Картинки: уронить куклу (нет), плакать (нет), позвать Хайке.
   - Шаг 4: «Heike, Isabel sagt, ich darf nicht mitspielen.» — Хайке: «Bei uns dürfen alle mitspielen. Emily kann die große Schwester sein.»
3. Играем: «Danke! Was kochen wir?» — суп. Накрываем стол: считаем 4 тарелки (мама, папа, сестра, малыш), «Guten Appetit!»
4. **Теперь Эмили на месте Изабель:** Абиха просится «Darf ich auch mitspielen?» — Эмили сама говорит «Ja, klar! Du kannst die Oma sein!». Ещё тарелка — сколько теперь (5). Изабель: «Entschuldigung, Emily. Mit dir ist es viel lustiger.» — «Schon gut. Wieder Freunde?»

**Лестница:** шаги 1, 2 и 4 (взрослый). **Счёт:** 4, потом 5 тарелок.
**Кусочки:** «Heike, … | Isabel sagt, … | ich darf nicht mitspielen.» («nicht» вместе с «mitspielen»), «Das ist nicht nett. | Ich will auch mitspielen!», «Darf ich mitspielen?» и «Guten Appetit!» — целиком.

## Уровень 35 «Kastanien und Blätter» — готов

**Где:** осенний парк, прогулка садика (Хайке, Абиха, Изабель, Пауль). Ноябрь — Эмили в куртке.
**Что происходит:**
1. Собираем каштаны в ведёрко: нажимаем на каждый, считаем до 8.
2. Эмили находит огромный каштан — **Пауль его отбирает**: «Die gehört jetzt mir!» Шаг 1: «Paul, die habe ich gefunden. Gib sie mir bitte zurück.» — «Ich habe sie aber jetzt!» — **шаг 2**: «Nein! Das ist meine Kastanie. Gib sie zurück!» — отдаёт. Потом Эмили по-доброму: «Komm, wir suchen zusammen eine für dich!» — находим Паулю большой каштан.
3. Листья: красные, жёлтые, коричневые — нажимаем лист нужного цвета, «Das Blatt ist rot / gelb / braun.»
4. **Неправа Эмили:** она с разбега прыгает в кучу листьев, которую сложил Пауль, — куча рассыпалась, Пауль плачет. Картинки: засмеяться и убежать / помочь. «Entschuldigung! Ich helfe dir. Wir bauen ihn zusammen wieder auf.» — собираем кучу (5 нажатий, счёт), потом прыгают в неё вместе.

**Лестница:** шаг 2. **Счёт:** 8 каштанов, 5. **Цвета:** rot, gelb, braun.
**Кусочки:** «Nein! | Das ist meine Kastanie. | Gib sie zurück!» («zurück» с глаголом), «Entschuldigung! | Ich helfe dir. | Wir bauen ihn zusammen wieder auf.» («auf» не отрываем — длинный кусок целиком).

## Уровень 36 «Würfelspiel» — готов

**Где:** стол в группе, настольная игра: дорожка из 12 кружков к домику, кубик, две фишки.
**Новое:** учимся **проигрывать и выигрывать** по-доброму.
**Что происходит:**
1. Пауль: «Du darfst anfangen, Emily!» Эмили нажимает на кубик, выбираем, сколько точек (из трёх чисел), Эмили говорит «Ich habe eine Vier!», фишка шагает — считаем шаги. «Jetzt bist du dran, Paul!» — Пауль бросает сам.
2. Первый раунд выигрывает Пауль и дразнится: «Ich habe gewonnen! Ätsch, du hast verloren!» Эмили грустно. Картинки: сбросить игру со стола (нет), плакать (нет), сказать «Gut gespielt!» (да).
3. Эмили: «Schade! Aber gut gespielt, Paul.» и — шаг 1 — «Paul, Ätsch sagt man nicht. Das ist nicht nett.» — «Stimmt. Entschuldigung. Du hast auch gut gespielt!» — «Noch mal? Nächstes Mal gewinne ich!»
4. Второй раунд: Эмили выбрасывает шестёрку и выигрывает — и сама хвалит: «Juhu! Und du hast auch gut gespielt, Paul.»

**Лестница:** шаг 1 (вежливо остановить «Ätsch»). **Счёт:** точки на кубике 2–6, шаги фишки.
**Кусочки:** «Paul, … | Ätsch sagt man nicht. | Das ist nicht nett.» (оба «nicht» со своими глаголами), «Schade! | Aber gut gespielt, … | Paul.», «Ich habe eine Vier!» — целиком.

