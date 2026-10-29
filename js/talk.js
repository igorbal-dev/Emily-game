/* Движок разговорных уровней (13 и дальше). Работает поверх js/mini.js (звук, голоса, микрофон, старт).
   Уровень задаёт: LEVEL (номер), STICKER (svg наклейки), drawScene(g, W, H, L) — фон кодом, и async function story() — сценарий.
   Правила игры: фраза-образец → Эмили повторяет; подсказки два раза по-немецки, потом по-русски; текста на экране нет. */
const T = {};
(function(){
  const css = document.createElement('style');
  css.textContent = `
  #bg{position:absolute;left:0;top:0;display:block}
  .char{position:absolute;pointer-events:none;transform-origin:50% 100%;transition:none}
  .char .body{position:absolute;inset:0;transform-origin:50% 100%;animation:breathe 2.6s ease-in-out infinite}
  .char img{position:absolute;left:0;bottom:0;width:100%;height:100%;object-fit:contain;object-position:50% 100%;max-width:none}
  .char .shadow{position:absolute;left:12%;right:12%;bottom:-3%;height:7%;border-radius:50%;background:rgba(60,30,10,.2)}
  .char.flip .body{transform:scaleX(-1)}
  .char.tap{pointer-events:auto;cursor:pointer}
  @keyframes breathe{0%,100%{transform:scale(1,1)}50%{transform:scale(1.012,.988)}}
  .char.flip .body{animation:breatheF 2.6s ease-in-out infinite}
  @keyframes breatheF{0%,100%{transform:scaleX(-1)}50%{transform:scaleX(-1.012) scaleY(.988)}}
  .hop{animation:hop .7s cubic-bezier(.3,.7,.4,1)}
  @keyframes hop{0%,100%{transform:translateY(0)}45%{transform:translateY(-18%)}}
  .walking .body{animation:walkbob .34s ease-in-out infinite !important}
  @keyframes walkbob{0%,100%{transform:translateY(0) rotate(-2.5deg)}50%{transform:translateY(-4%) rotate(2.5deg)}}
  .prop{position:absolute;transform-origin:50% 100%}
  .prop svg{width:100%;height:100%;display:block;overflow:visible}
  .prop.tap{cursor:pointer}
  .prop.tight.tapme:not(.char)::after{inset:-6%}
  .tapme{animation:tapme 1.1s ease-in-out infinite !important;cursor:pointer}
  @keyframes tapme{0%,100%{filter:drop-shadow(0 0 0 rgba(255,255,255,0))}50%{filter:drop-shadow(0 0 5px #fff) drop-shadow(0 0 12px #ffd84d)}}
  .glow{filter:drop-shadow(0 0 8px #fff36b) drop-shadow(0 0 18px #ffd84d) !important}
  .shake{animation:shake .45s ease-in-out}
  @keyframes shake{0%,100%{transform:translateX(0)}25%{transform:translateX(-6%)}75%{transform:translateX(6%)}}
  #rotate{position:absolute;inset:0;z-index:95;background:#cdeeff;display:grid;place-items:center}
  #rotate svg{width:min(50vw,220px);height:auto;animation:turn 2s ease-in-out infinite}
  @keyframes turn{0%,20%{transform:rotate(0)}50%,80%{transform:rotate(-90deg)}100%{transform:rotate(0)}}
  #scenes{position:absolute;inset:0;z-index:72;display:flex;gap:4vw;align-items:center;justify-content:center;background:rgba(255,250,242,.82)}
  #scenes .card{position:relative;width:min(40vw,62vh);aspect-ratio:4/3;max-width:100%;border-radius:26px;background:var(--cardbg,#e8f6ff);border:6px solid #fff;box-shadow:0 8px 0 #d9b77a;overflow:hidden;cursor:pointer;transition:transform .25s, box-shadow .25s;padding:0}
  #scenes .card.lit{transform:scale(1.06);box-shadow:0 0 0 8px #ffd84d,0 8px 0 #d9b77a}
  #scenes .card.no{animation:shake .45s ease-in-out}
  #scenes .card img,#scenes .card .sv{position:absolute;max-width:none;pointer-events:none}
  #scenes .card .sv svg{width:100%;height:100%;display:block;overflow:visible}
  #scenes .card .ground{position:absolute;left:0;right:0;bottom:0;height:18%;background:var(--ground,#bde3a0)}
  .tear{position:absolute;width:6%;aspect-ratio:3/4;background:#5aa8f0;border-radius:50% 50% 50% 50%/60% 60% 40% 40%;animation:drip 1.2s ease-in infinite}
  @keyframes drip{0%{transform:translateY(0);opacity:1}100%{transform:translateY(180%);opacity:0}}
  .heart{position:absolute;width:12%;aspect-ratio:1;animation:float 1.6s ease-in-out infinite}
  .heart svg,.zap svg{width:100%;height:100%;display:block}
  @keyframes float{0%,100%{transform:translateY(0) scale(1)}50%{transform:translateY(-14%) scale(1.12)}}
  .zap{position:absolute;width:14%;aspect-ratio:1}
  #sticker{position:absolute;left:50%;top:9%;transform:translateX(-50%);z-index:84;width:min(26vw,40vh,230px);aspect-ratio:1;border-radius:50%;background:#fff;border:8px solid #ffd84d;box-shadow:0 8px 0 #e2b98a;animation:stickin .7s cubic-bezier(.3,1.6,.5,1)}
  #sticker > svg{position:absolute;left:14%;top:14%;width:72%;height:72%}
  @keyframes stickin{0%{transform:translateX(-50%) scale(.2) rotate(-30deg);opacity:0}100%{transform:translateX(-50%) scale(1) rotate(0);opacity:1}}
  .confetti{position:absolute;width:12px;height:18px;border-radius:3px;pointer-events:none;z-index:75}
  .fly{position:absolute;z-index:80;pointer-events:none}
  .fly svg{width:100%;height:100%;display:block}
  .swinging{animation:swing 1.6s ease-in-out infinite}
  @keyframes swing{0%,100%{transform:rotate(-13deg)}50%{transform:rotate(13deg)}}
  #fade{position:absolute;inset:0;z-index:90;background:#fffaf2;pointer-events:none;opacity:0;transition:opacity .45s}
  #fade.on{opacity:1}
  `;
  document.head.appendChild(css);
})();
const bg = $('#bg'), bgc = bg.getContext('2d');
let L = {};
T.heroes = {};
T.props = [];

/* ---------- раскладка: пол внизу, размер героев от высоты экрана ---------- */
function tLayout(){
  const W = stage.clientWidth, H = stage.clientHeight, dpr = Math.min(2, window.devicePixelRatio || 1);
  bg.width = Math.round(W*dpr); bg.height = Math.round(H*dpr); bg.style.width = W + 'px'; bg.style.height = H + 'px';
  L = {W, H, floorY: H*0.9, hE: Math.min(H*0.5, W*0.3)};
  bgc.setTransform(dpr, 0, 0, dpr, 0, 0);
  if (typeof drawScene === 'function') drawScene(bgc, W, H, L);
  for (const h of Object.values(T.heroes)) h.place();
  for (const p of T.props) p.place();
  const r = $('#rotate'); if (r) r.hidden = W >= H;
}

/* ---------- герой: картинки поз, говорит (рот двигается), ходит, прыгает ---------- */
class THero {
  constructor(name, o){
    this.name = name; this.k = o.h || 1; this.x = o.x ?? 0.5; this.d = o.d || 0; this.lift = o.lift || 0; this.outfit = o.outfit || '';
    this.poses = o.poses || ['idle', 'blink', 'talk']; this.pose = 'idle'; this.base = 'idle'; this.talking = false;
    this.el = document.createElement('div'); this.el.className = 'char'; this.el.dataset.name = name;
    this.el.innerHTML = '<div class="body"><div class="shadow"></div></div>'; this.body = this.el.firstChild;
    this.imgs = {};
    for (const p of this.poses){ const key = this.key(p); if (!IMG[key]) continue; const im = new Image(); im.src = IMG[key][0]; im.alt = ''; im.hidden = p !== 'idle'; this.imgs[p] = im; this.body.appendChild(im); }
    this.el.style.zIndex = 40 + Math.round((1 - this.d)*10);
    stage.appendChild(this.el); this.place(); this.blink();
    this.el.addEventListener('pointerdown', e => { if (T.onTap(this.el)) e.preventDefault(); });
  }
  key(p){ const k = `${this.name}_${p}${this.outfit ? '_' + this.outfit : ''}`; return IMG[k] ? k : `${this.name}_${p}`; }
  size(){ const [, w, h] = IMG[this.key('idle')]; const hh = L.hE*this.k*(1 - this.d*0.25); return {w: hh*w/h, h: hh}; }
  place(){ const s = this.size(), base = L.floorY - (L.floorY - L.H*0.55)*this.d - L.hE*this.lift;
    Object.assign(this.el.style, {left: (L.W*this.x - s.w/2) + 'px', top: (base - s.h) + 'px', width: s.w + 'px', height: s.h + 'px'}); }
  show(p){ if (!this.imgs[p]) p = 'idle'; if (p === this.pose) return; this.imgs[this.pose].hidden = true; this.imgs[p].hidden = false; this.pose = p; }
  set(p){ this.base = p; if (!this.talking) this.show(p); }
  face(left){ this.el.classList.toggle('flip', !!left); }
  async blink(){ while (true){ await sleep(2400 + Math.random()*3000); if (this.pose === 'idle' && !this.talking && this.imgs.blink){ this.show('blink'); await sleep(140); if (this.pose === 'blink') this.show('idle'); } } }
  /* говорит запись: рот открывается и закрывается, пока она звучит */
  async say(clip){
    const p = play(clip); this.talking = true; let done = false; p.finally(() => done = true);
    const seq = this.imgs.mouth1 ? ['mouth1', 'mouth2', 'mouth1', 'idle'] : this.imgs.mouth ? ['mouth', 'talk', 'mouth', 'idle'] : ['talk', 'idle'];
    let i = 0; while (!done){ this.show(seq[i++ % seq.length]); await sleep(this.imgs.mouth1 || this.imgs.mouth ? 120 : 160); }
    this.talking = false; this.show(this.base); return p;
  }
  async walkTo(x, ms){
    const from = this.x; this.x = x; this.place(); const d = (x - from)*L.W; if (!d) return;
    this.face(d < 0); this.el.classList.add('walking');
    await this.el.animate([{transform:`translateX(${-d}px)`}, {transform:'none'}], {duration: ms || Math.min(1800, 500 + Math.abs(d)*2.2), easing:'ease-in-out'}).finished.catch(() => {});
    this.el.classList.remove('walking'); this.face(false);
  }
  /* переодеться: '' — дома в носочках, 'shoes' — в туфлях, 'out' — в куртке */
  dress(o){ this.outfit = o; for (const [p, im] of Object.entries(this.imgs)) im.src = IMG[this.key(p)][0]; this.place(); }
  hop(){ this.el.classList.remove('hop'); void this.el.offsetWidth; this.el.classList.add('hop'); }
}
T.hero = (name, o = {}) => (T.heroes[name] = new THero(name, o));

/* ---------- предмет на сцене: svg, x — центр, y — низ (доли экрана), w — ширина (доля высоты героя) ---------- */
T.prop = (svg, o) => {
  const el = document.createElement('div'); el.className = 'prop'; el.innerHTML = svg; el.style.zIndex = o.z ?? 30;
  const p = {el, o, place(){ const w = L.hE*(o.w || 0.3), h = w*(o.ratio || 1);
    Object.assign(el.style, {left: ((o.px ? o.px() : L.W*o.x) - w/2) + 'px', top: ((o.py ? o.py() : L.H*o.y) - h) + 'px', width: w + 'px', height: h + 'px'}); }};
  el.addEventListener('pointerdown', e => { e.preventDefault(); if (!T.onTap(el)) { el.classList.remove('shake'); void el.offsetWidth; el.classList.add('shake'); sfx.bonk(); } });
  stage.appendChild(el); p.place(); T.props.push(p); return p;
};
T.move = async (p, x, y, ms = 700) => {
  const r0 = p.el.getBoundingClientRect(); p.o.px = null; p.o.x = x; p.o.y = y; p.place(); const r1 = p.el.getBoundingClientRect();
  await p.el.animate([{transform:`translate(${r0.left - r1.left}px,${r0.top - r1.top}px)`}, {transform:'none'}], {duration: ms, easing:'cubic-bezier(.3,.7,.4,1)'}).finished.catch(() => {});
};

/* ---------- ждём нажатия: цели мягко светятся; через 7 с подсказка по-немецки, ещё раз по-немецки, потом по-русски ---------- */
let tapR = null, tapSet = [];
T.onTap = el => { if (tapR && tapSet.includes(el)){ const r = tapR; tapR = null; r(el); return true; } return false; };
T.tap = (els, hintDe, hintRu) => {
  els = els.map(e => e.el || e); tapSet = els; els.forEach(e => { e.classList.add('tapme'); e.classList.add('tap'); });
  const p = new Promise(r => tapR = r); let done = false;
  p.then(() => { done = true; els.forEach(e => { e.classList.remove('tapme', 'glow', 'tap'); }); });
  (async () => { let k = 0; while (!done){ await sleep(7000); if (done) break; k++;
    els.forEach(e => e.classList.add('glow')); setTimeout(() => els.forEach(e => e.classList.remove('glow')), 2500);
    const de = Array.isArray(hintDe) ? hintDe[(k - 1) % hintDe.length] : hintDe;
    if (!speaking) await play(k % 3 === 0 ? hintRu : de); } })();
  return p.then(el => { sfx.pop(); return el; });
};

/* ---------- смена места: экран мягко белеет, фон перерисовывается, герои переставляются ---------- */
T.place = '';
T.go = async (place, setup) => {
  let f = $('#fade'); if (!f){ f = document.createElement('div'); f.id = 'fade'; stage.appendChild(f); }
  f.classList.add('on'); await sleep(500); T.place = place; if (setup) setup(); tLayout(); await sleep(150); f.classList.remove('on'); await sleep(450);
};
/* качели: пружинистое качание героя и сиденья вокруг точки над головой */
T.swing = (els, on, pivotY) => { for (const e of els){ const el = e.el || e;
  el.style.transformOrigin = on ? `50% ${(pivotY - el.offsetTop)/el.offsetHeight*100}%` : ''; el.classList.toggle('swinging', on); } };
/* герой плавно едет в новую точку (горка, качели): x — доля ширины, lift — высота над полом в ростах */
T.glide = async (h, x, lift, ms = 900, easing = 'ease-in') => {
  const r0 = h.el.getBoundingClientRect(); h.x = x; h.lift = lift; h.place(); const r1 = h.el.getBoundingClientRect();
  await h.el.animate([{transform:`translate(${r0.left - r1.left}px,${r0.top - r1.top}px)`}, {transform:'none'}], {duration: ms, easing}).finished.catch(() => {});
};

/* ---------- Эмили повторяет фразу: образец, образец, «Sag es nach!» + образец, русская подсказка + образец ---------- */
T.repeat = async (model, hero) => {
  hero = hero || T.heroes.emily;
  for (let i = 0; i < 4; i++){
    if (i === 2) await play('a_nach');
    if (i === 3) await play('r_like_emily');
    await hero.say(model);
    await sleep(150);
    if (await listen()) { T.stars++; return true; }
  }
  return false;
};

/* ---------- выбор из двух картинок-сцен (как поступить) ---------- */
const HEART_SVG = '<svg viewBox="0 0 100 100"><path d="M50 88 C10 60 8 30 30 22 C42 18 50 28 50 34 C50 28 58 18 70 22 C92 30 90 60 50 88 Z" fill="#ff6b8a" stroke="#d6476a" stroke-width="5"/></svg>';
const ZAP_SVG = '<svg viewBox="0 0 100 100"><path d="M10 50 h60 M50 26 l26 24 l-26 24" fill="none" stroke="#ff3b3b" stroke-width="12" stroke-linecap="round" stroke-linejoin="round"/></svg>';
/* parts: {img:'emily_idle_out', x, h, flip} — герой (x центр в %, h высота в %), {svg, x, y, w, hh} — предмет, {fx:'tears'|'hearts'|'zap', x, y, flip} */
function sceneCard(parts, bgc, ground){
  const c = document.createElement('button'); c.className = 'card'; c.type = 'button';
  if (bgc) c.style.setProperty('--cardbg', bgc); if (ground) c.style.setProperty('--ground', ground);
  c.innerHTML = '<span class="ground"></span>';
  for (const p of parts){
    if (p.img){ const [src, w, h] = IMG[p.img], im = document.createElement('img'); im.src = src; im.alt = '';
      const ww = p.h*(w/h)*0.75; Object.assign(im.style, {height: p.h + '%', left: (p.x - ww/2) + '%', bottom: (p.b ?? 8) + '%', transform: (p.flip ? 'scaleX(-1) ' : '') + (p.rot ? `rotate(${p.rot}deg)` : ''), transformOrigin: '50% 100%'}); c.appendChild(im); }
    else if (p.svg){ const d = document.createElement('span'); d.className = 'sv'; d.innerHTML = p.svg; Object.assign(d.style, {left: (p.x - p.w/2) + '%', top: p.y + '%', width: p.w + '%', height: (p.hh ?? p.w*1.33) + '%'}); c.appendChild(d); }
    else if (p.fx === 'tears'){ for (const dx of [-3, 3]){ const t = document.createElement('i'); t.className = 'tear'; Object.assign(t.style, {left: (p.x + dx) + '%', top: p.y + '%', animationDelay: (dx > 0 ? .6 : 0) + 's'}); c.appendChild(t); } }
    else if (p.fx === 'hearts'){ for (const [dx, dy, dl] of [[-8, 0, 0], [6, -6, .5], [0, -14, 1]]){ const t = document.createElement('i'); t.className = 'heart'; t.innerHTML = HEART_SVG; Object.assign(t.style, {left: (p.x + dx) + '%', top: (p.y + dy) + '%', animationDelay: dl + 's'}); c.appendChild(t); } }
    else if (p.fx === 'zap'){ const t = document.createElement('i'); t.className = 'zap'; t.innerHTML = ZAP_SVG; Object.assign(t.style, {left: p.x + '%', top: p.y + '%', transform: p.flip ? 'scaleX(-1)' : ''}); c.appendChild(t); }
  }
  return c;
}
/* opts: [{parts, clip, ok}]. Ведущая озвучивает обе картинки (картинка подсвечивается), спрашивает; неверно — мягкое объяснение и снова. */
T.choose = async (opts, askClip, ruAsk, wrongClip) => {
  let box = $('#scenes'); if (!box){ box = document.createElement('div'); box.id = 'scenes'; stage.appendChild(box); }
  while (true){
    box.innerHTML = ''; box.hidden = false;
    const cards = opts.map(o => sceneCard(o.parts, o.bg, o.ground)); cards.forEach(c => { c.classList.add('tapme'); box.appendChild(c); });
    let picked = null, res; const p = new Promise(r => res = r);
    cards.forEach((c, i) => c.addEventListener('click', () => { if (picked === null){ picked = i; res(i); } }));
    const narrate = async () => { for (let i = 0; i < opts.length && picked === null; i++){ cards[i].classList.add('lit'); await play(opts[i].clip); cards[i].classList.remove('lit'); await sleep(200); } };
    (async () => { await narrate(); if (picked === null) await play(askClip); let k = 0;
      while (picked === null){ await sleep(9000); if (picked !== null) break; k++; if (k % 3 === 2) await play(ruAsk); else { await narrate(); if (picked === null) await play(askClip); } } })();
    const i = await p;
    if (opts[i].ok !== false){ cards[i].classList.add('lit'); sfx.ding(); await sleep(500); box.hidden = true; return i; }
    cards[i].classList.add('no'); sfx.bonk(); await sleep(400); box.hidden = true; await play(wrongClip); await sleep(300);
  }
};

/* ---------- косточка за хороший ответ: летит в кошелёк ---------- */
T.bones = 0; T.stars = 0;
T.bone = async (from) => {
  const st = stage.getBoundingClientRect(), r = (from && (from.el || from).getBoundingClientRect()) || {left: st.width/2, top: st.height/2, width: 0, height: 0};
  const f = document.createElement('div'); f.className = 'fly'; f.innerHTML = BONE_SVG; const w = L.hE*0.22;
  Object.assign(f.style, {left: (r.left - st.left + r.width/2 - w/2) + 'px', top: (r.top - st.top + r.height*0.3) + 'px', width: w + 'px', height: w*0.44 + 'px'}); stage.appendChild(f);
  const pr = $('#purse'); pr.hidden = false; const tr = pr.getBoundingClientRect();
  await f.animate([{transform:'translate(0,0) scale(1)'}, {transform:`translate(${tr.left - st.left - parseFloat(f.style.left)}px,${tr.top - st.top - parseFloat(f.style.top)}px) scale(.5)`}], {duration: 800, easing:'cubic-bezier(.4,0,.6,1)'}).finished.catch(() => {});
  f.remove(); T.bones++; purse(T.bones); sfx.ding();
};

/* ---------- конец уровня: конфетти, наклейка, прогресс на карте ---------- */
function confetti(){
  const colors = ['#ff7a59','#ffd34d','#32b67a','#2f80ed','#ff8fc8','#9b6bff'];
  for (let i = 0; i < 60; i++){
    const c = document.createElement('div'); c.className = 'confetti'; c.style.background = colors[i % colors.length]; c.style.left = Math.random()*L.W + 'px'; c.style.top = '-20px'; stage.appendChild(c);
    c.animate([{transform:'translate(0,0) rotate(0)'}, {transform:`translate(${(Math.random() - .5)*160}px,${L.H + 40}px) rotate(${Math.random()*720}deg)`}], {duration: 2200 + Math.random()*1800, delay: Math.random()*600, easing:'cubic-bezier(.25,.6,.5,1)', fill:'forwards'}).finished.then(() => c.remove()).catch(() => c.remove());
  }
}
T.finish = async () => {
  confetti(); sfx.fanfare(); await play('a_final');
  /* Эмили считает косточки за уровень, они летят в общий сундучок (js/common.js) */
  if (window.countBones) await countBones(Math.max(1, T.bones), {from: [$('#purse')], hide: [$('#purse')]});
  try {
    const d = JSON.parse(localStorage.getItem('emily-game') || '{}') || {};
    d.done = d.done || {}; d.done[LEVEL] = (d.done[LEVEL] || 0) + 1;
    if (typeof FRIENDS !== 'undefined'){ d.friends = d.friends || {}; FRIENDS.forEach(f => d.friends[f] = true); }   /* новые знакомые — в альбом */
    localStorage.setItem('emily-game', JSON.stringify(d));
  } catch(e){}
  const s = document.createElement('div'); s.id = 'sticker'; s.innerHTML = STICKER; stage.appendChild(s);
  $('#again').hidden = false;
  $('#again').addEventListener('click', () => s.remove(), {once: true});
};

/* ---------- старт ---------- */
T.start = (goImg, reset) => {
  addEventListener('resize', tLayout); addEventListener('orientationchange', () => setTimeout(tLayout, 200));
  tLayout();
  miniStart(goImg, async () => { T.bones = 0; T.stars = 0; $('#purse').hidden = true; if (reset) reset(); tLayout(); await sleep(300); await story(); await T.finish(); });
};
