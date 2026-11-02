/* Проверка пряток (уровни 1 и 2): проходит уровень с неверными и верными нажатиями,
   записывает каждую реплику и что в этот момент на экране, проверяет правила.
   node tools/seek_audit.js 1 [ширина высота]   → docs/hide-seek-audit-l1.md
   Нужен сервер: python3 -m http.server 8765 */
const { chromium } = require('playwright');
const fs = require('fs');
const LV = process.argv[2] || '1', W = +(process.argv[3] || 844), H = +(process.argv[4] || 390);
const SPEED = 4;
const SPOT_RU = {tisch:'стол', schrank:'шкаф', sofa:'диван', kiste:'коробка', baum:'дерево', rutsche:'горка', schaukel:'качели', sandkasten:'песочница', busch:'куст'};
const NAME_RU = {emily:'Эмили', mark:'Марк', theo:'Тео', isabel:'Изабель', paul:'Пауль'};

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
    if (typeof o === 'number') o = o / F; else if (o){ o = Object.assign({}, o); if (o.duration) o.duration /= F; if (o.delay) o.delay /= F; }
    return _an.call(this, k, o);
  };
  window.__log = []; window.__maxSpeaking = 0; window.__overlaps = [];
  addEventListener('load', () => {
    const snap = () => Object.fromEntries(Object.entries(heroes).map(([n, h]) => [n, Object.assign({}, h.where)]));
    const orig = window.play;
    window.play = function(name){
      const rec = {t: performance.now(), clip: name, heroes: snap()};
      window.__log.push(rec);
      return orig.apply(this, arguments);
    };
    const origSpot = window.onSpotTap;
    window.onSpotTap = function(s){ window.__log.push({t: performance.now(), tap: s.id, active: !!spotsActive, heroes: snap()}); return origSpot.apply(this, arguments); };
    (function watch(){ if (speaking > window.__maxSpeaking) window.__maxSpeaking = speaking;
      if (speaking > 1) window.__overlaps.push(performance.now()); _raf(watch); })();
  });
})();`;

(async () => {
  const b = await chromium.launch({args: ['--autoplay-policy=no-user-gesture-required']});
  const ctx = await b.newContext({viewport: {width: W, height: H}, hasTouch: true, isMobile: true, deviceScaleFactor: 2});
  const p = await ctx.newPage();
  const errs = []; p.on('pageerror', e => errs.push(e.message));
  await p.addInitScript(INIT);
  await p.goto(`http://localhost:8765/l${LV}.html`); await p.waitForTimeout(800);
  await p.click('#go', {force: true});
  const shotDir = `/tmp/seek_l${LV}`; fs.mkdirSync(shotDir, {recursive: true});
  let wrongBudget = 0, searches = 0, waitedForHint = false, peekShots = 0, t0 = Date.now(), lastSearchKey = '';
  while (Date.now() - t0 < 420000){
    await p.waitForTimeout(120);
    const st = await p.evaluate(() => ({
      done: !document.getElementById('again').hidden,
      mic: document.getElementById('mic').classList.contains('on'),
      active: typeof spotsActive !== 'undefined' && spotsActive && !!spotResolve,
      hidden: Object.values(heroes).filter(h => h.where.kind === 'spot' && h.where.state !== 'out').map(h => [h.name, h.where.spot, h.where.state]),
      spots: Object.keys(spots), peek: Object.values(heroes).some(h => h.where.state === 'peek')
    }));
    if (st.done) break;
    if (st.peek && peekShots < 4){ peekShots++; await p.screenshot({path: `${shotDir}/peek${peekShots}.png`}); }
    if (st.mic){ await p.waitForTimeout(250); await p.click('#mic', {force: true}).catch(() => {}); continue; }
    if (st.active){
      const key = st.hidden.map(h => h[0] + ':' + h[1]).join(',');
      if (key !== lastSearchKey){ lastSearchKey = key; searches++; wrongBudget = searches % 2 ? 2 : 1; }
      /* в первом поиске ждём подсказку-выглядывание, ничего не нажимая */
      if (!waitedForHint && st.hidden.length){ waitedForHint = true; await p.waitForTimeout(12000/SPEED + 1500); continue; }
      const full = new Set(st.hidden.map(h => h[1]));
      let target;
      if (!st.hidden.length) target = st.spots[Math.floor(Math.random()*st.spots.length)];           /* Эмили выбирает, куда спрятаться */
      else if (wrongBudget > 0 && st.spots.some(s => !full.has(s))){ wrongBudget--; target = st.spots.filter(s => !full.has(s))[0]; }
      else target = st.hidden[0][1];
      const box = await p.evaluate(id => { const r = spots[id].front.getBoundingClientRect(); return {x: r.left + r.width/2, y: r.top + r.height*0.55}; }, target);
      await p.mouse.click(box.x, box.y);
      await p.waitForTimeout(400);
      continue;
    }
    /* прочие ожидания: нажимаем на подсвеченное, если есть */
    const t = await p.evaluate(() => { const e = document.querySelector('.tapme, .glow'); if (!e) return null; const r = e.getBoundingClientRect(); return {x: r.left + r.width/2, y: r.top + r.height/2}; });
    if (t) await p.mouse.click(t.x, t.y);
  }
  const res = await p.evaluate(() => ({log: window.__log, max: window.__maxSpeaking, overlaps: window.__overlaps.length, TEXT: typeof TEXT !== 'undefined' ? TEXT : {}}));
  const finished = await p.evaluate(() => !document.getElementById('again').hidden);
  await b.close();

  /* ---- разбор ---- */
  const say = c => res.TEXT[c] ? res.TEXT[c][0] : ({
    e_gefunden: 'Gefunden! (Эмили)', km_gefunden: 'Gefunden! (Марк)', p_gefunden: 'Gefunden! (Пауль)', a_da_er: 'Da ist er!', a_da_sie: 'Da ist sie!',
    e_komme: 'Ich komme! (Эмили)', km_komme: 'Ich komme! (Марк)', a_zaehl_mit: 'Zähl mit!', p_count10: 'Пауль считает до 10', p_hier_nicht: 'Hier nicht! (Пауль)',
    p_dran: 'Du bist dran! (Пауль)', k_ohoh: 'Oh-oh! (Марк)', k_kuckuck: 'Kuckuck!', k_laugh: 'смех Марка', t_bark: 'Тео гавкает', t_barks: 'Тео гавкает', t_sniff: 'Тео нюхает',
    i_hihi: 'Hihi! (Изабель)', p_hihi: 'Haha! (Пауль)', e_verstecke_mich: 'Ich verstecke mich!', a_wo_mark: 'Wo ist Mark?', a_wo_theo: 'Wo ist Theo?', a_wo_isabel: 'Wo ist Isabel?', a_wo_paul: 'Wo ist Paul?',
    r_find_mark: 'рус.: найди Марка', r_find_theo: 'рус.: найди Тео', r_find_isabel: 'рус.: найди Изабель', r_find_paul: 'рус.: найди Пауля', r_choose: 'рус.: выбери, где спрятаться',
    a_nein_sie: 'Nein, da ist sie nicht!', r_like_emily: 'рус.: скажи, как Эмили', r_repeat: 'рус.: повтори'
  })[c] || c;
  const where = (n, w) => w.kind === 'front' ? null : w.state === 'hidden' ? `${NAME_RU[n]} спрятан(а): ${SPOT_RU[w.spot]}` : w.state === 'peek' ? `${NAME_RU[n]} выглядывает: ${SPOT_RU[w.spot]}` : `${NAME_RU[n]} вышел(ла) у: ${SPOT_RU[w.spot]}`;
  const screen = hs => Object.entries(hs).map(([n, w]) => where(n, w)).filter(Boolean).join('; ') || 'все стоят на виду';
  const SEEK = /^(e_(q|ich|mark|theo|isabel|paul)_|e_gefunden|km_gefunden|p_gefunden|a_da_|a_nein_|e_komme|km_komme|p_hier_nicht|a_wo_|k_ohoh|k_wo_bist_du|e_verstecke_mich|a_wo_versteckst|p_dran|e_du_bist_dran)/;
  const rows = [], problems = [];
  let lastTap = null, start = res.log.length ? res.log[0].t : 0, prevHeroes = null;
  for (const r of res.log){
    const sec = ((r.t - start)/1000).toFixed(1);
    if (r.tap){ if (r.active) { lastTap = r; rows.push([sec, screen(r.heroes), `нажатие: ${SPOT_RU[r.tap]}`]); } continue; }
    if (!SEEK.test(r.clip) && !/^e_\d+$|^km_\d+$/.test(r.clip)) continue;
    rows.push([sec, screen(r.heroes), say(r.clip)]);
    let m;
    if ((m = r.clip.match(/^e_ich_(\w+)$/))){ const e = r.heroes.emily; if (!(e.kind === 'spot' && e.spot === m[1] && e.state !== 'out')) problems.push(`${sec} с: «Ich bin …» (${m[1]}), а Эмили не в этом укрытии`); }
    if ((m = r.clip.match(/^e_(mark|theo|isabel|paul)_(\w+)$/))){ const w = r.heroes[m[1]]; if (!(w.kind === 'spot' && w.spot === m[2] && w.state === 'out')) problems.push(`${sec} с: «${m[1]} ist … ${m[2]}», а он(а) там не найден(а)`); }
    if (/^(e|km|p)_gefunden$/.test(r.clip)){
      const justFound = Object.values(r.heroes).some(w => w.kind === 'spot' && w.state === 'out') || (r.clip !== 'e_gefunden' && Object.values(r.heroes).some(w => w.state === 'peek'));
      if (!justFound) problems.push(`${sec} с: «Gefunden!», а никого не нашли`);
    }
    if ((m = r.clip.match(/^e_q_(\w+)$/))){ if (!lastTap || lastTap.tap !== m[1] || r.t - lastTap.t > 6000) problems.push(`${sec} с: вопрос про ${m[1]} без нажатия на это укрытие`); lastTap = null; }
  }
  if (res.max > 1) problems.push(`реплики накладывались (одновременно звучало до ${res.max}, кадров с наложением: ${res.overlaps})`);
  let md = `# Прятки, уровень ${LV}: реплики и экран\n\nПроверено автоматически (${W}×${H}), время ускорено в ${SPEED} раза. Уровень пройден до конца: ${finished ? 'да' : 'НЕТ'}. Ошибок на странице: ${errs.length}.\n\n`;
  md += `## Найденные несовпадения\n\n${problems.length ? problems.map(x => '- ' + x).join('\n') : 'Нет.'}\n\n## Реплики по порядку\n\n| с | на экране | реплика |\n|---|---|---|\n`;
  md += rows.map(r => `| ${r[0]} | ${r[1]} | ${r[2]} |`).join('\n') + '\n';
  fs.writeFileSync(`docs/hide-seek-audit-l${LV}.md`, md);
  console.log(JSON.stringify({level: LV, finished, rows: rows.length, problems, maxSpeaking: res.max, errors: errs.slice(0, 5), peekShots}));
})();
