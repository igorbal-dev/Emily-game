/* Деление сложных фраз Эмили на кусочки для лёгкого уровня повторения (js/repeat.js).
   Один список на всю игру: ключ фразы → кусочки. Фразы, которых здесь нет, считаются простыми и не дробятся.

   Фраза сложная, если: больше 5 слогов; или есть слово от 4 слогов (Entschuldigung, Geburtstag);
   или трудное сочетание согласных (zw, pf, schl, schm, str, spr, sp/st в начале основы, z в начале слова и т. п.).
   Простые (Hallo!, Danke!, Ja!, Tschüss!, Ich heiße Emily.) не дробим никогда.

   Как делим: по смысловым группам, где в живой речи пауза; в кусочке 2–4 слога, кусочков не больше 3;
   не рвём артикль + слово, предлог + его группу, обращение + имя; длинное или трудное слово — отдельным кусочком;
   ничего не выкидываем. Кусочек в середине фразы пишется с «…» (интонация продолжения), последний — с концом фразы (! или ?).
   Запись кусочка: CHUNK_SND[текст] = путь к mp3 (голос-«логопед» Barbara Brave – TV Narrator). Пока записи нет — голос браузера de-DE, темп 0.85.

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
