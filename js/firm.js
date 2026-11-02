/* Лестница настойчивости (уровни 24+): общий код для конфликтов. Подключается после js/talk.js и js/repeat.js.
   Шаг 1 — обычный повтор T.repeat (вежливо).
   Шаги 2–3 — T.firm(model, {who, need, step}): Эмили говорит громче и твёрже (шаг 3 — с поднятой ладонью «Stopp»).
     Пока горит микрофон, обидчик `who` отшатывается тем дальше, чем громче голос.
     Нужна громкость need (шаг 2 ≈ 1.8, шаг 3 ≈ 2.4; 1 — обычный голос). Тихо — «Lauter! Sag es mit fester Stimme!» и ещё раз
     (подсказка два раза по-немецки, на третий — по-русски). После 4 попыток игра всё равно идёт дальше (проверка мягкая).
     Без микрофона (кнопка) — засчитывается сразу.
   Шаг 4 — позвать взрослого: обычный T.repeat с фразой «Heike, …» в сцене уровня.
   Нужны записи n_lauter (немецкая подсказка) и r_lauter (русская) — они общие, лежат в art/voice_new.json. */
T.firm = async (model, o = {}) => {
  const hero = T.heroes.emily, who = o.who, need = o.need || (o.step === 3 ? 2.4 : 1.8);
  const x0 = who ? who.x : 0;
  let max = 0;
  for (let k = 0; k < 4; k++){
    hero.set(o.step === 3 ? 'wave' : (o.pose || 'idle'));
    const stop = T.loudness(v => { if (who) who.el.style.translate = `${((o.dir || 1)*v*L.hE*0.08).toFixed(1)}px 0`; });
    const ok = await T.repeat(model);
    max = Math.max(max, stop()); if (who) who.el.style.translate = '';
    if (!ok || max >= need || !mic) break;
    if (k < 3){ await play(k === 2 ? 'r_lauter' : 'n_lauter'); }
  }
  hero.set('idle');
  if (who){ sfx.whoosh(); await T.glide(who, Math.max(0.05, Math.min(0.95, x0 + (o.dir || 1)*(0.04 + Math.min(0.12, max*0.04)))), 0, 450, 'ease-out'); }
  return max;
};
