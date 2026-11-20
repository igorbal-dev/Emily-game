/* Кукла-конструктор: герой собирается из частей (голова, туловище, руки, ноги) и двигается в суставах.
   Описание частей — puppet.json из art/puppets/<имя> (его делает tools/fit_puppet.py).
   Рисуется на своём canvas; поза — набор углов в градусах на часть, плюс глаза и рот. */
(function(){
  const rad = d => d*Math.PI/180;
  const load = src => new Promise(res => { const im = new Image(); im.onload = () => res(im); im.onerror = () => res(null); im.src = src; });

  class Puppet {
    static async create(base){
      const def = await (await fetch(base + 'puppet.json')).json();
      const p = new Puppet(def);
      await Promise.all([
        ...Object.entries(def.parts).filter(([, v]) => !v.hidden).map(async ([k, v]) => { p.img[k] = await load(base + v.src); }),
        ...Object.entries(def.face).map(async ([k, v]) => { p.face[k] = await load(base + v.src); })
      ]);
      p.bounds = p.measure();
      return p;
    }
    constructor(def){
      this.def = def; this.img = {}; this.face = {};
      this.order = Object.keys(def.parts).filter(k => !def.parts[k].hidden).sort((a, b) => def.parts[a].z - def.parts[b].z);
    }
    /* мировые матрицы частей: [a,b,c,d,e,f] как у canvas; pose — {часть: градусы} */
    frames(pose){
      const P = this.def.parts, out = {};
      const place = k => {
        if (out[k]) return out[k];
        const info = P[k], [px, py] = info.joints.pivot;
        let rot = (info.rot || 0) + (pose[k] || 0), x, y;
        if (info.parent){
          const par = place(info.parent), pi = P[info.parent];
          const [jx, jy] = typeof info.at === 'string' ? pi.joints[info.at] : info.at;
          const [ppx, ppy] = pi.joints.pivot, a = rad(par.rot), dx = jx - ppx, dy = jy - ppy;
          x = par.x + dx*Math.cos(a) - dy*Math.sin(a); y = par.y + dx*Math.sin(a) + dy*Math.cos(a) + (pose[k + 'Y'] || 0); rot += par.rot;
        } else { x = pose.x || 0; y = pose.y || 0; rot += pose.lean || 0; }
        return (out[k] = {x, y, rot, px, py, sy: k === 'torso' ? (pose.breath || 1) : 1});
      };
      for (const k in P) place(k);
      return out;
    }
    /* рамка куклы в покое относительно точки крепления туловища: чтобы ставить её ногами на пол */
    measure(){
      const F = this.frames({}); let x0 = 1e9, y0 = 1e9, x1 = -1e9, y1 = -1e9;
      for (const k of this.order){
        const f = F[k], [w, h] = this.def.parts[k].size, a = rad(f.rot);
        for (const [cx, cy] of [[0, 0], [w, 0], [0, h], [w, h]]){
          const dx = cx - f.px, dy = cy - f.py, X = f.x + dx*Math.cos(a) - dy*Math.sin(a), Y = f.y + dx*Math.sin(a) + dy*Math.cos(a);
          x0 = Math.min(x0, X); y0 = Math.min(y0, Y); x1 = Math.max(x1, X); y1 = Math.max(y1, Y);
        }
      }
      return {x0, y0, x1, y1, w: x1 - x0, h: y1 - y0};
    }
    /* рисует куклу: ox, oy — куда поставить середину ступней, k — масштаб */
    draw(ctx, pose, ox, oy, k){
      const F = this.frames(pose), b = this.bounds, P = this.def.parts, FA = this.def.faceAnchor;
      /* руки, поднятые выше плеча или вытянутые вперёд, рисуются поверх туловища и головы */
      const zOf = n => {
        const z = P[n].z, r = pose[n.replace('farm', 'uarm')] || 0;
        if (/^(uarm|farm)/.test(n) && Math.abs(r) > 55) return 90 + (n.startsWith('farm') ? 1 : 0);
        return z;
      };
      const order = this.order.slice().sort((a, c) => zOf(a) - zOf(c));
      ctx.save();
      ctx.translate(ox, oy); ctx.scale(k, k); ctx.translate(-(b.x0 + b.x1)/2, -b.y1);
      for (const n of order){
        const f = F[n], im = this.img[n]; if (!im) continue;
        ctx.save(); ctx.translate(f.x, f.y); ctx.rotate(rad(f.rot)); if (f.sy !== 1) ctx.scale(2 - f.sy, f.sy);
        ctx.drawImage(im, -f.px, -f.py);
        if (n === 'head' && FA){
          const [w, h] = P.head.size;
          for (const kind of ['eyes', 'mouth']){
            const st = this.face[kind + '_' + (pose[kind] || (kind === 'eyes' ? 'open' : 'smile'))]; if (!st) continue;
            const [cx, cy, sw] = FA[kind], s = sw*w/st.width;
            ctx.drawImage(st, -f.px + cx*w - st.width*s/2, -f.py + cy*h - st.height*s/2, st.width*s, st.height*s);
          }
        }
        ctx.restore();
      }
      ctx.restore();
    }
  }

  /* Живой герой: дыхание, моргание, рот при разговоре, взмах, ходьба. Всё плавно и само по себе. */
  class PuppetActor {
    constructor(puppet, canvas){
      this.p = puppet; this.c = canvas; this.g = canvas.getContext('2d');
      this.state = {talk: false, wave: false, walk: false, mood: 'smile'};
      this.t0 = performance.now(); this.blinkAt = this.t0 + 1500; this.mouthAt = 0; this.mouth = 'smile';
      this.raf = requestAnimationFrame(t => this.tick(t));
    }
    set(s){ Object.assign(this.state, s); }
    pose(t){
      const s = this.state, T = (t - this.t0)/1000, pose = {};
      if (s.jump) s.mood = s.mood;
      /* дыхание и лёгкое покачивание */
      pose.breath = 1 + Math.sin(T*2.4)*0.012;
      pose.head = Math.sin(T*1.1)*2.2 + (s.talk ? Math.sin(T*7)*1.6 : 0);
      pose.uarmL = Math.sin(T*1.3)*2.5; pose.uarmR = -Math.sin(T*1.3 + 0.6)*2.5;
      pose.farmL = Math.sin(T*1.3 + 0.4)*3; pose.farmR = -Math.sin(T*1.3 + 1)*3;
      pose.tailL = Math.sin(T*2.1)*4; pose.tailR = Math.sin(T*2.1 + 0.8)*4;
      if (s.walk){
        /* шаг спереди: нога поднимается и чуть сгибается, тело покачивается из стороны в сторону */
        const ph = T*6.5, w = Math.sin(ph), up = v => Math.max(0, v);
        pose.thighLY = -up(w)*26; pose.thighRY = -up(-w)*26;
        pose.thighL = 3 + up(w)*6; pose.thighR = -3 - up(-w)*6;
        pose.shinL = -up(w)*10; pose.shinR = up(-w)*10;
        pose.lean = w*2.5; pose.y = -Math.abs(w)*8;
        pose.uarmL += w*12; pose.uarmR += w*12; pose.farmL += -8; pose.farmR += 8;
        pose.head += -w*1.5;
      }
      if (s.jump){
        const j = Math.max(0, Math.sin(T*5));
        pose.y = -j*70; pose.uarmL = 140*j + 10; pose.uarmR = -140*j - 10; pose.farmL = 20*j; pose.farmR = -20*j;
        pose.thighL = -8*j; pose.thighR = 8*j; pose.shinL = 14*j; pose.shinR = -14*j; pose.breath = 1 - 0.03*j;
      }
      if (s.wave){
        pose.uarmR = -150 + Math.sin(T*9)*6; pose.farmR = -25 + Math.sin(T*9)*22; pose.head += -3;
      }
      /* моргание: открыты — полуприкрыты — закрыты — полуприкрыты — открыты */
      let eyes = s.mood === 'happy' ? 'happy' : 'open';
      if (t > this.blinkAt){
        const d = t - this.blinkAt;
        eyes = d < 50 ? 'half' : d < 120 ? 'closed' : d < 170 ? 'half' : eyes;
        if (d > 170) this.blinkAt = t + 2200 + Math.random()*3500;
      }
      pose.eyes = eyes;
      if (s.talk){
        if (t > this.mouthAt){ this.mouth = ['talk', 'smile', 'talk', 'laugh', 'o'][Math.floor(Math.random()*5)]; this.mouthAt = t + 90 + Math.random()*90; }
        pose.mouth = this.mouth;
      } else pose.mouth = s.mood === 'happy' ? 'laugh' : 'smile';
      return pose;
    }
    tick(t){
      const c = this.c, g = this.g, dpr = Math.min(2, devicePixelRatio || 1);
      const W = c.clientWidth, H = c.clientHeight;
      if (c.width !== Math.round(W*dpr)){ c.width = Math.round(W*dpr); c.height = Math.round(H*dpr); }
      g.setTransform(dpr, 0, 0, dpr, 0, 0); g.clearRect(0, 0, W, H);
      const b = this.p.bounds, k = Math.min(W/(b.w*1.25), H*0.98/b.h);
      this.p.draw(g, this.pose(t), W/2, H - 4, k);
      this.raf = requestAnimationFrame(tt => this.tick(tt));
    }
  }
  window.Puppet = Puppet; window.PuppetActor = PuppetActor;
})();
