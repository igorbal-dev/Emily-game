/* Общие фоны разговорных уровней (js/talk.js): рисуются кодом на холсте.
   drawPlayground — площадка (уровни 13, 22): качели SWX, горка SLX, песочница SBX — доли ширины.
   drawKita — группа в садике (уровни 20, 21, 23): окна, полка с игрушками, ковёр RUG. */
function drawPlayground(g, W, H, L, SWX = 0.3, SLX = 0.74, SBX = 0.52){
  const fy = L.floorY, hE = L.hE, hz = H*0.55;
  let gr = g.createLinearGradient(0, 0, 0, hz); gr.addColorStop(0, '#8fd3ff'); gr.addColorStop(1, '#e4f6ff'); g.fillStyle = gr; g.fillRect(0, 0, W, hz);
  g.fillStyle = '#fff3a8'; g.beginPath(); g.arc(W*0.9, H*0.13, hE*0.16, 0, 7); g.fill();
  g.fillStyle = 'rgba(255,255,255,.9)'; for (const [cx, cy, r] of [[0.18, 0.12, 0.09], [0.55, 0.08, 0.07], [0.68, 0.17, 0.06]]){ g.beginPath(); g.ellipse(W*cx, H*cy, hE*r*2, hE*r, 0, 0, 7); g.fill(); }
  /* дома Берлина вдали */
  const cols = ['#f4c9a8', '#cfe0f0', '#f3e1a0', '#e6b8b8', '#d7e8c6'];
  for (let i = 0, x = -10; x < W; i++){ const w = hE*(0.55 + (i % 3)*0.12), h = hE*(0.6 + ((i*7) % 4)*0.12);
    g.fillStyle = cols[i % cols.length]; g.fillRect(x, hz - h, w, h); g.fillStyle = 'rgba(80,110,150,.35)';
    for (let wy = hz - h + hE*0.1; wy < hz - hE*0.15; wy += hE*0.18) for (let wx = x + w*0.15; wx < x + w*0.8; wx += w*0.3) g.fillRect(wx, wy, w*0.16, hE*0.09);
    x += w + 2; }
  for (let i = 0; i < 9; i++){ const tx = W*(i/8), r = hE*(0.16 + (i % 3)*0.04); g.fillStyle = i % 2 ? '#5fae4a' : '#4f9e3e'; g.beginPath(); g.arc(tx, hz - r*0.4, r, 0, 7); g.fill(); }
  gr = g.createLinearGradient(0, hz, 0, H); gr.addColorStop(0, '#a6dd78'); gr.addColorStop(1, '#7cc35a'); g.fillStyle = gr; g.fillRect(0, hz, W, H - hz);
  g.lineCap = 'round'; g.lineJoin = 'round';
  /* качели */
  const sx = W*SWX, top = fy - hE*1.55, foot = fy - hE*0.02, spread = hE*0.55;
  g.strokeStyle = '#8a5a1e'; g.lineWidth = hE*0.05;
  for (const s of [-1, 1]){ g.beginPath(); g.moveTo(sx + s*spread, foot); g.lineTo(sx + s*spread*0.55, top); g.stroke(); }
  g.lineWidth = hE*0.06; g.beginPath(); g.moveTo(sx - spread*0.7, top); g.lineTo(sx + spread*0.7, top); g.stroke();
  /* горка: лесенка слева, площадка, скат вправо */
  const lx = W*(SLX - 0.06), px = W*(SLX - 0.01), py = fy - hE*0.95, ex = W*(SLX + 0.19);
  g.strokeStyle = '#2f80ed'; g.lineWidth = hE*0.035;
  for (const dx of [0, hE*0.16]){ g.beginPath(); g.moveTo(lx + dx - hE*0.08, fy); g.lineTo(lx + dx, py - hE*0.25); g.stroke(); }
  g.lineWidth = hE*0.02; for (let k = 1; k < 6; k++){ const y = fy - (fy - py)*k/6, sh = hE*0.08*(1 - k/6); g.beginPath(); g.moveTo(lx - sh, y); g.lineTo(lx + hE*0.16 - sh, y); g.stroke(); }
  g.fillStyle = '#ffd84d'; g.strokeStyle = '#d6a21e'; g.lineWidth = hE*0.015; g.fillRect(lx - hE*0.02, py - hE*0.04, px - lx + hE*0.14, hE*0.05); g.strokeRect(lx - hE*0.02, py - hE*0.04, px - lx + hE*0.14, hE*0.05);
  g.fillStyle = '#ff7a59'; g.strokeStyle = '#d65a3b'; g.lineWidth = hE*0.02; g.beginPath();
  g.moveTo(px + hE*0.1, py - hE*0.04); g.bezierCurveTo(px + (ex - px)*0.45, py + hE*0.05, ex - hE*0.25, fy - hE*0.12, ex, fy - hE*0.06);
  g.lineTo(ex, fy - hE*0.01); g.bezierCurveTo(ex - hE*0.3, fy - hE*0.05, px + (ex - px)*0.4, py + hE*0.14, px + hE*0.1, py + hE*0.05); g.closePath(); g.fill(); g.stroke();
  /* песочница */
  const bx = W*SBX, bw = hE*0.85;
  g.fillStyle = '#f3d79a'; g.beginPath(); g.ellipse(bx, fy + hE*0.02, bw, hE*0.12, 0, 0, 7); g.fill();
  g.strokeStyle = '#b07b3c'; g.lineWidth = hE*0.05; g.beginPath(); g.ellipse(bx, fy + hE*0.02, bw, hE*0.12, 0, 0, 7); g.stroke();
}

function drawKita(g, W, H, L, RUG = 0.64){
  const fy = L.floorY, hE = L.hE; g.lineCap = 'round'; g.lineJoin = 'round';
  g.fillStyle = '#fff1c9'; g.fillRect(0, 0, W, fy);
  g.fillStyle = '#ffe2a0'; g.fillRect(0, fy - hE*0.55, W, hE*0.5);
  g.fillStyle = '#c98f55'; g.fillRect(0, fy - hE*0.06, W, H - fy + hE*0.06);
  /* окна */
  for (const wx of [0.3, 0.52]){ const x = W*wx, y = fy - hE*1.65;
    g.fillStyle = '#8fd3ff'; g.fillRect(x, y, hE*0.7, hE*0.55); g.strokeStyle = '#fff'; g.lineWidth = hE*0.04; g.strokeRect(x, y, hE*0.7, hE*0.55);
    g.beginPath(); g.moveTo(x + hE*0.35, y); g.lineTo(x + hE*0.35, y + hE*0.55); g.stroke(); }
  /* полка с игрушками справа */
  const sx = W*0.86; g.fillStyle = '#e8904a'; g.fillRect(sx - hE*0.4, fy - hE*1.1, hE*0.8, hE*0.06); g.fillRect(sx - hE*0.4, fy - hE*0.7, hE*0.8, hE*0.06);
  [['#ff7a59', -0.25], ['#32b67a', 0], ['#9b6bff', 0.25]].forEach(([c, dx]) => { g.fillStyle = c; g.fillRect(sx + hE*dx - hE*0.08, fy - hE*1.28, hE*0.16, hE*0.18); });
  g.fillStyle = '#ffd34d'; g.beginPath(); g.arc(sx, fy - hE*0.82, hE*0.1, 0, 7); g.fill();
  /* ковёр для игры */
  g.fillStyle = '#7ab8f5'; g.beginPath(); g.ellipse(W*RUG, fy + hE*0.02, hE*0.95, hE*0.13, 0, 0, 7); g.fill();
  g.strokeStyle = '#fff'; g.lineWidth = hE*0.02; g.setLineDash([hE*0.05, hE*0.04]); g.beginPath(); g.ellipse(W*RUG, fy + hE*0.02, hE*0.85, hE*0.1, 0, 0, 7); g.stroke(); g.setLineDash([]);
}

/* Человечек для фото и картинок (семья Абихи, семья Эмили): простой плоский рисунок.
   o: {skin, hair, style: 'short'|'long'|'pony'|'bun', shirt, pants, shoes} — viewBox 60×130, ноги внизу. */
function personSVG(o){
  const sk = o.skin || '#e9b48a', hr = o.hair || '#4a2e1c', sh = o.shirt || '#5aa8f0', pa = o.pants || '#3c4a6b', so = o.shoes || '#333';
  const hair = {
    short: `<path d="M17 30 Q16 10 30 9 Q45 10 43 30 Q40 18 30 18 Q20 18 17 30 Z" fill="${hr}"/>`,
    long: `<path d="M15 50 Q10 12 30 9 Q50 12 45 50 L40 50 Q42 24 30 20 Q18 24 20 50 Z" fill="${hr}"/>`,
    pony: `<path d="M17 32 Q14 10 30 9 Q46 10 43 32 Q40 18 30 18 Q20 18 17 32 Z" fill="${hr}"/><path d="M41 14 Q56 18 52 42 Q48 30 42 24 Z" fill="${hr}"/><circle cx="43" cy="15" r="3.5" fill="#ff8fc8"/>`,
    bun: `<path d="M16 34 Q13 12 30 10 Q47 12 44 34 Q41 20 30 20 Q19 20 16 34 Z" fill="${hr}"/><circle cx="30" cy="7" r="7" fill="${hr}"/>`
  }[o.style || 'short'];
  return `<svg viewBox="0 0 60 130"><path d="M22 92 h7 v32 h-7 Z M31 92 h7 v32 h-7 Z" fill="${pa}"/><path d="M19 122 h11 v6 h-11 Z M30 122 h11 v6 h-11 Z" fill="${so}"/>` +
    `<path d="M16 50 Q30 42 44 50 L46 94 H14 Z" fill="${sh}"/><path d="M16 52 L8 84 L13 86 L20 60 Z M44 52 L52 84 L47 86 L40 60 Z" fill="${sh}"/><circle cx="10" cy="86" r="4" fill="${sk}"/><circle cx="50" cy="86" r="4" fill="${sk}"/>` +
    `<rect x="26" y="38" width="8" height="8" fill="${sk}"/><circle cx="30" cy="28" r="14" fill="${sk}"/>${hair}` +
    `<circle cx="25" cy="29" r="1.8" fill="#2a1a10"/><circle cx="35" cy="29" r="1.8" fill="#2a1a10"/><path d="M25 35 Q30 39 35 35" fill="none" stroke="#b5523a" stroke-width="1.6" stroke-linecap="round"/></svg>`;
}
/* рожок мороженого: c — цвет шарика, d — обводка */
const ICE = (c, d) => `<svg viewBox="0 0 60 100"><path d="M14 44 H46 L30 96 Z" fill="#e8b46a" stroke="#b8803a" stroke-width="3" stroke-linejoin="round"/><path d="M20 52 L38 70 M26 50 L42 60 M18 62 L34 80" stroke="#c9934e" stroke-width="2"/><circle cx="30" cy="32" r="20" fill="${c}" stroke="${d}" stroke-width="3"/><ellipse cx="23" cy="25" rx="5" ry="3.5" fill="#fff" opacity=".45"/></svg>`;
const ICE_CHOC = ICE('#8a5a33', '#5e3a1e'), ICE_PINK = ICE('#ff9fbf', '#d6476a'), ICE_VAN = ICE('#ffe9a0', '#d9b440');
