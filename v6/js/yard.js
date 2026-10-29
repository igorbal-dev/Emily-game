/* Двор у дома Эмили (уровни 17 и 18): берлинский дом с подъездом и окнами, дерево, скамейка, клумба.
   drawYard(g, W, H, L, o) — o.boxes: коробки переезда у подъезда; DOOR_X, WIN_X — где подъезд и окно Софии (доли ширины). */
const DOOR_X = 0.74, WIN_X = 0.6;
const yardWinY = L => L.floorY - L.hE*1.55;
function drawYard(g, W, H, L, o = {}){
  const fy = L.floorY, hE = L.hE, hz = fy - hE*0.35;
  let gr = g.createLinearGradient(0, 0, 0, hz); gr.addColorStop(0, '#8fd3ff'); gr.addColorStop(1, '#e4f6ff'); g.fillStyle = gr; g.fillRect(0, 0, W, hz);
  g.fillStyle = 'rgba(255,255,255,.9)'; for (const [cx, cy, r] of [[0.14, 0.1, 0.08], [0.4, 0.07, 0.06]]){ g.beginPath(); g.ellipse(W*cx, H*cy, hE*r*2, hE*r, 0, 0, 7); g.fill(); }
  /* дом: стена справа, окна, подъезд с козырьком и номером */
  const hx = W*0.52, top = H*0.02;
  g.fillStyle = '#f4c9a8'; g.fillRect(hx, top, W - hx, hz - top);
  g.fillStyle = '#e8b48c'; g.fillRect(hx, top, W - hx, hE*0.06);
  for (let row = 0; row < 3; row++) for (let i = 0; i < 4; i++){
    const wx = hx + hE*0.15 + i*hE*0.42, wy = top + hE*0.18 + row*hE*0.48; if (wx > W - hE*0.2) continue;
    if (row === 2 && Math.abs(wx + hE*0.14 - W*DOOR_X) < hE*0.3) continue;
    if (Math.abs(wx + hE*0.14 - W*WIN_X) < hE*0.42 && Math.abs(wy + hE*0.16 - yardWinY(L) - hE*0.18) < hE*0.45) continue;   /* там окно Софии */
    g.fillStyle = '#fff'; g.fillRect(wx - 3, wy - 3, hE*0.28 + 6, hE*0.32 + 6); g.fillStyle = '#9fd0ff'; g.fillRect(wx, wy, hE*0.28, hE*0.32);
    g.fillStyle = '#ff9fb4'; g.fillRect(wx - 4, wy + hE*0.32, hE*0.28 + 8, hE*0.04);
  }
  const dx = W*DOOR_X, dw = hE*0.42, dh = hE*0.85;
  g.fillStyle = '#7a4a22'; g.fillRect(dx - dw/2, hz - dh, dw, dh);
  g.fillStyle = '#9fd0ff'; g.fillRect(dx - dw*0.35, hz - dh*0.9, dw*0.7, dh*0.3);
  g.fillStyle = '#ffd34d'; g.beginPath(); g.arc(dx + dw*0.3, hz - dh*0.45, hE*0.025, 0, 7); g.fill();
  g.fillStyle = '#5aa8f0'; g.fillRect(dx - dw*0.75, hz - dh - hE*0.08, dw*1.5, hE*0.08);
  g.fillStyle = '#fff'; g.beginPath(); g.arc(dx, hz - dh - hE*0.17, hE*0.06, 0, 7); g.fill();
  g.fillStyle = '#2f80ed'; g.font = `bold ${Math.round(hE*0.08)}px sans-serif`; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText('7', dx, hz - dh - hE*0.165);
  /* окно Софии побольше: в нём иногда сидит кошка Мими */
  const wx = W*WIN_X, wy = yardWinY(L);
  g.fillStyle = '#fff'; g.fillRect(wx - hE*0.22, wy - hE*0.02, hE*0.44, hE*0.4); g.fillStyle = '#bfe3ff'; g.fillRect(wx - hE*0.19, wy + hE*0.01, hE*0.38, hE*0.34);
  g.fillStyle = '#e8b48c'; g.fillRect(wx - hE*0.25, wy + hE*0.36, hE*0.5, hE*0.05);
  /* слева: деревья, кусты, скамейка */
  for (let i = 0; i < 6; i++){ const tx = W*(i*0.1), r = hE*(0.2 + (i % 3)*0.05); g.fillStyle = i % 2 ? '#5fae4a' : '#4f9e3e'; g.beginPath(); g.arc(tx, hz - r*0.3, r, 0, 7); g.fill(); }
  g.fillStyle = '#8a5a1e'; g.fillRect(W*0.12 - hE*0.05, hz - hE*1.1, hE*0.1, hE*1.1);
  g.fillStyle = '#4f9e3e'; g.beginPath(); g.arc(W*0.12, hz - hE*1.25, hE*0.42, 0, 7); g.fill(); g.fillStyle = '#5fae4a'; g.beginPath(); g.arc(W*0.12 - hE*0.25, hz - hE*1.05, hE*0.28, 0, 7); g.fill();
  /* двор: плитка */
  gr = g.createLinearGradient(0, hz, 0, H); gr.addColorStop(0, '#d9cbb8'); gr.addColorStop(1, '#c8b8a2'); g.fillStyle = gr; g.fillRect(0, hz, W, H - hz);
  g.strokeStyle = 'rgba(255,255,255,.35)'; g.lineWidth = 2; for (let y = hz + hE*0.12; y < H; y += hE*0.16){ g.beginPath(); g.moveTo(0, y); g.lineTo(W, y); g.stroke(); }
  g.fillStyle = '#a6dd78'; g.fillRect(0, hz, W*0.45, hE*0.08);
  const bx = W*0.32; g.fillStyle = '#c98a52'; g.fillRect(bx - hE*0.4, fy - hE*0.42, hE*0.8, hE*0.07); g.fillRect(bx - hE*0.4, fy - hE*0.62, hE*0.8, hE*0.07);
  g.fillStyle = '#59606b'; g.fillRect(bx - hE*0.36, fy - hE*0.36, hE*0.05, hE*0.34); g.fillRect(bx + hE*0.31, fy - hE*0.36, hE*0.05, hE*0.34);
  if (o.boxes){
    const cx = W*DOOR_X + hE*0.45;
    for (const [ox, oy, w, h, c] of [[0, 0, 0.36, 0.3, '#d9a35f'], [0.38, 0, 0.3, 0.26, '#c98f55'], [0.08, 0.3, 0.3, 0.24, '#e0b070'], [-0.42, 0, 0.32, 0.22, '#c98f55']]){
      const x = cx + hE*ox, y = fy - hE*(oy + h);
      g.fillStyle = c; g.fillRect(x, y, hE*w, hE*h); g.strokeStyle = '#9c6435'; g.lineWidth = 2; g.strokeRect(x, y, hE*w, hE*h);
      g.fillStyle = 'rgba(255,255,255,.5)'; g.fillRect(x + hE*w*0.42, y, hE*w*0.16, hE*h);
    }
  }
}
