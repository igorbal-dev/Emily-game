/* Повторение фраз за мультяшной Эмили — три уровня сложности (настройка на карте, localStorage 'emily-repeat'):
   easy   — сложные фразы (js/chunks.js) собираем кусочками: над Эмили облачко с точками, кусочек звучит,
            любой звук или синяя кнопка — точка загорается; когда все горят, Эмили говорит фразу целиком сама;
   medium — Эмили говорит всю фразу своей записью, но медленнее (0.8, высота голоса та же);
   normal — как было.
   Кусочки: если у всех кусочков фразы есть запись (CHUNK_SND, уровень 2 — Barbara) — записи; иначе голос браузера,
   только немецкий (deVoice). Немецкого голоса на устройстве нет — кусочков нет, фраза идёт как на среднем.
   Подключается после кода уровня: заменяет repeatAfter(model, speaker) уровней 1–12 или T.repeat(model, hero) из js/talk.js (13–16).
   Нужны глобальные play, listen, sleep, BUF, actx, SND, speaking. На карте (index.html) нужен только deVoice. */

/* немецкий голос браузера: Anna (iOS), Google Deutsch (Android), иначе любой de-DE / de; голос по умолчанию без проверки языка не берём */
function deVoice(){
  let vs = [];
  try { vs = ('speechSynthesis' in window && speechSynthesis.getVoices()) || []; } catch(e){}
  vs = vs.filter(v => /^de([-_]|$)/i.test(v.lang || ''));
  return vs.find(v => /^anna\b/i.test(v.name)) || vs.find(v => /google deutsch/i.test(v.name))
    || vs.find(v => /^de[-_]DE$/i.test(v.lang)) || vs[0] || null;
}
if ('speechSynthesis' in window) try { speechSynthesis.getVoices(); } catch(e){}   /* Android подгружает голоса не сразу — пусть начнёт */

(function(){
  const talk = typeof T !== 'undefined' && T && typeof T.repeat === 'function';
  if (!talk && typeof repeatAfter !== 'function') return;
  const original = talk ? T.repeat : repeatAfter;
  const mode = () => { try { return localStorage.getItem('emily-repeat') || 'easy'; } catch(e){ return 'easy'; } };
  const stage = document.getElementById('stage');

  const css = document.createElement('style');
  css.textContent = `
  #rcloud{position:absolute;z-index:70;display:flex;gap:8px;align-items:center;padding:8px 14px;background:#fff;border-radius:999px;
    box-shadow:0 4px 0 rgba(150,110,60,.25);pointer-events:none;transform:translateX(-50%)}
  #rcloud::after{content:"";position:absolute;left:50%;bottom:-7px;width:14px;height:14px;background:#fff;transform:translateX(-50%) rotate(45deg);border-radius:3px}
  #rcloud i{width:16px;height:16px;border-radius:50%;background:#e6dccd;transition:background .2s, transform .2s}
  #rcloud i.now{background:#ffd84d;transform:scale(1.25);box-shadow:0 0 0 4px rgba(255,216,77,.35)}
  #rcloud i.on{background:#32b67a}`;
  document.head.appendChild(css);

  /* говорящий открывает рот, пока звучит p: герой уровней 1–12 (talkWhile) или герой js/talk.js (say) */
  function voiced(speaker, model, p){
    if (speaker && speaker.talkWhile) return speaker.talkWhile(p, speaker.name === 'emily' ? 'hold' : 'talk');
    if (speaker && speaker.say) return speaker.say(model, p);
    return p;
  }

  /* облачко над головой говорящего: маленькое, только над ним самим */
  function cloud(speaker, n){
    const c = document.createElement('div'); c.id = 'rcloud';
    for (let i = 0; i < n; i++) c.appendChild(document.createElement('i'));
    stage.appendChild(c);
    const st = stage.getBoundingClientRect(), r = speaker && speaker.el ? speaker.el.getBoundingClientRect() : {left: st.width/2, width: 0, top: st.height*0.4};
    const x = Math.min(st.width - 60, Math.max(60, r.left - st.left + r.width/2));
    c.style.left = x + 'px'; c.style.top = Math.max(6, r.top - st.top - c.offsetHeight - 10) + 'px';
    return c;
  }

  /* кусочек голосом браузера: de-DE, немецкий голос, темп 0.85.
     Возвращает false, если голос так и не заговорил (iPhone/Android иногда молча глотают речь) — тогда фраза идёт целиком. */
  let lastU = null, ttsBroken = false;                      /* lastU держит фразу, чтобы браузер не потерял её посреди чтения */
  function tts(text, voice){
    return new Promise(res => {
      const u = lastU = new SpeechSynthesisUtterance(text.replace(/…/g, '').trim());
      u.lang = 'de-DE'; u.voice = voice; u.rate = 0.85; u.pitch = 1; u.volume = 1;
      let done = false, started = false; const fin = ok => { if (!done){ done = true; res(ok); } };
      u.onstart = () => { started = true; };
      u.onend = () => fin(true); u.onerror = () => fin(started);
      setTimeout(() => { if (!started){ try { speechSynthesis.cancel(); } catch(e){} fin(false); } }, 2000);
      setTimeout(() => fin(true), 2500 + text.length*150);
      try { speechSynthesis.resume(); } catch(e){}            /* после звонка или паузы речь может «зависнуть» на паузе */
      speechSynthesis.speak(u);
    });
  }
  /* iPhone пускает речь только после нажатия: при нажатии «играть» произносим пустую фразу */
  document.addEventListener('click', e => {
    if (!e.target.closest('#go') || !('speechSynthesis' in window)) return;
    try { const u = new SpeechSynthesisUtterance(' '); u.lang = 'de-DE'; u.volume = 0; const v = deVoice(); if (v) u.voice = v; lastU = u; speechSynthesis.speak(u); } catch(e){}
  }, true);
  async function sayChunk(text, voice){
    const k = 'ch_' + text, uri = typeof CHUNK_SND !== 'undefined' && CHUNK_SND[text];
    if (!voice){
      if (typeof actx !== 'undefined' && actx && !BUF[k]){
        try { const ab = await (await fetch(uri)).arrayBuffer(); BUF[k] = await new Promise((ok, no) => { const p = actx.decodeAudioData(ab, ok, no); if (p && p.then) p.then(ok, no); }); } catch(e){}
      }
      await play(k);
    } else {
      speaking++;
      let ok; try { ok = await tts(text, voice); } finally { speaking--; }
      if (!ok){ ttsBroken = true; return false; }
    }
    await sleep(350);                                     /* короткая пауза после кусочка */
    return true;
  }

  async function easy(model, speaker){
    const parts = typeof CHUNKS !== 'undefined' && CHUNKS[model];
    if (!parts) return original(model, speaker);           /* простая фраза — как обычно */
    const recorded = typeof CHUNK_SND !== 'undefined' && parts.every(t => CHUNK_SND[t]);
    const voice = recorded ? null : deVoice();
    if (!recorded && (!voice || ttsBroken)) return medium(model, speaker);   /* нет немецкого голоса или он молчит — фраза целиком, медленнее */
    const c = cloud(speaker, parts.length), dots = [...c.children];
    try {
      for (let p = 0; p < parts.length; p++){
        dots[p].classList.add('now');
        for (let i = 0; i < 4; i++){
          if (i === 2) await play('a_nach');
          if (i === 3) await play('r_like_emily');
          if (!await sayChunk(parts[p], voice)){ c.remove(); return medium(model, speaker); }
          if (await listen()) break;
        }
        dots[p].classList.remove('now'); dots[p].classList.add('on');
      }
      await sleep(250);
    } finally { c.remove(); }
    /* все точки горят — Эмили говорит фразу целиком сама, повторять не нужно */
    await voiced(speaker, model, play(model));
    return true;
  }

  /* средний: та же запись, медленнее; высота голоса сохраняется (HTML-аудио с preservesPitch) */
  let slowEl = null;
  document.addEventListener('click', e => {
    if (slowEl || !e.target.closest('#go')) return;
    slowEl = new Audio(); slowEl.preload = 'auto';
    slowEl.src = 'data:audio/wav;base64,UklGRiQAAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQAAAAA=';
    slowEl.play().then(() => slowEl.pause()).catch(() => {});   /* «разблокировать» звук на iPhone, пока есть нажатие */
  }, true);
  function playSlow(name){
    const uri = typeof SND !== 'undefined' && SND[name];
    if (!uri || !slowEl) return play(name);
    speaking++;
    return new Promise(res => {
      let done = false; const fin = () => { if (!done){ done = true; speaking--; res(); } };
      slowEl.onended = fin; slowEl.onerror = () => { if (!done){ done = true; speaking--; play(name).then(res); } };
      slowEl.src = uri; slowEl.playbackRate = 0.8; slowEl.defaultPlaybackRate = 0.8;
      slowEl.preservesPitch = true; slowEl.mozPreservesPitch = true; slowEl.webkitPreservesPitch = true;
      slowEl.play().catch(() => slowEl.onerror());
      setTimeout(fin, 15000);
    });
  }
  async function medium(model, speaker){
    for (let i = 0; i < 4; i++){
      if (i === 2) await play('a_nach');
      if (i === 3) await play('r_like_emily');
      await voiced(speaker, model, playSlow(model)); await sleep(150);
      if (await listen()) return true;
    }
    return false;
  }

  function pick(model, speaker){
    const m = mode();
    if (m === 'easy') return easy(model, speaker);
    if (m === 'medium') return medium(model, speaker);
    return original(model, speaker);
  }
  /* js/talk.js: T.repeat сам считает звёздочки за повтор; если фраза прошла мимо него (кусочки, медленно) — считаем тут */
  if (talk) T.repeat = async (model, hero) => {
    hero = hero || T.heroes.emily;
    const before = T.stars, ok = await pick(model, hero);
    if (ok && T.stars === before) T.stars++;
    return ok;
  };
  else repeatAfter = pick;
})();
