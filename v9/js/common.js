/* ---------- прогресс, цены и режим разработчика (общие для карты и всех игр) ----------
   localStorage 'emily-game': {done, bones (кошелёк), earned, friends, mini, own: {lvl, mini, hair}} — own: открыто для Эмили насовсем
   (уровень без прохождения предыдущего, мини-игра бесплатно, причёска куплена или подарена). 'emily-dev' = '1' — режим разработчика:
   всё доступно бесплатно, а игра на страницах уровней и мини-игр прогресс не меняет (запись 'emily-game' там отключается).
   Новый игрок: кошелёк 0, открыт уровень 0; дальше уровень открывается, когда пройден предыдущий; мини-игры и причёски — за косточки. */
window.Game = (function(){
  const KEY = 'emily-game';
  const G = {
    KEY,
    /* награда за уровень: короткие 4, средние 5, длинные 6 (считает Эмили, максимум 10) */
    LEVEL_BONES: {0: 4, 1: 6, 2: 6, 3: 4, 4: 6, 5: 6, 6: 6, 7: 5, 8: 4, 9: 5, 10: 4, 11: 6, 12: 5, 13: 5, 14: 6, 15: 5, 16: 5, 17: 6, 18: 6, 19: 6, 20: 6},
    /* мини-игры: ключ, страница, максимум награды, цена (в полтора раза выше максимума — один выигрыш не окупает следующую игру) */
    MINIS: {race: {page: 1, max: 10, price: 15}, theo: {page: 2, max: 10, price: 15}, fangen: {page: 3, max: 3, price: 5},
            schaukel: {page: 4, max: 5, price: 7}, fussball: {page: 5, max: 8, price: 10}},   /* качели и футбол: цена чуть выше максимума награды */
    HAIR_PRICE: [0, 8, 10, 12, 15, 18, 20, 25],            /* причёска 0 — своя, всегда есть */
    load(){ try { return JSON.parse(localStorage.getItem(KEY) || '{}') || {}; } catch(e){ return {}; } },
    save(d){ try { localStorage.setItem(KEY, JSON.stringify(d)); } catch(e){} },
    dev(){ try { return localStorage.getItem('emily-dev') === '1'; } catch(e){ return false; } },
    own(kind, id){ const o = (G.load().own || {})[kind] || {}; return !!o[id]; },
    setOwn(kind, id, on){ const d = G.load(); d.own = d.own || {}; d.own[kind] = d.own[kind] || {}; if (on) d.own[kind][id] = 1; else delete d.own[kind][id]; G.save(d); },
    levelOpen(i){ const d = G.load(); return i === 0 || !!(d.done || {})[i - 1] || !!((d.own || {}).lvl || {})[i]; },
    miniFree(key){ return G.dev() || G.own('mini', key); },
    reset(){ try { localStorage.removeItem(KEY); localStorage.removeItem('emily-hair'); } catch(e){} }
  };
  const path = location.pathname, lv = path.match(/\/l(\d+)\.html$/), mn = path.match(/\/m(\d+)\.html$/);
  G.level = lv ? +lv[1] : -1;
  G.miniKey = mn ? Object.keys(G.MINIS).find(k => G.MINIS[k].page === +mn[1]) : null;
  if (lv || mn){
    /* свободная игра: прогресс Эмили не трогаем */
    if (G.dev()){ const set = Storage.prototype.setItem; Storage.prototype.setItem = function(k, v){ if (this === localStorage && k === KEY) return; return set.call(this, k, v); }; }
    /* закрытый уровень по прямой ссылке — на карту */
    else if (lv && !G.levelOpen(G.level)) location.replace('index.html');
  }
  /* синяя кнопка микрофона засчитывает ответ только в режиме разработчика: Эмили должна сказать вслух.
     Стук пальца по экрану микрофон тоже слышит — 0,7 с после нажатия звук не считается голосом */
  const micGuard = e => {
    if (!e.target.closest || !e.target.closest('#mic') || G.dev()) return;
    e.stopImmediatePropagation(); e.preventDefault();
    if (window.__mic) window.__mic.busyUntil = performance.now() + 700;
  };
  for (const t of ['pointerdown', 'pointerup', 'touchstart', 'touchend', 'mousedown', 'click']) document.addEventListener(t, micGuard, {capture: true, passive: false});
  if (G.miniKey){
    /* мини-игра: заход только после оплаты на карте (пропуск в sessionStorage), «ещё раз» — снова за косточки */
    const k = G.miniKey, price = G.MINIS[k].price;
    document.addEventListener('click', e => {
      if (G.miniFree(k)) return;
      if (e.target.closest('#go')){
        let pass = null; try { pass = sessionStorage.getItem('emily-pass'); sessionStorage.removeItem('emily-pass'); } catch(e){}
        if (pass !== k){ e.stopImmediatePropagation(); location.href = 'index.html'; }
      } else if (e.target.closest('#again')){
        if (!(window.Wallet && Wallet.spend(price))){ e.stopImmediatePropagation(); location.href = 'index.html'; }
      }
    }, true);
  }
  return G;
})();

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
    /* кусочек фразы (js/repeat.js ставит V.quick = число слов кусочка): ждём меньше — 0,6 с тишины, минимум 0,8 с, пауза после 0,15 с */
    window.listen = function(){
      const quick = V.quick; V.quick = 0;
      const silenceMs = quick ? 600 : SILENCE_MS, afterMs = quick ? 150 : AFTER_MS;
      return new Promise(resolve => {
        const t0 = performance.now(), minWait = quick ? Math.max(800, quick*400) : Math.max(MIN_WAIT_MS, V.words*PER_WORD_MS);
        micBtn.hidden = false; micBtn.classList.remove('heard'); micBtn.classList.add('on');
        let finished = false;
        const end = (ok, tapped) => {
          if (finished) return; finished = true; micTapResolve = null; micBtn.classList.remove('on');
          levelRing.style.opacity = 0;
          V.result = {ok, tapped: !!tapped, ms: Math.round(performance.now() - t0), minWait};
          if (ok){ V.usedAt = performance.now(); micBtn.classList.add('heard'); try { sfx.ding(); } catch(e){}
            setTimeout(() => { if (!micTapResolve) micBtn.hidden = true; micBtn.classList.remove('heard'); }, 600); }
          else micBtn.hidden = true;
          if (ok && !tapped) setTimeout(() => resolve(true), afterMs); else resolve(ok);
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
          if (spoke && now - t0 >= minWait && now - V.voicedAt >= silenceMs && V.run === 0) return end(true);
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

  /* ---------- глубина: герои спереди стоят не в одну линию, а немного друг за другом ----------
     Дальний герой чуть выше на полу и чуть меньше, ближний его перекрывает. Эмили и Тео — ближе всех.
     Работает там, где уровень ставит героя «спереди» на линию пола; уровни 1 и 2 делают глубину сами. */
  const LV = +((location.pathname.match(/l(\d+)\.html$/) || [])[1] ?? -1);
  const FRONT_DEPTH = Object.assign({emily: 0, theo: 0.05, mark: 0.3, isabel: 0.45, paul: 0.6, sommer: 0.35, baker: 0}, window.FRONT_DEPTH || {});
  if (!window.__noDepth && LV > 2 && typeof window.placeHero === 'function' && typeof L !== 'undefined'){
    const origPlace = window.placeHero;
    window.placeHero = function(h){
      const r = origPlace.apply(this, arguments);
      try {
        const w = h.where || {};
        if (w.kind === 'front' && w.t === undefined && h.box && L.backY && Math.abs(h.box.y + h.box.h - L.floorY) < 1){
          const d = FRONT_DEPTH[h.name] || 0;
          if (d > 0){
            const lift = Math.min((L.floorY - L.backY)*0.35, L.hE*0.16)*d;
            h.put(h.box.x + h.box.w/2, L.floorY - lift, 1 - 0.1*d);
          }
          const z = +h.el.style.zIndex || 50;
          if (z >= 40 && z <= 60) h.el.style.zIndex = 50 - Math.round(d*8);
        }
      } catch(e){}
      return r;
    };
  }

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
    const n = +m[1], LAST = 20, href = n < LAST ? `l${n + 1}.html` : 'index.html';
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

/* ---------- общий кошелёк косточек (сундучок) и подсчёт косточек в конце игры ----------
   Баланс один на всю игру: localStorage 'emily-game'.bones — сколько косточек можно потратить (мини-игры станут платными),
   .earned — сколько заработано за всё время (по нему открываются причёски, траты их не закрывают).
   countBones(n, {from, hide, intro, voice}) — в конце уровня или мини-игры: косточки выстраиваются в ряд, Эмили считает их
   вслух по одной (после каждого числа — микрофон), потом косточки падают в сундучок. На уровнях n берётся из Game.LEVEL_BONES.
   Сам баланс показывается только на карте; в играх сундучок появляется лишь на время подсчёта. */
(function(){
  const KEY = 'emily-game';
  const CB_SND = {"e_1": "assets/snd/47c925770470.mp3", "e_2": "assets/snd/918ef9b62ef0.mp3", "e_3": "assets/snd/510e7125b84e.mp3", "e_4": "assets/snd/eedc12bfb218.mp3", "e_5": "assets/snd/61057bf82030.mp3", "e_6": "assets/snd/f1d18f32c4f6.mp3", "e_7": "assets/snd/ce569c9a5108.mp3", "e_8": "assets/snd/ee98e8bfbe63.mp3", "e_9": "assets/snd/742279368294.mp3", "e_10": "assets/snd/46a8ffbe7b43.mp3", "e_11": "assets/snd/b3092361945a.mp3", "e_12": "assets/snd/ff5ef4e6c6ad.mp3", "e_13": "assets/snd/2342f25d6853.mp3", "e_14": "assets/snd/ab206047d729.mp3", "e_15": "assets/snd/5782cc7126d4.mp3", "e_16": "assets/snd/bda8543a0fa5.mp3", "e_17": "assets/snd/e92e903d2a89.mp3", "e_18": "assets/snd/d96da37b4c68.mp3", "e_19": "assets/snd/bf49ac088cdc.mp3", "e_20": "assets/snd/6eb46e3201f0.mp3", "a_knochen_zaehlen": "assets/snd/d6bd5c9baa28.mp3", "a_schatzkiste": "assets/snd/69752bae3814.mp3", "a_nach": "assets/snd/ca5aa096bdb0.mp3", "r_repeat": "assets/snd/17dff5d39745.mp3"};
  const load = () => { try { return JSON.parse(localStorage.getItem(KEY) || '{}') || {}; } catch(e){ return {}; } };
  const save = d => { try { localStorage.setItem(KEY, JSON.stringify(d)); } catch(e){} };
  const Wallet = window.Wallet = {
    balance: () => load().bones || 0,
    earned: () => { const d = load(); return d.earned ?? d.bones ?? 0; },
    add(n){ const d = load(); d.earned = (d.earned ?? d.bones ?? 0) + n; d.bones = (d.bones || 0) + n; save(d); },
    spend(n){ const d = load(); if ((d.bones || 0) < n) return false; d.earned = d.earned ?? d.bones; d.bones -= n; save(d); return true; }
  };
  const BONE = '<svg viewBox="0 0 100 44" aria-hidden="true"><path d="M22 10a10 10 0 1 0-9 15a10 10 0 1 0 9 15h56a10 10 0 1 0 9-15a10 10 0 1 0-9-15z" fill="#fff7e6" stroke="#c9a77a" stroke-width="4" stroke-linejoin="round"/></svg>';
  const CHEST = '<svg viewBox="0 0 64 56" aria-hidden="true"><path d="M8 24 Q8 6 32 6 Q56 6 56 24 Z" fill="#c9843e" stroke="#7a4a1e" stroke-width="3" stroke-linejoin="round"/><g transform="translate(14 8) rotate(-18) scale(.36)"><path d="M22 10a10 10 0 1 0-9 15a10 10 0 1 0 9 15h56a10 10 0 1 0 9-15a10 10 0 1 0-9-15z" fill="#fff7e6" stroke="#c9a77a" stroke-width="6"/></g><rect x="6" y="22" width="52" height="30" rx="4" fill="#a8622a" stroke="#7a4a1e" stroke-width="3"/><path d="M6 30 h52" stroke="#ffd34d" stroke-width="4"/><rect x="27" y="26" width="10" height="12" rx="2" fill="#ffd34d" stroke="#c99a1e" stroke-width="2"/></svg>';
  const stage = document.getElementById('stage');
  if (!stage) return;
  const css = document.createElement('style');
  css.textContent = `
  #cbones .chest{position:absolute;transform-origin:50% 100%}
  #cbones .chest svg{width:100%;height:100%;display:block;filter:drop-shadow(0 6px 0 rgba(120,80,30,.25))}
  #cbones .chest.pop{animation:wpop .3s ease-out}
  @keyframes wpop{50%{transform:scale(1.15)}}
  #cbones{position:absolute;inset:0;z-index:89;pointer-events:none}
  #cbones .n{position:absolute;left:50%;top:14%;transform:translateX(-50%);font:800 clamp(64px,20vmin,170px)/1 "Trebuchet MS",system-ui,sans-serif;color:#fff;text-shadow:0 7px 0 #d65a3b,0 0 30px rgba(255,216,77,.9)}
  #cbones .n.pop{animation:cbn .4s cubic-bezier(.3,1.6,.5,1)}
  @keyframes cbn{0%{transform:translateX(-50%) scale(.3);opacity:0}100%{transform:translateX(-50%) scale(1);opacity:1}}
  #cbones .b{position:absolute;filter:drop-shadow(0 4px 0 rgba(120,80,30,.25));transition:transform .2s}
  #cbones .b svg{width:100%;height:100%;display:block}
  #cbones .b.on{transform:scale(1.3) rotate(-8deg);filter:drop-shadow(0 0 8px #fff36b) drop-shadow(0 0 16px #ffd84d)}`;
  document.head.appendChild(css);
  /* сундучок с балансом виден только на карте (index.html); в игре он появляется лишь на время, когда в него летят косточки */

  /* записи для счёта подгружаются в общий звук страницы, как только он включится */
  let loaded = false;
  async function ensure(){
    if (loaded || typeof actx === 'undefined' || !actx || typeof BUF === 'undefined') return;
    loaded = true;
    await Promise.all(Object.entries(CB_SND).map(async ([k, uri]) => { if (BUF[k]) return;
      try { const ab = await (await fetch(uri)).arrayBuffer(); BUF[k] = await new Promise((res, rej) => { const p = actx.decodeAudioData(ab, res, rej); if (p && p.then) p.then(res, rej); }); } catch(e){} }));
  }
  const iv = setInterval(() => { if (typeof actx !== 'undefined' && actx){ clearInterval(iv); ensure(); } }, 700);
  const wait = ms => new Promise(r => setTimeout(r, ms));
  const say = k => (typeof play === 'function' && CB_SND[k]) ? play(k) : wait(600);
  const ding = (f1, f2) => { try { if (typeof sfx !== 'undefined' && sfx.tone) sfx.tone(f1, f2, 160, 'sine', .14); } catch(e){} };

  /* миска рассчитана на 3 косточки: следующие ложатся горкой сверху (boneSlot уровней 0–12) */
  if (typeof boneSlot === 'function' && typeof boneSize === 'function'){
    const slot3 = boneSlot;
    boneSlot = function(i){ const p = slot3(i % 3), s = boneSize(), row = Math.floor(i/3); p.y -= row*s*0.32; p.x += (row % 2)*s*0.14; return p; };
  }
  window.countBones = async function(n, o = {}){
    /* Считаем ровно столько, сколько Эмили заработала: на уровнях 0–12 — косточки в миске (.bone), в 13–16 и мини-играх — число n
       из кошелька игры. Награда уровня — Game.LEVEL_BONES: недостающие до неё косточки (награда за весь уровень) сначала летят в миску. */
    if (n === undefined && Game.level >= 0 && typeof flyBone === 'function' && typeof heroes !== 'undefined'){
      const want = Math.min(10, Game.LEVEL_BONES[Game.level] || 5), src = heroes.emily || heroes.theo;
      while (document.querySelectorAll('.bone').length < want){ await flyBone(src); await wait(120); }
    }
    const from = o.from || [...document.querySelectorAll('.bone')];
    if (n === undefined) n = from.length;
    n = Math.min(10, n || 0);
    if (!n) return;
    await ensure();
    const st = stage.getBoundingClientRect(), W = st.width, H = st.height;
    const box = document.createElement('div'); box.id = 'cbones'; box.innerHTML = '<div class="n" hidden></div>'; stage.appendChild(box);
    const big = box.querySelector('.n');
    const per = Math.min(n, 10), rows = Math.ceil(n/10), bw = Math.min(W/(per + 1.5), H*0.16, 96), bh = bw*0.44, gap = bw*0.12;
    const items = [];
    for (let i = 0; i < n; i++){
      const r = Math.floor(i/10), c = i % 10, inRow = Math.min(10, n - r*10);
      const x = W/2 + (c - (inRow - 1)/2)*(bw + gap) - bw/2, y = H*0.46 + r*(bh*2.2) - (rows - 1)*bh*1.1;
      const b = document.createElement('div'); b.className = 'b'; b.innerHTML = BONE;
      Object.assign(b.style, {left: x + 'px', top: y + 'px', width: bw + 'px', height: bh + 'px'}); box.appendChild(b); items.push(b);
      const s = from[i] || from[0];
      if (s && s.getBoundingClientRect){ const sr = s.getBoundingClientRect();
        b.animate([{transform: `translate(${sr.left - st.left + sr.width/2 - x - bw/2}px,${sr.top - st.top + sr.height/2 - y - bh/2}px) scale(.6)`}, {transform: 'none'}], {duration: 600, delay: i*60, easing: 'cubic-bezier(.3,.7,.4,1)', fill: 'backwards'}); }
      else b.animate([{transform: 'scale(0)'}, {transform: 'none'}], {duration: 350, delay: i*60, easing: 'cubic-bezier(.3,1.6,.5,1)', fill: 'backwards'});
    }
    if (o.hide) o.hide.forEach(e => e && (e.hidden = true));
    await wait(700 + n*60);
    if (o.voice !== false){
      /* считает Эмили: косточка загорается, звучит число, микрофон ждёт, пока Эмили его скажет, только потом следующая.
         Молчит — образец, ещё раз образец, «Sag es nach!» + образец, русская подсказка + образец, потом дальше (как при счёте в прятках) */
      if (o.intro !== false) await say('a_knochen_zaehlen');
      for (let i = 1; i <= n; i++){
        items.forEach(b => b.classList.remove('on')); items[i - 1].classList.add('on');
        big.hidden = false; big.textContent = i; big.classList.remove('pop'); void big.offsetWidth; big.classList.add('pop');
        ding(700 + i*30, 900 + i*30);
        for (let a = 0; a < 4; a++){
          if (a === 2) await say('a_nach');
          if (a === 3) await say('r_repeat');
          await say('e_' + i); await wait(100);
          if (typeof listen !== 'function'){ await wait(900); break; }
          if (await listen()) break;
        }
      }
      items.forEach(b => b.classList.remove('on')); await wait(300);
    }
    /* в сундучок: он появляется под косточками, косточки падают в него по одной */
    const cw = Math.min(W*0.22, H*0.26, 170), chest = document.createElement('div'); chest.className = 'chest'; chest.innerHTML = CHEST;
    const cx = W/2 - cw/2, cy = Math.min(H*0.92 - cw*0.875, H*0.46 + rows*bh*1.2 + bh);
    Object.assign(chest.style, {left: cx + 'px', top: cy + 'px', width: cw + 'px', height: cw*0.875 + 'px'}); box.appendChild(chest);
    big.hidden = true;
    await chest.animate([{transform: 'scale(0)'}, {transform: 'none'}], {duration: 380, easing: 'cubic-bezier(.3,1.6,.5,1)'}).finished.catch(() => {});
    const talk = say('a_schatzkiste');
    const tx = cx + cw/2, ty = cy + cw*0.3;
    for (const b of items){
      const r = b.getBoundingClientRect(), bx = r.left - st.left + r.width/2, by = r.top - st.top + r.height/2;
      b.animate([{transform: 'none', opacity: 1}, {transform: `translate(${tx - bx}px,${ty - by}px) scale(.45)`, opacity: .9}], {duration: 520, easing: 'cubic-bezier(.4,0,.6,1)', fill: 'forwards'})
        .finished.then(() => { b.remove(); chest.classList.remove('pop'); void chest.offsetWidth; chest.classList.add('pop'); ding(1900, 1700); }).catch(() => {});
      await wait(Math.max(90, 700/n));
    }
    await wait(600); await talk;
    if (!Game.dev()) Wallet.add(n);                                          /* свободная игра косточек не даёт */
    await chest.animate([{transform: 'none', opacity: 1}, {transform: 'scale(.3)', opacity: 0}], {duration: 350, fill: 'forwards'}).finished.catch(() => {});
    box.remove();
  };
})();
