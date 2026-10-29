/* Деление сложных фраз Эмили на кусочки для лёгкого уровня повторения (js/repeat.js).
   Один список на всю игру: ключ фразы → кусочки. Фразы, которых здесь нет, считаются простыми и не дробятся.

   Фраза сложная, если: больше 5 слогов; или есть слово от 4 слогов (Entschuldigung, Geburtstag);
   или трудное сочетание согласных (zw, pf, schl, schm, str, spr, sp/st в начале основы, z в начале слова и т. п.).
   Простые (Hallo!, Danke!, Ja!, Tschüss!, Ich heiße Emily.) не дробим никогда.

   Как делим: по смысловым группам, где в живой речи пауза; в кусочке 2–4 слога, кусочков не больше 3;
   не рвём артикль + слово, предлог + его группу, обращение + имя; длинное или трудное слово — отдельным кусочком;
   ничего не выкидываем. Кусочек в середине фразы пишется с «…» (интонация продолжения), последний — с концом фразы (! или ?).
   Запись кусочка: CHUNK_SND[текст] = путь к mp3 (голос-«логопед»). Пока записи нет — голос браузера de-DE, темп 0.85.

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
 "Hallo!": "assets/snd/455caffb9ea8.mp3",
 "Ich heiße Emily.": "assets/snd/d2ea11b37cab.mp3",
 "Ich bin fünf …": "assets/snd/69d07eb33d38.mp3",
 "Jahre alt.": "assets/snd/29bf676f90f6.mp3",
 "Das ist mein …": "assets/snd/eb2ae70ab744.mp3",
 "Bruder Mark.": "assets/snd/a7f6f9ca7807.mp3",
 "Hund Theo.": "assets/snd/a2ff29bc2421.mp3",
 "Darf ich …": "assets/snd/a03afebde258.mp3",
 "mitspielen?": "assets/snd/ca76c7b22be3.mp3",
 "Willst du …": "assets/snd/e6326bd5a39e.mp3",
 "meine Freundin …": "assets/snd/a53ddcd10f44.mp3",
 "sein?": "assets/snd/924ae7c52c33.mp3",
 "Mark ist …": "assets/snd/ef85a7f59ec1.mp3",
 "hinter dem Baum!": "assets/snd/e944aa1d2ffd.mp3",
 "hinter dem Busch!": "assets/snd/0e249ecfd452.mp3",
 "unter der Rutsche!": "assets/snd/db0e04199eea.mp3",
 "hinter der Schaukel!": "assets/snd/5d407c94ce08.mp3",
 "hinter dem …": "assets/snd/80278f6d1010.mp3",
 "Sandkasten!": "assets/snd/beb5944a92da.mp3",
 "Theo ist …": "assets/snd/6b2adc6d5d47.mp3",
 "Isabel ist …": "assets/snd/fb6a5fb0b2d9.mp3",
 "Paul ist …": "assets/snd/2243dae96302.mp3",
 "Ich bin …": "assets/snd/82e636b2c086.mp3"
};
