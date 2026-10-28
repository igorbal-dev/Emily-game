/* Общие улучшения для всех уровней. Подключается в конце каждой страницы уровня, после кода уровня.
   1. Мягкий микрофон: засчитывается любая попытка сказать вслух, даже если Эмили заговорила
      чуть раньше, чем появился значок микрофона. Пока значок светится, можно повторить ещё раз.
   2. В конце уровня большая кнопка «дальше» в правом нижнем углу ведёт на следующий уровень, наклейка-награда видна сверху. */
(function(){
  /* ---------- микрофон: слушаем всё время, а не только когда горит значок ---------- */
  const V = {
    floor: 0.008,          /* уровень тишины в комнате, подстраивается сам */
    run: 0,                /* сколько мс подряд громче тишины */
    quietSince: 0,         /* когда началась последняя тишина */
    uttStart: -1e9,        /* начало последней попытки сказать */
    voicedAt: -1e9,        /* последний момент, когда был голос */
    usedAt: -1e9,          /* попытка, которая уже засчитана, второй раз не считается */
    level: 0, busyUntil: 0, last: 0, started: false, words: 1, lastClip: '', result: null, chain: Promise.resolve()
  };
  const HEARD_MS = 160;      /* столько голоса подряд хватает, чтобы засчитать */
  const EARLY_MS = 1800;     /* голос за столько мс до появления значка тоже считается */

  function micRms(){
    mic.analyser.getFloatTimeDomainData(mic.buf);
    let s = 0; for (const x of mic.buf) s += x*x;
    return Math.sqrt(s/mic.buf.length);
  }
  function monitor(now){
    requestAnimationFrame(monitor);
    if (typeof mic === 'undefined' || !mic) return;
    const dt = Math.min(100, now - (V.last || now)); V.last = now;
    const r = micRms();
    /* пока говорит игра (и чуть после), микрофон не слушаем, чтобы игра не «засчитала» сама себя */
    const playing = typeof speaking !== 'undefined' && speaking > 0;
    if (playing) V.busyUntil = now + 220;
    const busy = now < V.busyUntil;
    if (!busy){
      /* тишина подстраивается: быстро вниз, медленно вверх (голос её не задирает) */
      if (r < V.floor) V.floor += (r - V.floor)*0.08; else V.floor += (r - V.floor)*0.0015;
      V.floor = Math.min(0.05, Math.max(0.002, V.floor));
    }
    const thr = Math.max(0.011, V.floor*2.2 + 0.004);
    V.level = r/thr;
    if (!busy && r > thr){
      if (V.run === 0 && now - V.quietSince > 0) V.runStart = now;
      V.run += dt;
      if (V.run >= HEARD_MS){
        /* новая попытка — если перед ней была пауза */
        if (V.runStart > V.voicedAt + 250) V.uttStart = V.runStart;
        V.voicedAt = now;
      }
    } else {
      if (V.run > 0) V.quietSince = now;
      V.run = Math.max(0, V.run - dt*2);
      if (busy) V.voicedAt = Math.min(V.voicedAt, now - 300);   /* во время звука игры паузу считаем паузой */
    }
  }
  if (typeof window.setupMic === 'function'){
    const orig = window.setupMic;
    window.setupMic = async function(){
      await orig.apply(this, arguments);
      if (!V.started){ V.started = true; requestAnimationFrame(monitor); }
    };
  }
  if (typeof window.listen === 'function' && typeof micBtn !== 'undefined'){
    /* Ответ засчитывается, когда Эмили договорила: голос был, а потом ~1,1 с тишины.
       Ждём не меньше, чем нужно на фразу-образец (0,7 с на слово, минимум 1,5 с).
       Если голоса нет совсем — через 8 с попытка не засчитана; общий предел 11 с.
       Синяя кнопка засчитывает сразу. После ответа пауза 0,5 с, потом говорит следующий. */
    const SILENCE_MS = 1100, PER_WORD_MS = 700, MIN_WAIT_MS = 1500, NO_VOICE_MS = 8000, CAP_MS = 11000, AFTER_MS = 500;
    window.listen = function(){
      return new Promise(resolve => {
        const t0 = performance.now(), minWait = Math.max(MIN_WAIT_MS, V.words*PER_WORD_MS);
        micBtn.hidden = false; micBtn.classList.remove('heard'); micBtn.classList.add('on');
        let finished = false;
        const end = (ok, tapped) => {
          if (finished) return; finished = true; micTapResolve = null; micBtn.classList.remove('on');
          levelRing.style.opacity = 0;
          V.result = {ok, tapped: !!tapped, ms: Math.round(performance.now() - t0), minWait};
          if (ok){ V.usedAt = performance.now(); micBtn.classList.add('heard'); try { sfx.ding(); } catch(e){}
            setTimeout(() => { if (!micTapResolve) micBtn.hidden = true; micBtn.classList.remove('heard'); }, 600); }
          else micBtn.hidden = true;
          if (ok && !tapped) setTimeout(() => resolve(true), AFTER_MS); else resolve(ok);
        };
        micTapResolve = ok => end(ok, true);
        if (typeof mic === 'undefined' || !mic){ setTimeout(() => end(false), NO_VOICE_MS + 1000); return; }
        try { if (actx.state !== 'running') actx.resume(); } catch(e){}
        const tick = () => {
          if (finished) return;
          const now = performance.now();
          levelRing.style.opacity = Math.min(1, V.level*0.8);
          levelRing.style.transform = `scale(${0.95 + Math.min(0.5, V.level*0.12)})`;
          /* новая попытка: началась сейчас или чуть раньше значка */
          const spoke = V.uttStart > V.usedAt && V.voicedAt > t0 - EARLY_MS;
          if (spoke && now - t0 >= minWait && now - V.voicedAt >= SILENCE_MS && V.run === 0) return end(true);
          if (spoke && now - t0 > CAP_MS) return end(true);         /* говорит без пауз — тоже попытка */
          if (!spoke && now - t0 > NO_VOICE_MS) return end(false);
          requestAnimationFrame(tick);
        };
        requestAnimationFrame(tick);
      });
    };
    /* сколько слов было в последней фразе-образце: по тексту, если он есть, иначе по длине записи */
    if (typeof window.play === 'function'){
      const origPlay = window.play;
      window.play = function(name){
        try {
          const t = (typeof TEXT !== 'undefined' && TEXT[name]) ? TEXT[name][0] : null;
          const dur = (typeof BUF !== 'undefined' && BUF[name]) ? BUF[name].duration : 0;
          V.words = t ? t.split(/\s+/).filter(Boolean).length : Math.max(1, Math.round(dur/0.45));
          V.lastClip = name;
        } catch(e){}
        /* реплики по очереди: следующая начинается, только когда закончилась предыдущая */
        const self = this, args = arguments, run = () => origPlay.apply(self, args);
        const p = V.chain.then(run, run);
        V.chain = p.catch(() => {});
        return p;
      };
    }
  }
  window.__mic = V;   /* для автопроверки */

  /* ---------- то, что сейчас надо нажать: поверх героев и с широкой зоной касания ---------- */
  { const css = document.createElement('style');
    css.textContent = `
    .tapme{z-index:60 !important}
    .tapme:not(.char)::after{content:"";position:absolute;inset:-45%;border-radius:50%}`;
    document.head.appendChild(css); }

  /* ---------- кнопка «дальше» в конце уровня ---------- */
  const again = document.getElementById('again'), stage = document.getElementById('stage');
  const m = location.pathname.match(/l(\d+)\.html$/);
  if (again && stage && m){
    const n = +m[1], LAST = 12, href = n < LAST ? `l${n + 1}.html` : 'index.html';
    const css = document.createElement('style');
    css.textContent = `
    #next{position:absolute;left:auto;top:auto;right:calc(20px + env(safe-area-inset-right,0px));bottom:calc(20px + env(safe-area-inset-bottom,0px));z-index:97;width:min(26vw,30vh,170px);height:min(26vw,30vh,170px);border-radius:50%;
      background:#32b67a;box-shadow:0 8px 0 #1f8a5a,0 0 0 0 rgba(50,182,122,.5);display:grid;place-items:center;animation:nextpulse 1.4s ease-in-out infinite;-webkit-tap-highlight-color:transparent}
    #next svg{width:52%;height:52%;margin-left:6%}
    #next[hidden]{display:none}
    @keyframes nextpulse{0%,100%{transform:scale(1);box-shadow:0 8px 0 #1f8a5a,0 0 0 0 rgba(50,182,122,.45)}50%{transform:scale(1.06);box-shadow:0 8px 0 #1f8a5a,0 0 0 22px rgba(50,182,122,0)}}
    #again{left:calc(20px + env(safe-area-inset-left,0px)) !important;right:auto !important;top:auto !important;bottom:calc(20px + env(safe-area-inset-bottom,0px)) !important;transform:none !important;width:84px !important;height:84px !important;animation:none !important}
    #again svg{width:44px !important;height:44px !important}
    /* наклейка-награда сверху по центру, кнопки «ещё раз» и «дальше» — в нижних углах, ничего не перекрывается */
    #sticker{top:9% !important;width:min(26vw,40vh,230px) !important}
    #sticker > svg,#sticker > img{position:absolute;left:14%;top:14%;width:72% !important;height:72% !important;object-fit:contain}
    @media (prefers-reduced-motion:reduce){#next{animation:none}}`;
    document.head.appendChild(css);
    const a = document.createElement('a'); a.id = 'next'; a.href = href; a.hidden = true;
    a.setAttribute('aria-label', n < LAST ? 'Следующий уровень' : 'На карту');
    a.innerHTML = n < LAST
      ? '<svg viewBox="0 0 24 24"><path d="M5 4l9 8-9 8z" fill="#fff"/><path d="M13 4l9 8-9 8z" fill="#fff" opacity=".85"/></svg>'
      : '<svg viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"><path d="M3 11l9-7 9 7"/><path d="M5 10v10h14V10"/><path d="M10 20v-6h4v6"/></svg>';
    a.addEventListener('click', () => { try { if (typeof sfx !== 'undefined') sfx.pop(); } catch(e){} });
    stage.appendChild(a);
    const sync = () => { a.hidden = again.hidden; };
    new MutationObserver(sync).observe(again, {attributes: true, attributeFilter: ['hidden']});
    again.addEventListener('click', () => { a.hidden = true; });
    sync();
  }
})();
