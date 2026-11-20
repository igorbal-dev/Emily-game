/* Какие фразы на уровнях ещё без записи голосом (звучали бы синтезатором телефона).
   node tools/voice_check.js [--json]   нужен сервер: python3 -m http.server 8765 */
const { chromium } = require('playwright');
(async () => {
  const b = await chromium.launch(), p = await b.newPage(), out = {};
  for (let n = 0; n <= 12; n++){
    await p.goto(`http://localhost:8765/l${n}.html`); await p.waitForTimeout(300);
    out[n] = await p.evaluate(() => { const T = typeof TEXT !== 'undefined' ? TEXT : {};
      return {snd: SND, miss: Object.keys(T).filter(k => !SND[k]).map(k => ({key: k, text: T[k][0], who: T[k][1]}))}; });
  }
  await b.close();
  if (process.argv.includes('--json')) { console.log(JSON.stringify(out)); return; }
  let total = 0;
  for (const [n, r] of Object.entries(out)){ total += r.miss.length; if (r.miss.length) console.log(`l${n}: ${r.miss.length} без записи: ` + r.miss.map(m => m.key).join(', ')); }
  console.log('всего без записи:', total);
})();
