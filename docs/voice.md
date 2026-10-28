# Озвучка игры Эмили: голоса и правила

Документ для Claude Code: как устроена озвучка, какими голосами, и что ещё не записано. Сохранить в репозиторий (например docs/voice.md).

## Сервис и настройки

- ElevenLabs, модель Eleven v3.
- Язык задаётся в настройках генерации (Language: German или Russian). Язык самого голоса в библиотеке неважен: v3 говорит по-немецки любым голосом.
- В начале фразы ставятся теги эмоций в квадратных скобках: \[cheerfully\], \[excited\], \[curious\], \[warmly\], \[softly\], \[laughs\] и т.д.
- Можно генерировать через API ElevenLabs (ключ даёт Игорь). Тогда новые фразы Claude Code делает сам.

## Голоса

| Роль | Голос ElevenLabs | Язык | Примечание |
| --- | --- | --- | --- |
| Ведущая (подсказки, похвала, счёт) | Skittle Bee | German | основной голос игры |
| Русские подсказки | Skittle Bee | Russian | раньше часть записана голосом Mila Svetlova (Russian Fairy) |
| Эмили (мультяшная, фразы-образцы) | Tilly | German | детский голос; настоящая Эмили повторяет за ней |
| Марк (1,5 года) | Tilly | German | тон поднимается на +5 полутонов уже после генерации |
| Изабель (подружка) | Gungun | German |  |
| Пауль (мальчик) | Prayan | German |  |
| Heike (воспитательница) | Rhea | German | раньше называлась Frau Sommer |
| Пекарь, продавец мороженого | добрый взрослый мужчина | German | голос окончательно не выбран |
| Мама и папа (будущее) | клоны голосов Игоря и Яны | German | Instant Voice Clone, ещё не сделано |
| Тео (собака) | Sound Effects | — | см. ниже |

## Звуки Тео (Sound Effects)

- Лай: small fluffy dog, two happy playful barks
- Тявк: small fluffy dog, one short cute yip (можно вырезать из лая)
- Нюхает: small fluffy dog sniffing the ground curiously
- Радуется: small fluffy dog happy panting
- Скулит: small fluffy dog sad soft whine
- Грызёт: small dog crunching a treat
- Тявкает на бегу: small fluffy dog excited yips while running

## Правила записи

- Один блок фраз = одна генерация. Между фразами пустая строка, порядок не менять.
- Файлы узнаются по имени голоса в названии файла от ElevenLabs и по числу фраз в блоке.
- После генерации: нарезать файл по паузам на отдельные фразы, обрезать тишину, выровнять громкость.
- Пока фраза не записана, в игре временно звучит синтезатор браузера (de-DE).

## Логика языка и подсказок

- Всё сначала по-немецки.
- Повтор фразы ступеньками: 1) фраза-образец, 2) ещё раз фраза, 3) «Sag es nach!» + фраза, 4) русская подсказка («Скажи, как Эмили!») + фраза, и снова по кругу.
- Проверка речи мягкая: сказала вслух достаточно громко = засчитано, слова не распознаются.
- Текста на экране нет, Эмили не читает.

## Ещё не записано (уровни 11 и 12)

**Эмили, Tilly, German:** Fang, Isabel! / Fang, Paul! / Ich spiele auch mit! / Komm, Mark! Spiel mit! / Alle drehen sich! / Alle klatschen! / Alle springen! / Alle winken! / Juhu, Sport!

**Марк, Tilly +5, German:** Ich auch!

**Ведущая, Skittle Bee, German:** Drei minus eins ist zwei! / Zwei minus eins ist eins! / Gefangen! Toll! / Oh, Mark ist traurig. Er will auch spielen! / Mark will auch mitspielen. / Und jetzt rollt Mark den Ball zurück! / Oder Mark mitspielen lassen? / Ohne Mark weiterspielen? / Paul wirft den Ball zu Emily. Fang! / Mark ist noch klein. Wir rollen ihm den Ball. / Sieben Würfe! Super! / Oh! Theo will auch den Ball! / Vier Kinder: Emily, Isabel, Paul und Mark! / Wie viele Kinder spielen jetzt Ball? / Wirf den Ball zu Isabel! Tipp auf Isabel! / Wirf den Ball zu Paul! Tipp auf Paul! / Wir zählen, wie oft wir werfen. / Oder: Okay, du bist dran? / Nein, nur ich bin die Chefin? / Oh, Paul ist traurig. Jeder darf mal bestimmen! / Paul will auch mal bestimmen. / Tipp auf ein Bild!

**Ведущая, Skittle Bee, Russian:** Сколько детей играет в мяч? Нажми на число! / Нажми на ребёнка, которому бросаем мяч! / Выбери, что все будут делать, и нажми на картинку!

**Изабель, Gungun:** Ich! Ich!

**Пауль, Prayan:** Wer spielt mit mir Ball? / Ich will auch mal Chef sein! / Alle drehen sich! / Alle klatschen! / Alle springen!

**Heike, Rhea:** Jetzt bist du die Chefin, Emily! Was machen wir? / Zum Schluss klatschen alle fünfmal! / Guten Morgen, Kinder! Heute machen wir Sport! / Alle springen! Dreimal! / Super gemacht, Kinder! Tschüss! / Alle winken! Dreimal!

## Будущее: мама и папа

В конце каждого уровня Эмили выбирает маму, папу или обоих. Вопрос: «Was hast du heute gemacht?», Эмили отвечает короткой фразой про уровень, потом «Toll, Emily!». Голоса: клоны Игоря и Яны. Делать после оживления анимаций.
