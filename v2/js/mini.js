/* Общее для мини-игр (m2, m3, …): звуки, голоса, микрофон, картинки, старт, сохранение косточек.
   Страница мини-игры задаёт IMG и SND (их подставляет tools/build_minigames.py), подключает этот файл,
   свой код игры, потом js/screen.js и js/common.js (мягкий микрофон, реплики по очереди). */
const TEXT = {};
const BONE_SVG = '<svg viewBox="0 0 100 44" aria-hidden="true"><path d="M22 10a10 10 0 1 0-9 15a10 10 0 1 0 9 15h56a10 10 0 1 0 9-15a10 10 0 1 0-9-15z" fill="#fff7e6" stroke="#c9a77a" stroke-width="4" stroke-linejoin="round"/></svg>';
const BONE_PATH = new Path2D('M22 10a10 10 0 1 0-9 15a10 10 0 1 0 9 15h56a10 10 0 1 0 9-15a10 10 0 1 0-9-15z');
const $ = s => document.querySelector(s);
const stage = $('#stage');
const sleep = ms => new Promise(r => setTimeout(r, ms));
const pick = a => a[Math.floor(Math.random()*a.length)];
const clamp = (v, a, b) => Math.max(a, Math.min(b, v));

/* ---------- картинки ---------- */
const PIC = {};
for (const [k, [src, w, h]] of Object.entries(IMG)){ const im = new Image(); im.src = src; PIC[k] = {im, w, h}; }
/* рисует картинку: x — центр, yBottom — низ, h — высота */
function drawImg(g, key, x, yBottom, h, flip, alpha){
  const p = PIC[key]; if (!p || !p.im.complete || !p.im.naturalWidth) return 0;
  const w = h*p.w/p.h;
  g.save(); if (alpha !== undefined) g.globalAlpha = alpha; g.translate(x, yBottom); if (flip) g.scale(-1, 1);
  g.drawImage(p.im, -w/2, -h, w, h); g.restore();
  return w;
}
function boneAt(g, x, y, w, rot){
  g.save(); g.translate(x, y); g.rotate(rot || 0); g.scale(w/100, w/100); g.translate(-50, -22);
  g.fillStyle = '#fff7e6'; g.fill(BONE_PATH); g.lineWidth = 4; g.strokeStyle = '#c9a77a'; g.stroke(BONE_PATH); g.restore();
}

/* ---------- звуки ---------- */
let actx = null;
const sfx = {
  tone(f1, f2, ms, type='sine', vol=.18){
    if (!actx) return; const t = actx.currentTime, o = actx.createOscillator(), gn = actx.createGain();
    o.type = type; o.frequency.setValueAtTime(f1, t); o.frequency.exponentialRampToValueAtTime(f2, t+ms/1000);
    gn.gain.setValueAtTime(vol, t); gn.gain.exponentialRampToValueAtTime(.001, t+ms/1000);
    o.connect(gn).connect(actx.destination); o.start(t); o.stop(t+ms/1000+.02);
  },
  noise(ms, freq, vol){ if (!actx) return; const n = Math.round(actx.sampleRate*ms/1000), b = actx.createBuffer(1, n, actx.sampleRate), d = b.getChannelData(0);
    for (let i = 0; i < n; i++) d[i] = (Math.random()*2 - 1)*Math.pow(1 - i/n, 2);
    const s = actx.createBufferSource(), f = actx.createBiquadFilter(), gn = actx.createGain(); s.buffer = b; f.type = 'bandpass'; f.frequency.value = freq; f.Q.value = .9;
    gn.gain.value = vol; s.connect(f).connect(gn).connect(actx.destination); s.start(); },
  pop(){ this.tone(500, 900, 120, 'triangle', .22); },
  ding(){ this.tone(880, 1320, 200, 'triangle', .2); setTimeout(() => this.tone(1320, 1760, 240, 'triangle', .16), 110); },
  clink(){ this.tone(1900, 1700, 160, 'sine', .14); setTimeout(() => this.tone(2600, 2400, 120, 'sine', .08), 60); },
  bonk(){ this.tone(180, 110, 220, 'triangle', .22); },
  snort(){ this.noise(260, 420, .5); },
  whoosh(){ this.noise(300, 1500, .25); },
  fanfare(){ [523, 659, 784, 1046].forEach((f, i) => setTimeout(() => this.tone(f, f, 260, 'triangle', .18), i*140)); }
};
const BUF = {};
let speaking = 0;
function decode(ab){ return new Promise((res, rej) => { const p = actx.decodeAudioData(ab, res, rej); if (p && p.then) p.then(res, rej); }); }
async function loadSounds(){ await Promise.all(Object.entries(SND).map(async ([k, uri]) => { try { BUF[k] = await decode(await (await fetch(uri)).arrayBuffer()); } catch(e){} })); }
async function play(name){
  speaking++;
  try {
    const b = BUF[name];
    if (actx && b){
      if (actx.state !== 'running') actx.resume();
      await new Promise(resolve => {
        const s = actx.createBufferSource(); s.buffer = b; s.connect(actx.destination);
        let done = false; const fin = () => { if (!done){ done = true; resolve(); } };
        s.onended = fin; setTimeout(fin, b.duration*1000 + 400); s.start();
      });
    } else await sleep(300);
  } finally { speaking--; }
}
const PRAISE = ['a_super', 'a_toll', 'a_prima', 'a_juhu', 'a_wunderbar'];
function praise(){ return play(pick(PRAISE)); }

/* ---------- микрофон (js/common.js делает его мягким: ждёт, пока Эмили договорит) ---------- */
let mic = null;
const micBtn = $('#mic'), levelRing = $('#level');
let micTapResolve = null;
micBtn.addEventListener('pointerdown', e => { e.preventDefault(); e.stopPropagation(); if (micTapResolve) micTapResolve(true); });
async function setupMic(){
  try {
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) return;
    const stream = await navigator.mediaDevices.getUserMedia({audio:{echoCancellation:true, noiseSuppression:true, autoGainControl:true}});
    const src = actx.createMediaStreamSource(stream), an = actx.createAnalyser();
    an.fftSize = 1024; src.connect(an);
    mic = {analyser:an, buf:new Float32Array(an.fftSize)};
  } catch(e){ mic = null; }
}
function listen(ms=6000){
  return new Promise(resolve => { micBtn.hidden = false; micBtn.classList.add('on');
    micTapResolve = ok => { micTapResolve = null; micBtn.classList.remove('on'); micBtn.hidden = true; resolve(ok); };
    setTimeout(() => micTapResolve && micTapResolve(false), ms); });
}
/* мультяшный герой говорит образец, настоящая Эмили повторяет: образец, ещё раз «Sag es nach!», потом русская подсказка */
async function repeatAfter(model, onSay){
  for (let i = 0; i < 3; i++){
    if (i === 1) await play('a_nach');
    if (i === 2) await play('r_like_emily');
    const p = play(model); if (onSay) onSay(p); await p;
    await sleep(120);
    if (await listen()) return true;
  }
  return false;
}

/* ---------- счёт на экране ---------- */
function showNum(n){ const box = $('#count'), num = $('#num'); box.hidden = false; num.textContent = n; num.classList.remove('pop'); void num.offsetWidth; num.classList.add('pop'); }
function hideNum(){ $('#count').hidden = true; }
/* выбор числа из трёх карточек; ждёт нажатия, подсказки: два раза по-немецки, потом по-русски */
function numChoice(opts, right, askDe, askRu, onWrong){
  return new Promise(resolve => {
    const box = $('#numchoice'); box.innerHTML = ''; box.hidden = false;
    let done = false, wrong = 0;
    const btns = opts.map(n => {
      const b = document.createElement('button'); b.type = 'button'; b.setAttribute('aria-label', String(n));
      b.innerHTML = `<b>${n}</b>`; box.appendChild(b);
      b.addEventListener('pointerdown', async e => {
        e.preventDefault(); e.stopPropagation(); if (done) return;
        if (n === right){ done = true; sfx.ding(); b.classList.add('ok'); await sleep(500); box.hidden = true; resolve(wrong); }
        else { wrong++; sfx.bonk(); b.classList.add('no'); setTimeout(() => b.classList.remove('no'), 500); if (onWrong) onWrong(); }
      });
      return b;
    });
    (async () => { let k = 0; while (!done){ await sleep(7000); if (done) break; k++;
      btns.forEach(b => b.classList.add('glowb')); setTimeout(() => btns.forEach(b => b.classList.remove('glowb')), 2500);
      await play(k % 3 === 2 ? askRu : askDe); } })();
  });
}

/* ---------- косточки ---------- */
/* конец мини-игры: Эмили считает косточки, они летят в общий сундучок (countBones в js/common.js), игра отмечается на карте */
async function saveMini(key, bones, o){
  if (bones && window.countBones) await countBones(bones, Object.assign({from: [$('#purse')], hide: [$('#purse')]}, o));
  try {
    const d = JSON.parse(localStorage.getItem('emily-game') || '{}') || {};
    d.mini = d.mini || {}; d.mini[key] = (d.mini[key] || 0) + 1;
    localStorage.setItem('emily-game', JSON.stringify(d));
  } catch(e){}
}
function purse(n){ const p = $('#purse'); p.hidden = false; $('#purseNum').textContent = n; p.classList.remove('pop'); void p.offsetWidth; p.classList.add('pop'); }

/* ---------- старт ---------- */
function miniStart(goImg, run){
  $('#pursePic').innerHTML = BONE_SVG;
  $('#go').style.backgroundImage = `url(${goImg})`;
  $('#go').addEventListener('click', async () => {
    try {
      actx = new (window.AudioContext || window.webkitAudioContext)(); actx.resume();
      const s = actx.createBufferSource(); s.buffer = actx.createBuffer(1, 1, 22050); s.connect(actx.destination); s.start();
    } catch(e){ actx = null; }
    $('#start').hidden = true; sfx.pop();
    try { navigator.wakeLock && navigator.wakeLock.request('screen').catch(() => {}); } catch(e){}
    if (actx) await Promise.all([loadSounds(), setupMic()]);
    run();
  });
  $('#again').addEventListener('click', async () => { $('#again').hidden = true; sfx.pop(); await sleep(300); run(); });
}
