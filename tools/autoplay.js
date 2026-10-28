/* Автопроверка: открывает уровни в браузере, ускоряет время, сам «говорит» в фальшивый микрофон
   и тыкает по нажимаемым предметам, пока уровень не дойдёт до кнопки «ещё раз».
   Запуск: node tools/autoplay.js [номера уровней]  (нужен сервер: python3 -m http.server 8765) */
const { chromium } = require('playwright');
const BASE = process.env.BASE || 'http://localhost:8765/';
const levels = process.argv.slice(2).length ? process.argv.slice(2) : ['0','1','2','3','4','5','6','7','8','9','10','11','12'];
const SPEED = +(process.env.SPEED || 6), LIMIT = +(process.env.LIMIT || 300000);

const INIT = `(() => {
  const F = ${SPEED};
  const _st = window.setTimeout.bind(window);
  window.setTimeout = (fn, ms, ...a) => _st(fn, (ms || 0) / F, ...a);
  const _now = performance.now.bind(performance), t0 = _now();
  performance.now = () => t0 + (_now() - t0) * F;
  const _raf = window.requestAnimationFrame.bind(window);
  window.requestAnimationFrame = cb => _raf(t => cb(t0 + (t - t0) * F));
  const _an = Element.prototype.animate;
  Element.prototype.animate = function(k, o){
    if (typeof o === 'number') o = o / F; else if (o){ o = Object.assign({}, o); if (o.duration) o.duration /= F; if (o.delay) o.delay /= F; if (o.endDelay) o.endDelay /= F; }
    return _an.call(this, k, o);
  };
  const st = document.createElement('style');
  st.textContent = '*{animation-duration:.05s!important;transition-duration:.01s!important}';
  addEventListener('DOMContentLoaded', () => document.head.appendChild(st));
  window.__errors = [];
  addEventListener('error', e => window.__errors.push(String(e.message)));
  addEventListener('unhandledrejection', e => window.__errors.push('rej: ' + String(e.reason && (e.reason.stack || e.reason))));
})();`;

async function tapper(page){
  return page.evaluate(() => {
    const vis = el => { const r = el.getBoundingClientRect(); if (r.width < 4 || r.height < 4) return false;
      const cs = getComputedStyle(el); if (cs.visibility === 'hidden' || +cs.opacity === 0) return false;
      const x = r.left + r.width/2, y = r.top + r.height/2; if (x < 0 || y < 0 || x > innerWidth || y > innerHeight) return false;
      return true; };
    const all = [...document.querySelectorAll('#stage *')].filter(el => !el.closest('svg') || el.tagName === 'svg');
    const cands = all.filter(el => {
      if (el.id === 'tomap' || el.closest('#tomap') || el.id === 'again' || el.closest('#rotate')) return false;
      if (el.tagName === 'IMG' || el.tagName === 'svg' || el.tagName === 'CANVAS' || el.tagName === 'I' || el.tagName === 'SPAN') return false;
      const cs = getComputedStyle(el); return (cs.cursor === 'pointer' || el.tagName === 'BUTTON') && cs.pointerEvents !== 'none' && vis(el);
    });
    const hot = cands.filter(el => /glow|hint|pulse|blink|hl|light|wiggle/.test(el.className && el.className.baseVal === undefined ? el.className : ''));
    const list = hot.length && Math.random() < 0.6 ? hot : cands;
    if (!list.length) return null;
    const el = list[Math.floor(Math.random()*list.length)];
    const r = el.getBoundingClientRect();
    return {x: r.left + r.width/2, y: r.top + r.height/2, tag: el.tagName + '#' + el.id + '.' + el.className};
  });
}

async function dragTry(page){
  /* перетаскивание: от случайного нажимаемого к случайной точке */
  const a = await tapper(page), b = await tapper(page);
  if (!a || !b) return;
  await page.mouse.move(a.x, a.y); await page.mouse.down();
  for (let i = 1; i <= 6; i++) await page.mouse.move(a.x + (b.x - a.x)*i/6, a.y + (b.y - a.y)*i/6);
  await page.mouse.up();
}

(async () => {
  const browser = await chromium.launch({args:['--use-fake-ui-for-media-stream','--use-fake-device-for-media-stream','--autoplay-policy=no-user-gesture-required']});
  const results = [];
  for (const lv of levels){
    const ctx = await browser.newContext({viewport:{width:1024, height:700}, hasTouch:false, permissions:['microphone']});
    const page = await ctx.newPage();
    const errs = [];
    page.on('pageerror', e => errs.push(String(e.message)));
    page.on('console', m => { if (m.type() === 'error') errs.push('console: ' + m.text()); });
    page.on('requestfailed', r => errs.push('404/failed: ' + r.url()));
    page.on('response', r => { if (r.status() >= 400) errs.push(r.status() + ' ' + r.url()); });
    await page.addInitScript(INIT);
    await page.goto(BASE + 'l' + lv + '.html');
    await page.waitForTimeout(500);
    await page.click('#go', {force:true});
    const t0 = Date.now(); let ok = false, taps = 0;
    while (Date.now() - t0 < LIMIT){
      await page.waitForTimeout(250);
      const done = await page.evaluate(() => { const a = document.getElementById('again'); return a && !a.hidden; });
      if (done){ ok = true; break; }
      const t = await tapper(page);
      if (t){ taps++; if (taps % 7 === 0) await dragTry(page); else await page.mouse.click(t.x, t.y); }
    }
    const jsErr = (await page.evaluate(() => window.__errors)) || ['(нет __errors) url=' + page.url()];
    if (process.env.SHOT) await page.screenshot({path: `${process.env.SHOT}/l${lv}.png`});
    const r = {level: lv, finished: ok, seconds: Math.round((Date.now()-t0)/1000), taps, errors: [...new Set([...errs, ...jsErr])].slice(0, 8)};
    console.log(JSON.stringify(r));
    results.push(r);
    await ctx.close();
  }
  await browser.close();
})();
