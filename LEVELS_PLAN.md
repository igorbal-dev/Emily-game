# План новых уровней (2.11)

## Что уже есть (не трогаем)

| № | Название | Что происходит | Фразы / счёт |
|---|---|---|---|
| 0 | Hallo! | здороваемся, называем себя | Hallo, Tschüss; 1–3 |
| 1 | Verstecken | прятки дома: шкаф, диван, стол, коробка | unter, hinter, in; до 10 |
| 2 | Spielplatz | знакомство с Изабель и Паулем, прятки на площадке | Darf ich mitspielen?; до 10 |
| 3 | Bäckerei | пекарня: заказ, число, оплата | … bitte. Danke!; +1, деньги |
| 4 | Geburtstag | подарок, 6 свечей, торт на четверых | Alles Gute!; 6, делить |
| 5 | Sandkasten | делимся лопаткой, «больше / поровну» | Wir können teilen |
| 6 | Kita-Morgen | утро в садике: туфли, крючок, руки, завтрак | Guten Morgen!; пары |
| 7 | Eisdiele | очередь, мороженое, цвета, оплата | rosa, rot, lila; Ich war zuerst da |
| 8 | Kita-Weg | светофор, машины | Rot heißt stehen |
| 9 | Aufräumen | уборка с Марком по цветам | Gib mir bitte…; 3+3+3 |
| 10 | Obstmarkt | рынок, фрукты, «сколько осталось» | der Apfel; минус один |
| 11 | Ballspiel | бросаем мяч, зовём Марка | Fang! Spiel mit!; до 7 |
| 12 | Turnen | спортзал с Хайке, команды | Alle springen!; до 5 |
| 13 | Wer ist dran? | очередь на качели и горку, извиняемся | Darf ich…? Du zuerst! |
| 14 | Zu Besuch bei Paul | в гостях у Пауля, вежливость со взрослой | Guten Tag! Ja, bitte. |
| 15 | Im Supermarkt | список покупок, спросить продавца, заплатить | Wo ist…? |
| 16 | Ich brauche Hilfe | садик: просим помощи, жалеем друга, туалет | Kannst du mir helfen? |
| 17 | Neue Nachbarin | знакомство с Софией во дворе | Wie alt bist du? Und du? |
| 18 | Sofia kommt raus | кукла, любимые цвет/еда/музыка, балет | Ich esse gern … |
| 19 | Stopp! | Леон кидает песок, толкает, отбирает мяч у Марка, ломает замок | Stopp! Hör auf! |
| 20 | Wir spielen alle zusammen | «Nicht hauen!», зовём Хайке, чувства, мир | Ich bin traurig. |
| 21 | Abiha ist wieder da! | Абиха вернулась из отпуска | Wo warst du? |
| 22 | Wir spielen draußen | с Абихой: одеваемся, горка, качели, песочница, бег | Kannst du mich anschubsen? |
| 23 | Jahreszeiten | времена года, Николаус, горы | Ich mag den Winter am liebsten! |
| m1–m5 | мини-игры | гонки, Тео ловит косточки, догонялки, качели (счёт до 10), футбол | |

Уже были места: дом, площадка, песочница, пекарня, кафе-мороженое, улица, рынок, спортзал, магазин, гости, двор, группа садика.
Уже были конфликты: отобранный мяч, песок, толчок, сломанный замок, обзывание, «не играйте с Эмили» (Леон, 19–20); очередь на качели/горку (13), мороженое (7).
**Значит, в новых уровнях:** новые места (вечер с фонариками, сад садика с игрой, асфальт с мелками, зал для танцев, дом за настольной игрой, уголок «доктор»), новые игры по правилам и новые типы фраз — споры о правилах («Das gilt nicht!», «Du hast geschummelt!», «Du bist dran!»), «отдай мою вещь» по лестнице, принять и попросить прощения, договориться («Erst ich, dann du»).

Голоса — Chatterbox (образцы `tools/chatterbox/voices/`): ведущая `narr`, русская подсказка `narr_ru` (ru), Эмили `emily2`, Марк — Эмили +5 полутонов, Абиха `abiha2`, Изабель `isabel`, Пауль `paul`, Хайке `heike`.
Воспитательница во всех новых уровнях — **Хайке** (она уже есть в игре, картинки `sommer_*`). Duygu, Ivonne, Dominique, Anika в игре нет — без картинок и голоса не вводим (задание на картинки — `for_chatgpt/`).

**Лестница настойчивости** — общий код `js/firm.js`: шаг 1 обычный повтор; шаги 2–3 — `T.firm()`: нужно сказать громче (порог громкости), чем громче — тем дальше отступает обидчик; после 3 попыток игра всё равно идёт дальше; шаг 4 — позвать Хайке.

## Новые уровни — что сделано (2.11)

Сделаны 19 уровней: 24 Sankt Martin, 25 Ochs am Berg, 26 Kreide, 27 Stopptanz, 28 Memory mit Mark, 29 Seilspringen, 30 Arzt spielen,
31 Stille Post, 32 Ich sehe was, 33 Himmel und Hölle (Schnick Schnack Schnuck), 34 Mama-Papa-Kind («Du darfst nicht mitspielen!»),
35 Kastanien und Blätter, 36 Würfelspiel (проигрывать и выигрывать), 37 Kuscheltiertag (говорить перед группой, своё «нет»),
38 Feuer-Wasser-Sturm («не пускают»), 39 Kasperletheater, 40 Laufrad (до десяти — и меняемся), 41 Musikkreis («Das ist zu laut»), 42 Puzzle.
Идея 33 «Bauklötze» не делалась — похожа на 28 (Марк мешает). Подробности по каждому — `REPORT.md`.

Запас идей на следующие уровни (не повторяют сделанное): Garderobe — перепутали шапку («Das ist meine Mütze. Deine ist blau.»);
Fangen с правилом «кто водит» и «Ich brauche eine Pause»; Laubhaufen в дождь (Matschhose, лужи без Леона); Adventskalender (декабрь, счёт до 24);
Weihnachtsbasteln; Turnhalle-Hindernislauf (очередь и подбадривание «Du schaffst das!»).

## Исходный план идей

### 24 «Sankt Martin» — Laternenlauf (садик, вечер) — первым, к 11.11
- **Место:** группа садика (мастерим фонарики) → двор садика вечером, темно, шествие.
- **Игра/ситуация:** выбираем цвет фонарика (4 цвета, название = цвет на экране), зажигаем фонарики всем детям, идём шествием, говорим народный стишок «Laterne, Laterne, Sonne, Mond und Sterne!», в конце делим Weckmann (булочка-человечек), как Святой Мартин поделился плащом.
- **Конфликт:** Пауль хватает фонарик Эмили → **шаг 1** «Paul, gib mir bitte meine Laterne zurück.» → не помогло → **шаг 2** (громче) «Nein! Das ist meine Laterne!» → Пауль отдаёт. Потом у Пауля фонарик порвался: выбор картинкой (посмеяться / позвать идти вместе) → «Komm, wir gehen zusammen!» → мирятся «Wieder Freunde?» — «Ja!»
- **Счёт:** зажигаем 5 фонариков по одному (eins…fünf); 2 булочки на 4 детей — пополам, сколько половинок (4).
- **Кусочки:** «Paul, gib mir bitte … | meine Laterne zurück.» — НЕТ, «zurück» не отрываем → «Paul, | gib mir bitte meine Laterne zurück.»; «Nein! | Das ist meine Laterne!»; «Laterne, Laterne, … | Sonne, Mond und Sterne!»; «Komm, | wir gehen zusammen!»
- **Герои:** Эмили, Абиха, Пауль, Изабель, Хайке. **Не хватает:** Эмили/дети с фонариком в руке (фонарик рисуем кодом рядом с рукой), Пауль грустный/сердитый (заглушка — idle + слёзы).

### 25 «Ochs am Berg» (сад садика)
- **Игра:** считалочка «Ene, mene, muh, und raus bist du!» — Эмили сама «считает» детей пальцем (нажимаем на детей по словам), кто водит. Потом «Eins, zwei, drei — Ochs am Berg!»: водящий отворачивается, остальные крадутся; повернулся — все замирают. Эмили крадётся (жмём «шаг», пока водящий считает) и сама водит.
- **Конфликт (шаг 2):** Изабель шевельнулась, когда Эмили обернулась: «Isabel, du hast dich bewegt! Zurück zum Start!» — «Gar nicht!» — **шаг 2** громче «Doch! Ich habe es gesehen.» — «Na gut.» **Неправа Эмили:** побежала до конца счёта — Пауль: «Du bist zu früh losgelaufen!» → «Stimmt. Entschuldigung.» и шаг назад.
- **Счёт:** шаги до водящего (сколько шагов осталось: 5→0), считалочка по словам.
- **Кусочки:** «Ene, mene, muh, … | und raus bist du!»; «Eins, zwei, drei … | Ochs am Berg!»; «Isabel, | du hast dich bewegt! | Zurück zum Start!»; «Doch! | Ich habe es gesehen.»; «Stimmt. | Entschuldigung.»
- **Герои:** Эмили, Изабель, Пауль, Абиха. **Не хватает:** дети спиной (водящий отвернулся — заглушка: зеркально + затемнение лица нельзя → ставим водящего к дереву «носом», заглушка — поворот без лица).

### 26 «Kreide» — рисуем мелками на асфальте (двор садика) — полная лестница до шага 4
- **Игра:** Эмили рисует мелками: выбираем мелок нужного цвета (жёлтый — солнце, синий — небо/вода, зелёный — трава), рисуем 5 лучей солнца (считаем).
- **Конфликт до шага 4:** Пауль берёт её розовый мелок → **1** «Paul, das ist meine Kreide. Gib sie mir bitte zurück.» → «Ich brauche sie aber!» → **2** «Nein! Frag bitte zuerst!» → Пауль наступает и растирает рисунок → **3** ладонь, громко «Stopp! Hör auf! Ich will das nicht!» → он хихикает и продолжает → **4** «Heike, Paul macht mein Bild kaputt!» → Хайке: «Paul, frag Emily, ob du mitmalen darfst.» → «Entschuldigung. Darf ich mitmalen?» → «Ja! Du kannst die blaue Kreide haben.»
- **Неправа Эмили:** берёт зелёный мелок Изабель без спроса → карточки (убежать с мелком / спросить) → «Entschuldigung. Darf ich die grüne Kreide haben?» — «Ja, klar!»
- **Кусочки:** «Paul, | das ist meine Kreide. | Gib sie mir bitte zurück.»; «Nein! | Frag bitte zuerst!»; «Stopp! | Hör auf! | Ich will das nicht!»; «Heike, | Paul macht mein Bild kaputt!» (kaputt не отрываем).
- **Герои:** Эмили, Пауль, Изабель, Хайке, Абиха (в конце рисует вместе).

### 27 «Stopptanz» (зал садика)
- **Игра:** своя весёлая музыка (синтезатор кодом, без чужих песен). Музыка играет — все танцуют, музыка стоп — все замирают. Эмили — «ди-джей»: жмёт паузу и смотрит, кто шевелится → тот выбывает. Сколько детей осталось (5→4→3…).
- **Конфликт (шаг 2):** Пауль шевелится и спорит: «Das gilt nicht! Die Musik war noch an!» — Эмили **шаг 2**: «Doch! Die Musik war aus. Das ist die Regel.»
- **Извинения в обе стороны:** Изабель в танце случайно толкает Эмили — «Entschuldigung!» — учим **принять**: «Schon gut!»; Эмили сама наступает Абихе на ногу — «Entschuldigung, Abiha! Tut es weh?» — «Nein, schon gut.»
- **Кусочки:** «Doch! | Die Musik war aus. | Das ist die Regel.»; «Entschuldigung, Abiha! | Tut es weh?»; «Schon gut!» — целиком.

### 28 «Memory mit Mark» (дома, ковёр)
- **Игра:** настоящий Memory: 6 пар карточек (Тео, мяч, яблоко, солнце, машинка, звёздочка) — переворачиваем по две, ищем пары. Очередь: «Ich bin dran!» / «Du bist dran!». В конце считаем пары и сравниваем, у кого больше.
- **Конфликт (шаг 3):** Марк хватает карточки и мешает → **1** «Mark, bitte nicht die Karten nehmen.» → **2** «Nein, Mark! Das ist mein Spiel.» → **3** «Stopp, Mark! Hör auf!» → Марк плачет → Эмили принимает его в игру: «Komm, Mark. Wir spielen zusammen. Du darfst umdrehen.»
- **Кусочки:** «Mark, | bitte nicht die Karten nehmen.» (отрицание вместе с глаголом); «Nein, Mark! | Das ist mein Spiel.»; «Komm, Mark. | Wir spielen zusammen.»

### 29 «Seilspringen» (двор садика)
- **Игра:** Эмили и Абиха крутят скакалку, Изабель прыгает, Эмили считает прыжки (до 10); потом прыгает Эмили — народная считалка «Teddybär, Teddybär, dreh dich um».
- **Конфликт (шаг 2):** Изабель дразнит «Du bist zu klein! Du kannst das nicht!» → **шаг 2** «Doch! Ich kann das!» (+ получается). Спор о счёте: «Ich habe zwanzig geschafft!» — «Nein, das stimmt nicht. Es waren sieben.»
- **Кусочки:** «Doch! | Ich kann das!»; «Nein, | das stimmt nicht. | Es waren sieben.»

### 30 «Arzt spielen» (уголок ролевых игр)
- **Игра:** Эмили — врач, пациенты — Пауль и Абиха: «Wo tut es weh?» — нажимаем больное место (живот, голова, рука, колено), пластырь, слушаем сердце (считаем удары).
- **Договориться (шаг 1):** Изабель тоже хочет быть врачом → «Wir können tauschen. Erst ich, dann du.» **Неправа Эмили:** взяла стетоскоп у Абихи → «Entschuldigung. Du kannst zuerst.»

### 31 «Stille Post» (круг на ковре)
- **Игра:** шёпотом передаём слово по кругу. Новое у микрофона: нужно **тихо** (громко — не засчитывается, «Psst! Flüstern!»). Слово искажается — смешно.
- **Конфликт (шаг 1–2):** Пауль кричит слово вслух — «Psst! Du musst flüstern!»

### 32 «Ich sehe was, was du nicht siehst» (группа садика)
- **Игра:** угадываем предмет по цвету (цвета точно совпадают с картинкой), потом Эмили загадывает сама.
- **Конфликт (шаг 2):** Пауль поменял загаданное — «Du hast geschummelt! Das war nicht rot.»

### 33 «Bauklötze» (дома с Марком) — запасная
- Марк ломает башню: шаги 1–3, счёт кубиков, строим вместе.

Проверка на повторы: ни одна идея не повторяет места+игру старых уровней (площадку с горкой/качелями/песочницей и очередь на них — не берём; Леон уже был задирой — новые конфликты с Паулем, Изабель, Марком).
