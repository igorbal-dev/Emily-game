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
  window.__errors = []; window.__tts = {};
  addEventListener('load', () => { const o = window.play; if (typeof o !== 'function') return; window.play = function(n){ try { if (!SND[n] && typeof TEXT !== 'undefined' && TEXT[n]) window.__tts[n] = TEXT[n][0]; } catch(e){} return o.apply(this, arguments); }; });
  addEventListener('error', e => window.__errors.push(String(e.message)));
  addEventListener('unhandledrejection', e => window.__errors.push('rej: ' + String(e.reason && (e.reason.stack || e.reason))));
})();`;

async function tapper(page){
  return withTimeout(page.evaluate(() => {
    const vis = el => { const r = el.getBoundingClientRect(); if (r.width < 4 || r.height < 4) return false;
      const cs = getComputedStyle(el); if (cs.visibility === 'hidden' || +cs.opacity === 0) return false;
      const x = r.left + r.width/2, y = r.top + r.height/2; if (x < 0 || y < 0 || x > innerWidth || y > innerHeight) return false;
      return true; };
    const all = [...document.querySelectorAll('#stage *')].filter(el => !el.closest('svg') || el.tagName === 'svg');
    const cands = all.filter(el => {
      if (el.id === 'tomap' || el.closest('#tomap') || el.closest('#home') || el.id === 'again' || el.closest('#rotate')) return false;
      if (el.tagName === 'IMG' || el.tagName === 'svg' || el.tagName === 'CANVAS' || el.tagName === 'I' || el.tagName === 'SPAN') return false;
      const cs = getComputedStyle(el); const cls = typeof el.className === 'string' ? el.className : ''; return (cs.cursor === 'pointer' || el.tagName === 'BUTTON' || /tapme|glow/.test(cls)) && cs.pointerEvents !== 'none' && vis(el);
    });
    const hot = cands.filter(el => /tapme|glow|hint|pulse|lit/.test(el.className && el.className.baseVal === undefined ? el.className : ''));
    const list = hot.length && Math.random() < 0.85 ? hot : cands;
    if (!list.length) return null;
    const el = list[Math.floor(Math.random()*list.length)];
    const r = el.getBoundingClientRect();
    return {x: r.left + r.width/2, y: r.top + r.height/2, tag: el.tagName + '#' + el.id + '.' + el.className};
  }), 5000);
}

function withTimeout(p, ms){ return Promise.race([p, new Promise((_, rej) => setTimeout(() => rej(new Error('страница зависла')), ms))]); }

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
    const ctx = await browser.newContext({viewport:{width:+(process.env.W || 1024), height:+(process.env.H || 700)}, hasTouch:false, deviceScaleFactor:+(process.env.DSF || 1), permissions:['microphone']});
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
    let nextHref = null;
    const t0 = Date.now(); let ok = false, taps = 0, lastSnap = 0, snapN = 0;
    while (Date.now() - t0 < LIMIT){
      await page.waitForTimeout(250);
      let done;
      try { done = await withTimeout(page.evaluate(() => { const a = document.getElementById('again'); return a && !a.hidden; }), 5000); }
      catch(e){ errs.push('ЗАВИСЛА: ' + e.message + ' через ' + Math.round((Date.now()-t0)/1000) + ' с'); break; }
      if (done){ ok = true; nextHref = await page.evaluate(() => { const n = document.getElementById('next'); return n && !n.hidden ? n.getAttribute('href') : null; }); break; }
      let t = null; try { t = await tapper(page); } catch(e){ errs.push('ЗАВИСЛА при поиске кнопок'); break; }
      if (process.env.SNAPS && Date.now() - lastSnap > +(process.env.SNAP_MS || 2000)){ lastSnap = Date.now(); await page.screenshot({path: `${process.env.SNAPS}/l${lv}_${String(snapN++).padStart(3,'0')}.png`, timeout: 5000}).catch(() => {}); }
      if (process.env.STATE && taps % 25 === 0){ try { console.log(Math.round((Date.now()-t0)/1000) + 's', JSON.stringify(await withTimeout(page.evaluate(process.env.STATE), 3000)), t && t.tag); } catch(e){ console.log("state err", e.message); } }
      if (t){ taps++; if (taps % 7 === 0) await dragTry(page); else await page.mouse.click(t.x, t.y); }
    }
    let jsErr = []; try { jsErr = (await withTimeout(page.evaluate(() => window.__errors), 3000)) || []; } catch(e){}
    if (process.env.SHOT){ await page.screenshot({path: `${process.env.SHOT}/l${lv}.png`, timeout: 5000}).catch(() => {}); await page.waitForTimeout(+(process.env.SHOT_MS || 300)); await page.screenshot({path: `${process.env.SHOT}/l${lv}_b.png`, timeout: 5000}).catch(() => {}); }
    let tts = {}; try { tts = (await withTimeout(page.evaluate(() => window.__tts), 3000)) || {}; } catch(e){}
    const r = {level: lv, finished: ok, tts, next: nextHref, seconds: Math.round((Date.now()-t0)/1000), taps, errors: [...new Set([...errs, ...jsErr])].slice(0, 8)};
    console.log(JSON.stringify(r));
    results.push(r);
    await ctx.close().catch(() => {});
  }
  await browser.close();
})();
