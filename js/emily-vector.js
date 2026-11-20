/* Эмили, нарисованная кодом. Руки и ноги — гибкие «шланги» (сгибаются плавно, без суставов),
   хвостики пружинят, глаза и рот меняются плавно. Мягкие градиенты дают объём (2.5D).
   Координаты: начало — между ступнями на полу, вверх — минус. Рост около 520. */
(function(){
  const C = {
    skin: '#f9caa3', skinShade: '#e9a984', skinLight: '#ffe3cc', cheek: 'rgba(255,120,130,.38)',
    line: 'rgba(120,62,34,.85)',
    hair: '#efb54a', hairLight: '#ffd986', hairDark: '#c7852b',
    shirt: '#ff6f9f', shirtShade: '#e0507f', shirtLight: '#ff9dbe', heart: '#a6d6f7',
    legs: '#8f919e', legsShade: '#6e707d', legsLight: '#aeb0bc',
    sock: '#ff8db7', sockShade: '#e8679a', tie: '#ff5592',
    iris: '#7b4420', irisLight: '#b8702f', white: '#ffffff', mouth: '#86303a', tongue: '#ff8a8f'
  };
  const lerp = (a, b, t) => a + (b - a)*t;
  const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
  const ease = t => t < .5 ? 2*t*t : 1 - Math.pow(-2*t + 2, 2)/2;

  /* двухзвенная рука/нога: от base к target, локоть/колено гнётся в сторону bend (+1/-1) */
  function ik(bx, by, tx, ty, a, b, bend){
    let dx = tx - bx, dy = ty - by, d = Math.hypot(dx, dy);
    const dmax = a + b - 0.5; if (d > dmax){ tx = bx + dx/d*dmax; ty = by + dy/d*dmax; dx = tx - bx; dy = ty - by; d = dmax; }
    const base = Math.atan2(dy, dx), cosA = clamp((a*a + d*d - b*b)/(2*a*d), -1, 1);
    const ang = base + bend*Math.acos(cosA);
    return {mx: bx + Math.cos(ang)*a, my: by + Math.sin(ang)*a, tx, ty};
  }
  /* гладкий шланг через три точки: обводка, заливка, блик */
  function hose(g, x0, y0, x1, y1, x2, y2, w, fill, shade, light){
    const path = () => { g.beginPath(); g.moveTo(x0, y0); g.quadraticCurveTo(x1*2 - (x0 + x2)/2, y1*2 - (y0 + y2)/2, x2, y2); };
    g.lineCap = 'round'; g.lineJoin = 'round';
    path(); g.strokeStyle = C.line; g.lineWidth = w + 5; g.stroke();
    path(); g.strokeStyle = shade; g.lineWidth = w; g.stroke();
    path(); g.strokeStyle = fill; g.lineWidth = w*0.72; g.stroke();
    if (light){ g.save(); g.translate(-w*0.16, -w*0.05); path(); g.strokeStyle = light; g.globalAlpha = .55; g.lineWidth = w*0.22; g.stroke(); g.restore(); }
  }
  function blob(g, x, y, r, fill, shade, light, outline = true){
    const gr = g.createRadialGradient(x - r*0.35, y - r*0.4, r*0.1, x, y, r);
    gr.addColorStop(0, light); gr.addColorStop(0.55, fill); gr.addColorStop(1, shade);
    g.beginPath(); g.arc(x, y, r, 0, Math.PI*2); g.fillStyle = gr; g.fill();
    if (outline){ g.strokeStyle = C.line; g.lineWidth = 2.6; g.stroke(); }
  }
  /* кудряшка: шарик волос с завитком */
  function curl(g, x, y, r, rot = 0){
    blob(g, x, y, r, C.hair, C.hairDark, C.hairLight, false);
    g.save(); g.translate(x, y); g.rotate(rot);
    g.strokeStyle = 'rgba(170,105,30,.55)'; g.lineWidth = Math.max(1.4, r*0.13); g.lineCap = 'round';
    g.beginPath(); g.arc(r*0.05, r*0.08, r*0.5, -0.6, 2.4); g.stroke(); g.restore();
  }
  /* хвостик: пушистая гроздь кудряшек, качается вокруг резинки */
  function ponytail(g, x, y, ang, side){
    g.save(); g.translate(x, y); g.rotate(ang);
    const pts = [[0, 18, 26], [side*10, 44, 30], [-side*6, 66, 27], [side*14, 84, 24], [0, 104, 20], [side*8, 122, 15], [-side*12, 92, 18], [-side*14, 40, 20]];
    for (const [px, py, r] of pts){ g.beginPath(); g.arc(px, py, r + 2.6, 0, Math.PI*2); g.fillStyle = C.line; g.fill(); }
    for (const [px, py, r] of pts) curl(g, px, py, r, px*0.05);
    /* резинка */
    g.beginPath(); g.ellipse(0, 0, 13, 9, 0, 0, Math.PI*2); g.fillStyle = C.tie; g.fill(); g.strokeStyle = C.line; g.lineWidth = 2.4; g.stroke();
    g.beginPath(); g.ellipse(-3, -3, 5, 3, 0, 0, Math.PI*2); g.fillStyle = 'rgba(255,255,255,.5)'; g.fill();
    g.restore();
  }

  function eye(g, x, y, s, f, side = 1){
    /* f: open 0..1, look (-1..1), happy 0..1 */
    const rx = 15*s, ry = 18.5*s;
    if (f.happy > 0.5 || f.open < 0.12){
      g.strokeStyle = '#3b2318'; g.lineWidth = 3.2*s; g.lineCap = 'round'; g.beginPath();
      if (f.happy > 0.5) g.arc(x, y + 6*s, rx*0.95, Math.PI*1.12, Math.PI*1.88);
      else g.arc(x, y - 4*s, rx, Math.PI*0.15, Math.PI*0.85);
      g.stroke();
      /* реснички */
      g.lineWidth = 2*s; g.beginPath(); g.moveTo(x + side*rx*0.85, y + (f.happy > 0.5 ? -2 : 2)*s); g.lineTo(x + side*rx*1.25, y + (f.happy > 0.5 ? -7 : 5)*s); g.stroke();
      return;
    }
    g.save();
    g.beginPath(); g.ellipse(x, y, rx, ry, 0, 0, Math.PI*2); g.fillStyle = C.white; g.fill();
    g.clip();
    const lx = f.look*5*s, ly = f.lookY*3*s;
    const ig = g.createRadialGradient(x + lx - 3*s, y + ly - 4*s, 1, x + lx, y + ly + 2*s, 12*s);
    ig.addColorStop(0, C.irisLight); ig.addColorStop(1, C.iris);
    g.beginPath(); g.arc(x + lx, y + ly + 2*s, 12.5*s, 0, Math.PI*2); g.fillStyle = ig; g.fill();
    g.beginPath(); g.arc(x + lx, y + ly + 2*s, 5.5*s, 0, Math.PI*2); g.fillStyle = '#2a160d'; g.fill();
    g.beginPath(); g.arc(x + lx - 4*s, y + ly - 3*s, 3.6*s, 0, Math.PI*2); g.fillStyle = '#fff'; g.fill();
    g.beginPath(); g.arc(x + lx + 4*s, y + ly + 5*s, 1.6*s, 0, Math.PI*2); g.fill();
    /* веко опускается при моргании */
    const lid = 1 - f.open;
    if (lid > 0.01){ g.beginPath(); g.rect(x - rx - 2, y - ry - 2, rx*2 + 4, (ry*2 + 4)*lid); g.fillStyle = C.skin; g.fill(); }
    g.restore();
    g.beginPath(); g.ellipse(x, y, rx, ry, 0, 0, Math.PI*2); g.strokeStyle = 'rgba(59,35,24,.75)'; g.lineWidth = 1.6*s; g.stroke();
    /* край века по верху глаза и реснички к внешнему уголку */
    const top = y - ry + ry*2*lid;
    g.strokeStyle = '#3b2318'; g.lineCap = 'round'; g.lineWidth = 2.6*s;
    g.beginPath(); g.ellipse(x, y + ry*lid, rx*1.02, Math.max(2, ry*(1 - lid)), 0, Math.PI*1.06, Math.PI*1.94); g.stroke();
    g.lineWidth = 1.8*s;
    for (const [dy, len] of [[-ry*0.55, 6], [-ry*0.25, 5]]){
      const ex = x + side*rx*0.92, ey = Math.max(top, y + dy*(1 - lid));
      g.beginPath(); g.moveTo(ex, ey); g.lineTo(ex + side*len*s, ey - len*0.7*s); g.stroke();
    }
  }

  function mouth(g, x, y, s, open, smile){
    const w = (16 + smile*5 + open*3)*s, h = open*20*s, curve = (4 + smile*7)*s;
    g.lineCap = 'round'; g.lineJoin = 'round';
    if (h < 2.5*s){
      g.beginPath(); g.moveTo(x - w, y - curve*0.3); g.quadraticCurveTo(x, y + curve, x + w, y - curve*0.3);
      g.strokeStyle = '#8a3f3a'; g.lineWidth = 3*s; g.stroke(); return;
    }
    g.beginPath(); g.moveTo(x - w, y - curve*0.3);
    g.quadraticCurveTo(x, y + curve*0.35, x + w, y - curve*0.3);
    g.quadraticCurveTo(x + w*0.55, y + h + curve*0.6, x, y + h + curve*0.5);
    g.quadraticCurveTo(x - w*0.55, y + h + curve*0.6, x - w, y - curve*0.3);
    g.closePath(); g.fillStyle = C.mouth; g.fill();
    g.save(); g.clip();
    if (open > 0.45){ g.fillStyle = '#fff'; g.fillRect(x - w, y - curve, w*2, curve*0.35 + 6*s); }
    g.beginPath(); g.ellipse(x, y + h + curve*0.45, w*0.6, h*0.45 + 3*s, 0, 0, Math.PI*2); g.fillStyle = C.tongue; g.fill();
    g.restore();
    g.strokeStyle = '#7a3532'; g.lineWidth = 2.4*s; g.stroke();
  }

  class EmilyVector {
    constructor(){
      this.state = {talk: false, wave: false, walk: false, jump: false, happy: false};
      this.t0 = performance.now(); this.last = this.t0;
      this.blinkAt = this.t0 + 1200; this.lookAt = this.t0 + 2500; this.look = 0; this.lookT = 0;
      this.mouthOpen = 0; this.mouthT = 0; this.mouthAt = 0;
      this.tail = [{a: 0, v: 0}, {a: 0, v: 0}];
      this.prevHead = null; this.jumpT = -1; this.happyK = 0; this.waveK = 0; this.walkK = 0;
    }
    set(s){
      if (s.jump && !this.state.jump) this.jumpT = 0;
      Object.assign(this.state, s);
    }
    /* один кадр: g — контекст, ox, oy — где пол между ступнями, k — масштаб */
    draw(g, now, ox, oy, k){
      const dt = Math.min(0.05, (now - this.last)/1000); this.last = now;
      const T = (now - this.t0)/1000, s = this.state;
      const appr = (v, to, sp) => v + (to - v)*Math.min(1, dt*sp);
      this.waveK = appr(this.waveK, s.wave ? 1 : 0, 6);
      this.walkK = appr(this.walkK, s.walk ? 1 : 0, 6);
      this.happyK = appr(this.happyK, s.happy ? 1 : 0, 8);

      /* ---- движение тела ---- */
      const breath = Math.sin(T*2.3);
      let bodyY = breath*1.5, lean = Math.sin(T*0.9)*0.012, squash = 1 + breath*0.008;
      const walkPh = T*6.6, ws = Math.sin(walkPh);
      let footL = {x: -27, y: 0}, footR = {x: 27, y: 0};
      if (this.walkK > 0.01){
        const up = v => Math.max(0, v);
        footL.y -= up(ws)*28*this.walkK; footR.y -= up(-ws)*28*this.walkK;
        bodyY -= Math.abs(ws)*7*this.walkK; lean += ws*0.035*this.walkK;
      }
      /* прыжок: присел — взлетел — приземлился */
      let jy = 0;
      if (this.jumpT >= 0){
        this.jumpT += dt;
        const j = this.jumpT, D = 0.95;
        if (j < 0.18){ const p = ease(j/0.18); squash = 1 - 0.12*p; bodyY += 14*p; }
        else if (j < 0.18 + D*0.62){ const p = (j - 0.18)/(D*0.62); jy = -Math.sin(p*Math.PI)*120; squash = 1 + 0.08*Math.sin(p*Math.PI); }
        else if (j < 0.18 + D*0.62 + 0.2){ const p = (j - 0.18 - D*0.62)/0.2; squash = 1 - 0.1*Math.sin(p*Math.PI); bodyY += 10*Math.sin(p*Math.PI); }
        else this.jumpT = s.jump ? 0 : -1;
      }
      if (this.happyK > 0.01){ bodyY -= Math.abs(Math.sin(T*7))*6*this.happyK; }

      g.save(); g.translate(ox, oy); g.scale(k, k);
      /* тень на полу: меньше и светлее, когда она в воздухе */
      { const sh = 1 + jy/260; g.beginPath(); g.ellipse(0, 4, 78*sh, 13*sh, 0, 0, Math.PI*2);
        const sg = g.createRadialGradient(0, 4, 0, 0, 4, 78*sh); sg.addColorStop(0, 'rgba(70,35,10,.32)'); sg.addColorStop(1, 'rgba(70,35,10,0)');
        g.fillStyle = sg; g.fill(); }
      g.translate(0, jy);
      /* в прыжке ступни поджимаются */
      if (jy < -5){ const p = -jy/120; footL = {x: -24, y: -22*p}; footR = {x: 24, y: -22*p}; }

      const hipY = -146 + bodyY, neckY = hipY - 124*squash;
      const hip = {x: 0, y: hipY};
      g.save(); g.translate(hip.x, hip.y); g.rotate(lean); g.translate(-hip.x, -hip.y);

      const sh = {L: {x: -56, y: neckY + 18}, R: {x: 56, y: neckY + 18}};
      const headC = {x: Math.sin(T*1.05)*2.5 + (s.talk ? Math.sin(T*6.5)*1.8 : 0), y: neckY - 92 + Math.sin(T*2.3 + 0.5)*1.2};
      const headRot = Math.sin(T*0.8)*0.03 + (s.talk ? Math.sin(T*3.1)*0.04 : 0) - this.waveK*0.06 + (this.walkK ? -ws*0.03*this.walkK : 0);

      /* ---- пружинки хвостиков: отстают от движения головы ---- */
      const hx = headC.x + ox/k, hy = headC.y + jy;
      if (this.prevHead){
        const ax = (hx - this.prevHead.x)/Math.max(dt, 0.001), ay = (hy - this.prevHead.y)/Math.max(dt, 0.001);
        for (const [i, side] of [[0, -1], [1, 1]]){
          const tl = this.tail[i], rest = side*0.25 + headRot;
          const force = -(tl.a - rest)*90 - tl.v*7 - ax*0.0025*1 + side*ay*0.0022;
          tl.v += force*dt; tl.a += tl.v*dt;
        }
      } else { this.tail[0].a = -0.38; this.tail[1].a = 0.38; }
      this.prevHead = {x: hx, y: hy};

      /* ---- хвостики (за головой) ---- */
      const hc = (dx, dy) => ({x: headC.x + dx*Math.cos(headRot) - dy*Math.sin(headRot), y: headC.y + dx*Math.sin(headRot) + dy*Math.cos(headRot)});
      { const pl = hc(-90, -74), pr = hc(90, -74);
        ponytail(g, pl.x, pl.y, this.tail[0].a + 0.55, -1); ponytail(g, pr.x, pr.y, this.tail[1].a - 0.55, 1); }

      /* ---- ноги ---- */
      for (const side of [-1, 1]){
        const f = side < 0 ? footL : footR, hipP = {x: side*25, y: hipY + 4};
        const leg = ik(hipP.x, hipP.y, f.x, f.y - 16, 63, 63, side > 0 ? -1 : 1);
        hose(g, hipP.x, hipP.y, leg.mx + side*2, leg.my, leg.tx, leg.ty, 40, C.legs, C.legsShade, C.legsLight);
        /* носочек */
        g.beginPath(); g.ellipse(leg.tx + side*4, leg.ty + 9, 22, 14, side*0.12, 0, Math.PI*2);
        const sg = g.createRadialGradient(leg.tx - 4, leg.ty + 3, 2, leg.tx, leg.ty + 9, 24); sg.addColorStop(0, '#ffc2da'); sg.addColorStop(1, C.sockShade);
        g.fillStyle = sg; g.fill(); g.strokeStyle = C.line; g.lineWidth = 2.6; g.stroke();
        g.beginPath(); g.ellipse(leg.tx, leg.ty - 3, 17, 6, 0, 0, Math.PI*2); g.fillStyle = C.sock; g.fill(); g.stroke();
      }

      /* ---- туловище: футболка и верх леггинсов ---- */
      { const top = neckY + 6, bot = hipY + 14;
        /* леггинсы-шортики */
        g.beginPath(); g.moveTo(-50, hipY - 16); g.lineTo(50, hipY - 16); g.quadraticCurveTo(56, bot, 40, bot + 6); g.lineTo(-40, bot + 6); g.quadraticCurveTo(-56, bot, -50, hipY - 16); g.closePath();
        const lg = g.createLinearGradient(-50, 0, 50, 0); lg.addColorStop(0, C.legsShade); lg.addColorStop(0.35, C.legsLight); lg.addColorStop(1, C.legsShade);
        g.fillStyle = lg; g.fill(); g.strokeStyle = C.line; g.lineWidth = 2.6; g.stroke();
        /* футболка */
        g.beginPath();
        g.moveTo(-30, top); g.quadraticCurveTo(0, top + 12, 30, top);
        g.quadraticCurveTo(58, top + 4, 62, top + 26);
        g.quadraticCurveTo(58, hipY - 40, 58, hipY + 4);
        g.quadraticCurveTo(0, hipY + 16, -58, hipY + 4);
        g.quadraticCurveTo(-58, hipY - 40, -62, top + 26);
        g.quadraticCurveTo(-58, top + 4, -30, top); g.closePath();
        const tg = g.createLinearGradient(-62, top, 62, hipY); tg.addColorStop(0, C.shirtLight); tg.addColorStop(0.45, C.shirt); tg.addColorStop(1, C.shirtShade);
        g.fillStyle = tg; g.fill(); g.stroke();
        /* вырез у шеи */
        g.beginPath(); g.moveTo(-24, top + 2); g.quadraticCurveTo(0, top + 18, 24, top + 2); g.strokeStyle = C.shirtShade; g.lineWidth = 5; g.stroke();
        /* сердечко */
        const hy2 = top + 52, hs = 1 + breath*0.02;
        g.save(); g.translate(14, hy2); g.scale(hs, hs);
        g.beginPath(); g.moveTo(0, 6); g.bezierCurveTo(-14, -4, -8, -15, 0, -8); g.bezierCurveTo(8, -15, 14, -4, 0, 6); g.fillStyle = C.heart; g.fill(); g.restore();
      }

      /* ---- руки (перед туловищем): кисть — цель, локоть гнётся наружу ---- */
      const handT = {};
      for (const side of [-1, 1]){
        const S = side < 0 ? sh.L : sh.R;
        let tx = S.x + side*14 + Math.sin(T*1.3 + side)*2, ty = S.y + 104 + Math.sin(T*2.3)*1.5;
        if (this.walkK > 0.01){ tx += side*6*this.walkK; ty += -side*ws*10*this.walkK; }
        if (s.talk && side < 0){ const gst = (Math.sin(T*2.2) + 1)/2; tx = lerp(tx, S.x + 26, gst*0.6); ty = lerp(ty, S.y + 62, gst*0.6); }
        if (side > 0 && this.waveK > 0.01){ const wv = Math.sin(T*9); tx = lerp(tx, S.x + 52 + wv*20, this.waveK); ty = lerp(ty, S.y - 92 - Math.abs(wv)*6, this.waveK); }
        if (this.happyK > 0.01){ tx = lerp(tx, S.x + side*70, this.happyK*0.9); ty = lerp(ty, S.y - 96 + Math.sin(T*7)*8, this.happyK*0.9); }
        if (jy < -5 || (this.jumpT > 0.1)){ const p = clamp(-jy/90, 0, 1); tx = lerp(tx, S.x + side*40, p); ty = lerp(ty, S.y - 100, p); }
        handT[side] = {tx, ty, S};
      }
      const drawArm = side => {
        const {tx, ty, S} = handT[side];
        const arm = ik(S.x, S.y, tx, ty, 56, 54, side > 0 ? -1 : 1);
        hose(g, S.x, S.y, arm.mx, arm.my, arm.tx, arm.ty, 26, C.skin, C.skinShade, C.skinLight);
        /* рукав футболки */
        const ex = lerp(S.x, arm.mx, 0.62), ey = lerp(S.y, arm.my, 0.62);
        g.lineCap = 'round'; g.beginPath(); g.moveTo(S.x, S.y); g.lineTo(ex, ey); g.strokeStyle = C.line; g.lineWidth = 41; g.stroke();
        g.strokeStyle = C.shirt; g.lineWidth = 36; g.stroke();
        g.beginPath(); g.moveTo(S.x - side*3, S.y - 2); g.lineTo(ex - side*2, ey - 2); g.strokeStyle = C.shirtLight; g.globalAlpha = .45; g.lineWidth = 10; g.stroke(); g.globalAlpha = 1;
        /* кисть */
        const ang = Math.atan2(arm.ty - arm.my, arm.tx - arm.mx);
        g.save(); g.translate(arm.tx, arm.ty); g.rotate(ang - Math.PI/2);
        g.beginPath(); g.ellipse(0, 6, 15, 17, 0, 0, Math.PI*2);
        const hg = g.createRadialGradient(-4, 2, 2, 0, 6, 18); hg.addColorStop(0, C.skinLight); hg.addColorStop(1, C.skinShade);
        g.fillStyle = hg; g.fill(); g.strokeStyle = C.line; g.lineWidth = 2.4; g.stroke();
        g.beginPath(); g.ellipse(side*-12, 0, 6, 9, side*-0.5, 0, Math.PI*2); g.fillStyle = C.skin; g.fill(); g.stroke();
        g.restore();
      };
      /* опущенные руки — до головы, поднятые выше плеча — поверх головы и хвостиков */
      const raised = side => handT[side].ty < handT[side].S.y - 30;
      for (const side of [-1, 1]) if (!raised(side)) drawArm(side);

      /* ---- шея и голова ---- */
      hose(g, 0, neckY + 10, 0, neckY - 4, 0, neckY - 22, 30, C.skin, C.skinShade, null);
      g.save(); g.translate(headC.x, headC.y); g.rotate(headRot);
      /* волосы сзади: силуэт вокруг лица */
      g.beginPath(); g.ellipse(0, -6, 112, 112, 0, 0, Math.PI*2); g.fillStyle = C.line; g.fill();
      { const bg = g.createRadialGradient(-30, -60, 10, 0, -6, 112); bg.addColorStop(0, C.hairLight); bg.addColorStop(0.6, C.hair); bg.addColorStop(1, C.hairDark);
        g.beginPath(); g.ellipse(0, -6, 109, 109, 0, 0, Math.PI*2); g.fillStyle = bg; g.fill(); }
      /* кудряшки по бокам, ниже ушей */
      for (const [x, y, r] of [[-98, 34, 22], [-92, 62, 18], [98, 34, 22], [92, 62, 18]]){ g.beginPath(); g.arc(x, y, r + 2.4, 0, Math.PI*2); g.fillStyle = C.line; g.fill(); }
      for (const [x, y, r] of [[-98, 34, 22], [-92, 62, 18], [98, 34, 22], [92, 62, 18]]) curl(g, x, y, r, x*0.02);
      /* ушки */
      for (const side of [-1, 1]){ g.beginPath(); g.ellipse(side*90, 18, 13, 17, 0, 0, Math.PI*2); g.fillStyle = C.skin; g.fill(); g.strokeStyle = C.line; g.lineWidth = 2.4; g.stroke();
        g.beginPath(); g.ellipse(side*90, 18, 6, 9, 0, 0, Math.PI*2); g.fillStyle = C.skinShade; g.fill(); }
      /* лицо */
      g.beginPath(); g.ellipse(0, 16, 88, 84, 0, 0, Math.PI*2);
      const fg = g.createRadialGradient(-26, -8, 10, 0, 16, 96); fg.addColorStop(0, C.skinLight); fg.addColorStop(0.62, C.skin); fg.addColorStop(1, C.skinShade);
      g.fillStyle = fg; g.fill(); g.strokeStyle = C.line; g.lineWidth = 2.8; g.stroke();
      /* щёчки */
      for (const side of [-1, 1]){ const cg = g.createRadialGradient(side*54, 46, 2, side*54, 46, 26); cg.addColorStop(0, C.cheek); cg.addColorStop(1, 'rgba(255,120,130,0)');
        g.fillStyle = cg; g.beginPath(); g.arc(side*54, 46, 26, 0, Math.PI*2); g.fill(); }
      /* глаза: моргание, взгляд по сторонам */
      if (now > this.blinkAt + 190) this.blinkAt = now + 2000 + Math.random()*3200;
      const bd = now - this.blinkAt, blink = bd < 0 ? 1 : bd < 70 ? 1 - bd/70 : bd < 190 ? (bd - 70)/120 : 1;
      if (now > this.lookAt){ this.lookT = Math.random() < 0.5 ? 0 : (Math.random() < 0.5 ? -1 : 1)*(0.5 + Math.random()*0.5); this.lookAt = now + 1500 + Math.random()*3000; }
      this.look = appr(this.look, this.lookT, 8);
      const ef = {open: blink, look: this.look, lookY: s.wave ? -0.4 : 0, happy: this.happyK};
      eye(g, -35, 18, 1.25, ef, -1); eye(g, 35, 18, 1.25, ef, 1);
      /* брови */
      g.strokeStyle = 'rgba(176,106,40,.8)'; g.lineWidth = 3.2; g.lineCap = 'round';
      for (const side of [-1, 1]){ const by = -24 - this.happyK*4 - (s.talk ? Math.max(0, Math.sin(T*5))*2 : 0);
        g.beginPath(); g.moveTo(side*22, by + 1); g.quadraticCurveTo(side*36, by - 6, side*50, by + 1); g.stroke(); }
      /* носик */
      g.beginPath(); g.ellipse(0, 46, 7, 5, 0, 0, Math.PI*2); g.fillStyle = C.skinShade; g.fill();
      g.beginPath(); g.ellipse(-2, 44, 3, 2, 0, 0, Math.PI*2); g.fillStyle = C.skinLight; g.fill();
      /* рот: при разговоре открывается плавно, как по слогам */
      if (s.talk){ if (now > this.mouthAt){ this.mouthT = Math.random() < 0.25 ? 0.1 : 0.35 + Math.random()*0.6; this.mouthAt = now + 90 + Math.random()*110; } }
      else this.mouthT = this.happyK > 0.5 ? 0.75 : 0;
      this.mouthOpen = appr(this.mouthOpen, this.mouthT, 22);
      mouth(g, 0, 66, 1, this.mouthOpen, 0.6 + this.happyK*0.4);
      /* волосы спереди: гладкая шапка с пробором, нижний край — кудрявая чёлка */
      const capPath = () => {
        g.beginPath(); g.moveTo(-96, 10);
        g.bezierCurveTo(-112, -70, -60, -112, 0, -114); g.bezierCurveTo(60, -112, 112, -70, 96, 10);
        /* край чёлки справа налево: волнистые завитки */
        const pts = [[86, -10], [72, -30], [54, -40], [34, -46], [14, -50], [0, -44], [-14, -50], [-34, -46], [-54, -40], [-72, -30], [-86, -10]];
        let px = 96, py = 10;
        for (const [x, y] of pts){ g.quadraticCurveTo((px + x)/2 + (y - py)*0.25, (py + y)/2 + 14, x, y); px = x; py = y; }
        g.quadraticCurveTo(-92, 4, -96, 10); g.closePath();
      };
      capPath(); g.strokeStyle = C.line; g.lineWidth = 5; g.stroke();
      { const hg = g.createLinearGradient(-60, -110, 60, -10); hg.addColorStop(0, C.hairLight); hg.addColorStop(0.5, C.hair); hg.addColorStop(1, C.hairDark);
        capPath(); g.fillStyle = hg; g.fill(); }
      /* пробор и пряди-завитки */
      g.strokeStyle = 'rgba(170,105,30,.6)'; g.lineCap = 'round'; g.lineWidth = 3;
      g.beginPath(); g.moveTo(0, -112); g.quadraticCurveTo(-2, -80, 0, -46); g.stroke();
      for (const [x0, y0, x1, y1, cx, cy] of [[-10, -104, -60, -48, -48, -92], [-20, -98, -84, -20, -80, -76], [10, -104, 60, -48, 48, -92], [20, -98, 84, -20, 80, -76], [-4, -96, -30, -50, -22, -80], [4, -96, 30, -50, 22, -80]]){
        g.beginPath(); g.moveTo(x0, y0); g.quadraticCurveTo(cx, cy, x1, y1); g.stroke(); }
      g.strokeStyle = 'rgba(255,240,190,.55)'; g.lineWidth = 6;
      g.beginPath(); g.moveTo(-40, -98); g.quadraticCurveTo(-62, -86, -72, -62); g.stroke();
      /* резинки на макушке, откуда растут хвостики */
      for (const side of [-1, 1]){ g.beginPath(); g.ellipse(side*84, -70, 12, 15, side*0.6, 0, Math.PI*2); g.fillStyle = C.tie; g.fill(); g.strokeStyle = C.line; g.lineWidth = 2.4; g.stroke(); }
      g.restore();
      for (const side of [-1, 1]) if (raised(side)) drawArm(side);
      g.restore();   // наклон тела
      g.restore();
    }
  }
  window.EmilyVector = EmilyVector;
})();
