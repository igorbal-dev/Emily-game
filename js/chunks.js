/* Деление сложных фраз Эмили на кусочки для лёгкого уровня повторения (js/repeat.js).
   Один список на всю игру: ключ фразы → кусочки. Фразы, которых здесь нет, считаются простыми и не дробятся.

   Фраза сложная, если: больше 5 слогов; или есть слово от 4 слогов (Entschuldigung, Geburtstag);
   или трудное сочетание согласных (zw, pf, schl, schm, str, spr, sp/st в начале основы, z в начале слова и т. п.).
   Простые (Hallo!, Danke!, Ja!, Tschüss!, Ich heiße Emily.) не дробим никогда.

   Как делим: по смысловым группам, где в живой речи пауза; в кусочке 2–4 слога и не больше 3 слов, кусочков не больше 4; одно слово никогда не делим (Entschuldigung — целиком, фраза не дробится);
   не рвём артикль + слово, предлог + его группу, обращение + имя; длинное или трудное слово — отдельным кусочком;
   ничего не выкидываем. Кусочек в середине фразы пишется с «…» (интонация продолжения), последний — с концом фразы (! или ?).
   Записи кусочков (CHUNK_SND, Barbara Brave – TV Narrator) есть только у уровня 2. На остальных уровнях кусочки говорит
   немецкий голос браузера (js/repeat.js), новые записи кусочков в ElevenLabs не делаем.

   Уровень 2 «Spielplatz». Тексты пяти фраз знакомства (e_hallo_emily, e_bin_fuenf, e_bruder, e_hund, e_darf_ich)
   восстановлены по смыслу сцены — сверить на слух с записями Эмили. */
const CHUNKS = (() => {
  const C = {
    e_hallo_emily: ['Hallo!', 'Ich heiße Emily.'],
    e_bin_fuenf: ['Ich bin fünf …', 'Jahre alt.'],
    e_bruder: ['Das ist mein …', 'Bruder Mark.'],
    e_hund: ['Das ist mein …', 'Hund Theo.'],
    e_darf_ich: ['Darf ich …', 'mitspielen?'],
    e_freundin: ['Willst du …', 'meine Freundin …', 'sein?']
  };
  /* «Mark ist hinter dem Baum!», «Ich bin unter der Rutsche!» — все укрытия площадки */
  const WHO = {mark: 'Mark ist …', theo: 'Theo ist …', isabel: 'Isabel ist …', paul: 'Paul ist …', ich: 'Ich bin …'};
  const WHERE = {baum: ['hinter dem Baum!'], busch: ['hinter dem Busch!'], rutsche: ['unter der Rutsche!'],
    schaukel: ['hinter der Schaukel!'], sandkasten: ['hinter dem …', 'Sandkasten!']};
  for (const [w, first] of Object.entries(WHO)) for (const [s, rest] of Object.entries(WHERE)) C[`e_${w}_${s}`] = [first, ...rest];

  /* Уровень 1 «Verstecken» (прятки дома): «Mark ist unter dem Tisch!», «Ich bin im Schrank!» */
  const HOME = {tisch: ['unter dem Tisch!'], schrank: ['im Schrank!'], sofa: ['hinter dem …', 'Sofa!'], kiste: ['in der Kiste!']};
  for (const w of ['mark', 'theo', 'ich']) for (const [s, rest] of Object.entries(HOME)) C[`e_${w}_${s}`] = [WHO[w], ...rest];
  Object.assign(C, {
    e_wollt_ihr: ['Hallo! Wollt ihr …', 'mit mir …', 'Verstecken spielen?'],
    e_lass_uns: ['Lass uns …', 'Verstecken …', 'spielen!'],
    /* 3 «Bäckerei» */
    e_alles: ['Nein, danke.', 'Das ist alles.'],
    e_order_brezel: ['Zwei Brezeln …', 'bitte.'],
    e_order_broetchen: ['Ein Brötchen …', 'bitte.'],
    e_order_keks: ['Drei Kekse …', 'bitte.'],
    /* 4 «Geburtstag» */
    e_alles_gute: ['Alles Gute …', 'zum Geburtstag!'],
    e_danke_party: ['Danke …', 'für die Party!'],
    /* 5 «Sandkasten» */
    e_sandburg: ['Wir bauen …', 'zusammen …', 'eine Sandburg!'],
    e_schaufel: ['Kann ich …', 'die Schaufel …', 'haben?'],
    e_spass: ['Das hat Spaß …', 'gemacht!'],
    /* 6 «Kita-Morgen» */
    e_morgen: ['Guten Morgen …', 'Heike!'],
    /* 7 «Eisdiele» */
    e_zuerst: ['Ich war …', 'zuerst da.', 'Bitte stell dich …', 'hinten an.'],
    /* 8 «Kita-Weg» */
    e_rot_stehen: ['Rot heißt …', 'stehen!'],
    /* 9 «Aufräumen» */
    e_fertig: ['Fertig!', 'Alles …', 'aufgeräumt!'],
    e_gib_bitte: ['Mark, gib mir …', 'bitte …', 'das Auto!'],
    /* 11 «Ballspiel» */
    e_ich_auch: ['Ich spiele …', 'auch mit!'],
    e_komm_mark: ['Komm, Mark!', 'Spiel mit!'],
    /* 12 «Turnen» */
    e_cmd_springen: ['Alle …', 'springen!'],
    e_juhu: ['Juhu …', 'Sport!'],
    /* 13 «Wer ist dran?» */
    e13_darf: ['Darf ich …', 'auch mal …', 'schaukeln?'],
    e13_du_zuerst: ['Du zuerst …', 'dann ich!'],
    e13_zusammen: ['Komm, wir spielen …', 'zusammen!'],
    /* 14 «Zu Besuch bei Paul» */
    e14_guten_tag: ['Guten Tag …', 'Frau Becker!'],
    e14_was: ['Hallo Paul!', 'Was spielen wir?'],
    e14_bau: ['Mit Bausteinen …', 'bitte!'],
    e14_wasser: ['Ja, bitte.', 'Ein Glas Wasser.'],
    e14_toilette: ['Wo ist …', 'die Toilette …', 'bitte?'],
    e14_einladung: ['Danke für …', 'die Einladung!', 'Tschüss!'],
    /* 15 «Im Supermarkt» */
    e15_bleib: ['Theo, bleib hier!', 'Wir kommen …', 'gleich wieder.'],
    e15_wo_milch: ['Entschuldigung …', 'wo ist …', 'die Milch?'],
    e15_bezahlen: ['Wir müssen …', 'zuerst …', 'bezahlen!'],
    e15_ihnen_auch: ['Danke …', 'Ihnen auch!', 'Tschüss!'],
    /* 16 «Kita: Ich brauche Hilfe» */
    e16_gut: ['Mir geht es …', 'gut, danke!'],
    e16_stift: ['Isabel, gibst du …', 'mir bitte …', 'den roten Stift?'],
    e16_heike: ['Komm …', 'wir sagen es …', 'Heike!'],
    e16_helfen: ['Heike, kannst du …', 'mir bitte …', 'helfen?'],
    e16_bis_morgen: ['Tschüss, Heike!', 'Bis morgen!'],
    /* 17 «Neue Nachbarin» */
    e17_fuenf: ['Ich bin fünf.', 'Und du?'],
    e17_bruder: ['Ja.', 'Das ist mein …', 'Bruder Mark.'],
    e17_haustier: ['Hast du auch …', 'ein Haustier?'],
    /* 18 «Sofia kommt raus» */
    e18_schoen: ['Schön!', 'Wie heißt sie?'],
    e18_eis: ['Ich esse gern …', 'Eis.'],
    e18_pommes: ['Ich esse gern …', 'Pommes.'],
    e18_aepfel: ['Ich esse gern …', 'Äpfel.'],
    e18_nudeln: ['Ich esse gern …', 'Nudeln.'],
    e18_kpop: ['Ich höre gern …', 'K-Pop!', 'Und du?'],
    e18_ballett: ['Ich tanze gern!', 'Ich gehe …', 'zum Ballett.'],
    e18_kommen: ['Willst du mal …', 'zu mir kommen?'],
    /* 19 «Stopp!» */
    e19_stopp: ['Stopp!', 'Das mag ich …', 'nicht!'],
    e19_nicht_schubsen: ['Nicht …', 'schubsen!'],
    e19_bruder: ['Lass meinen Bruder …', 'in Ruhe!', 'Gib den Ball …', 'zurück!'],
    e19_siehst: ['Siehst du?', 'Das ist …', 'nicht schön!'],
    e19_heike: ['Heike!', 'Leon macht …', 'meine Burg kaputt!'],
    e19_nicht_mehr: ['Okay.', 'Aber mach das …', 'nicht mehr!'],
    /* 20 «Wir spielen alle zusammen» */
    e20_nicht_bloed: ['Nein! Ich bin …', 'nicht blöd.', 'Das ist …', 'nicht nett!'],
    e20_aua: ['Aua!', 'Nicht hauen!'],
    e20_heike: ['Heike …', 'Leon hat mich …', 'gehauen.'],
    e20_traurig: ['Ich bin …', 'traurig.'],
    e20_wuetend: ['Ich bin …', 'wütend.'],
    e20_spielt_ihr: ['Isabel, Paul …', 'spielt ihr …', 'mit mir?'],
    e20_alle: ['Leon, du kannst …', 'auch mitspielen.', 'Wir spielen …', 'alle zusammen!'],
    e20_nein: ['Nein …', 'jetzt nicht.'],
    /* 21 «Abiha ist wieder da!» */
    e21_endlich: ['Abiha! Hallo!', 'Endlich bist du …', 'wieder da!'],
    e21_vermisst: ['Ich habe dich …', 'so vermisst!'],
    e21_wo: ['Wo warst du …', 'im Urlaub?'],
    e21_gesehen: ['Was hast du …', 'gesehen?'],
    e21_eis: ['Habt ihr auch …', 'Eis gegessen?'],
    e21_gefallen: ['Hat dir …', 'der Urlaub …', 'gefallen?'],
    e21_froh: ['Ich bin froh, …', 'dass du …', 'wieder da bist!'],
    e21_spielen: ['Jetzt können wir …', 'wieder zusammen …', 'spielen!'],
    /* 22 «Wir spielen draußen» */
    e22_draussen: ['Möchtest du …', 'draußen spielen …', 'oder drinnen?'],
    e22_ich_auch: ['Ich auch!', 'Lass uns …', 'nach draußen gehen!'],
    e22_rutschen: ['Wollen wir …', 'zusammen rutschen?'],
    e22_jetzt_ich: ['Haha!', 'Jetzt bin ich …', 'dran!'],
    e22_anschubsen: ['Ja!', 'Kannst du mich …', 'ein bisschen …', 'anschubsen?'],
    e22_danke: ['Das macht Spaß!', 'Danke, Abiha!'],
    e22_wette: ['Wollen wir …', 'um die Wette …', 'laufen?'],
    e22_los: ['Auf die Plätze, …', 'fertig, …', 'los!'],
    e22_gerne: ['Ich spiele …', 'so gerne …', 'mit dir!'],
    /* 23 «Jahreszeiten» */
    e23_kennst: ['Abiha, …', 'welche Jahreszeiten …', 'kennst du?'],
    e23_herbst: ['Jetzt ist …', 'Herbst!'],
    e23_winter: ['Bald kommt …', 'der Winter!'],
    e23_liebsten: ['Ich mag …', 'den Winter …', 'am liebsten!', 'Und du?'],
    e23_dezember: ['Mein Lieblingsmonat …', 'ist Dezember!'],
    e23_wuenschst: ['Was wünschst …', 'du dir …', 'vom Nikolaus?'],
    e23_spielzeug: ['Ich wünsche mir …', 'ein Spielzeug!'],
    e23_ski: ['Ja!', 'Ich fahre …', 'sehr gerne Ski!'],
    e23_riesig: ['Ja, …', 'ich freue mich …', 'riesig!'],
    e23_wunderschoen: ['Der Winter …', 'ist einfach …', 'wunderschön!']
  });
  return C;
})();
/* записи кусочков голосом-«логопедом»: текст кусочка → assets/snd/….mp3 (заполняется после записи) */
const CHUNK_SND = {
 "Hallo!": "assets/snd/4fb2d302b82c.mp3",
 "Ich heiße Emily.": "assets/snd/eb26e5024d79.mp3",
 "Ich bin fünf …": "assets/snd/a59d28d00c00.mp3",
 "Jahre alt.": "assets/snd/b54c4490a8a6.mp3",
 "Das ist mein …": "assets/snd/043e9ef8e6f6.mp3",
 "Bruder Mark.": "assets/snd/ea933b71768a.mp3",
 "Hund Theo.": "assets/snd/771cfc923211.mp3",
 "Darf ich …": "assets/snd/99174e94c380.mp3",
 "mitspielen?": "assets/snd/004c62d674c8.mp3",
 "Willst du …": "assets/snd/0cf31c470579.mp3",
 "meine Freundin …": "assets/snd/9a5d097fdc38.mp3",
 "sein?": "assets/snd/9891a90e10eb.mp3",
 "Mark ist …": "assets/snd/b9c86d78163d.mp3",
 "hinter dem Baum!": "assets/snd/f13056d6d224.mp3",
 "hinter dem Busch!": "assets/snd/ff2d2a0ab034.mp3",
 "unter der Rutsche!": "assets/snd/3ce1bb1e1f1a.mp3",
 "hinter der Schaukel!": "assets/snd/b1f995a13578.mp3",
 "hinter dem …": "assets/snd/68f2b9a4082f.mp3",
 "Sandkasten!": "assets/snd/522a2f6c4dcb.mp3",
 "Theo ist …": "assets/snd/a61fa4ee4802.mp3",
 "Isabel ist …": "assets/snd/20c664f8e346.mp3",
 "Paul ist …": "assets/snd/770efe65a1d8.mp3",
 "Ich bin …": "assets/snd/131b02a3e6ab.mp3"
};
