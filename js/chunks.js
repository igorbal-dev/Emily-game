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
const CHUNK_SND = {};
