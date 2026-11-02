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

