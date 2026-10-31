/* Проверка микрофона: вместо настоящего микрофона — искусственный «голос», который включает тест.
   node tools/mic_test.js [ширина высота] — сценарии по очереди на каждом значке микрофона в уровне 1. */
const { chromium } = require('playwright');
const [W, H] = [+(process.argv[2] || 844), +(process.argv[3] || 390)];
const INIT = `(() => {
  const ctx = new (window.AudioContext || window.webkitAudioContext)();
  const osc = ctx.createOscillator(), gain = ctx.createGain(), dest = ctx.createMediaStreamDestination();
  osc.frequency.value = 220; gain.gain.value = 0; osc.connect(gain).connect(dest); osc.start();
  window.__voice = on => { ctx.resume(); gain.gain.value = on ? 0.15 : 0; };
  navigator.mediaDevices.getUserMedia = async () => { await ctx.resume(); return dest.stream; };
})();`;
(async () => {
  const b = await chromium.launch({args:['--autoplay-policy=no-user-gesture-required']});
  const p = await (await b.newContext({viewport:{width:W, height:H}, hasTouch:true, isMobile:true, deviceScaleFactor:2})).newPage();
  const errs = []; p.on('pageerror', e => errs.push(e.message));
  await p.addInitScript(INIT);
  await p.goto('http://localhost:8765/l1.html'); await p.waitForTimeout(600);
  await p.click('#go', {force:true});
  const on = () => p.evaluate(() => document.getElementById('mic').classList.contains('on'));
  const waitOn = async () => { const t = Date.now(); while (!(await on())) { if (Date.now() - t > 60000) throw new Error('нет значка'); await p.waitForTimeout(30); } return Date.now(); };
  const waitOff = async () => { while (await on()) await p.waitForTimeout(20); return Date.now(); };
  const nextSpeech = async () => { const t = Date.now(); while (!(await p.evaluate(() => speaking > 0)) && Date.now() - t < 8000) await p.waitForTimeout(20); return Date.now(); };
  const voice = async (pattern) => { for (const [v, ms] of pattern){ await p.evaluate(x => __voice(x), v); await p.waitForTimeout(ms); } await p.evaluate(() => __voice(false)); };
  const rows = [];
  const scen = [
    ['три слова с паузами 0,3 с', async () => voice([[1,500],[0,300],[1,500],[0,300],[1,500]])],
    ['одно короткое слово', async () => voice([[1,350]])],
    ['ответ с паузой 0,6 с внутри', async () => voice([[1,700],[0,600],[1,700]])],
    ['нажатие синей кнопки', async () => { await p.waitForTimeout(300); await p.click('#mic', {force:true}); }],
    ['тишина', async () => {}],
    ['голос до значка', null],
  ];
  for (const [name, fn] of scen){
    if (fn === null){
      /* говорим, пока игра ещё произносит образец, и продолжаем после */
      while (!(await p.evaluate(() => speaking > 0))) await p.waitForTimeout(20);
      while (await p.evaluate(() => speaking > 0)) await p.waitForTimeout(20);
      await p.evaluate(() => __voice(true)); await p.waitForTimeout(120);
      const tOn = await waitOn(); await p.waitForTimeout(300); await p.evaluate(() => __voice(false));
      const tOff = await waitOff(); const tNext = await nextSpeech();
      rows.push({name, words: await p.evaluate(() => __mic.words), res: await p.evaluate(() => __mic.result), iconToEnd: tOff - tOn, pauseBeforeNext: tNext - tOff});
      continue;
    }
    const tOn = await waitOn(); const words = await p.evaluate(() => __mic.words);
    await fn();
    const tOff = await waitOff(); const tNext = await nextSpeech();
    rows.push({name, words, res: await p.evaluate(() => __mic.result), iconToEnd: tOff - tOn, pauseBeforeNext: tNext - tOff});
  }
  for (const r of rows) console.log(JSON.stringify(r));
  console.log('errors', errs); await b.close();
})();
