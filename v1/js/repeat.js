/* Повторение фраз за мультяшной Эмили — три уровня сложности (настройка на карте, localStorage 'emily-repeat'):
   easy   — сложные фразы (js/chunks.js) собираем кусочками: над Эмили облачко с точками, кусочек говорит голос-«логопед»,
            любой звук или синяя кнопка — точка загорается; когда все горят, Эмили говорит фразу целиком сама;
   medium — Эмили говорит всю фразу своей записью, но медленнее (0.8, высота голоса та же);
   normal — как было.
   Подключается после кода уровня и заменяет его repeatAfter(model, speaker). Нужны глобальные play, listen, sleep, BUF, actx, SND. */
(function(){
  if (typeof repeatAfter !== 'function') return;
  const original = repeatAfter;
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

  /* кусочек: запись голоса-«логопеда», а пока её нет — голос браузера de-DE, темп 0.85 */
  const chunkKey = t => 'ch_' + t;
  let voices = [];
  const loadV = () => { try { voices = speechSynthesis.getVoices() || []; } catch(e){} };
  if ('speechSynthesis' in window){ loadV(); speechSynthesis.addEventListener && speechSynthesis.addEventListener('voiceschanged', loadV); }
  function tts(text){
    return new Promise(res => {
      if (!('speechSynthesis' in window)){ setTimeout(res, 600 + text.length*70); return; }
      const u = new SpeechSynthesisUtterance(text.replace(/…/g, '').trim()); u.lang = 'de-DE'; u.rate = 0.85; u.pitch = 1;
      const v = voices.find(v => /^de[-_]DE/i.test(v.lang || '')) || voices.find(v => /^de/i.test(v.lang || '')); if (v) u.voice = v;
      let done = false; const fin = () => { if (!done){ done = true; res(); } };
      u.onend = fin; u.onerror = fin; setTimeout(fin, 2500 + text.length*150); speechSynthesis.speak(u);
    });
  }
  async function sayChunk(text){
    const k = chunkKey(text), uri = typeof CHUNK_SND !== 'undefined' && CHUNK_SND[text];
    if (uri && typeof actx !== 'undefined' && actx && !BUF[k]){
      try { const ab = await (await fetch(uri)).arrayBuffer(); BUF[k] = await new Promise((ok, no) => { const p = actx.decodeAudioData(ab, ok, no); if (p && p.then) p.then(ok, no); }); } catch(e){}
    }
    if (BUF[k]) await play(k);
    else { speaking++; try { await tts(text); } finally { speaking--; } }
    await sleep(350);                                     /* короткая пауза после кусочка */
  }

  async function easy(model, speaker){
    const parts = typeof CHUNKS !== 'undefined' && CHUNKS[model];
    if (!parts) return original(model, speaker);           /* простая фраза — как обычно */
    const c = cloud(speaker, parts.length), dots = [...c.children];
    try {
      for (let p = 0; p < parts.length; p++){
        dots[p].classList.add('now');
        for (let i = 0; i < 4; i++){
          if (i === 2) await play('a_nach');
          if (i === 3) await play('r_like_emily');
          await sayChunk(parts[p]);
          if (await listen()) break;
        }
        dots[p].classList.remove('now'); dots[p].classList.add('on');
      }
      await sleep(250);
    } finally { c.remove(); }
    /* все точки горят — Эмили говорит фразу целиком сама, повторять не нужно */
    if (speaker) await speaker.talkWhile(play(model), speaker.name === 'emily' ? 'hold' : 'talk'); else await play(model);
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
    const say = () => speaker ? speaker.talkWhile(playSlow(model), speaker.name === 'emily' ? 'hold' : 'talk') : playSlow(model);
    for (let i = 0; i < 4; i++){
      if (i === 2) await play('a_nach');
      if (i === 3) await play('r_like_emily');
      await say(); await sleep(150);
      if (await listen()) return true;
    }
    return false;
  }

  repeatAfter = function(model, speaker){
    const m = mode();
    if (m === 'easy') return easy(model, speaker);
    if (m === 'medium') return medium(model, speaker);
    return original(model, speaker);
  };
})();
