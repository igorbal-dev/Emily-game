/* Общая «жизнь» сцены для всех уровней: облака плывут, птички пролетают, пылинки в комнате,
   мягкие тени под героями, звёздочки на успех.
   Уровень может до подключения задать window.WORLD = {outdoor:true|false}. */
(function(){
  const W = Object.assign({outdoor: false, birds: true, clouds: true, motes: true}, window.WORLD || {});
  const stage = document.getElementById('stage');
  if (!stage) return;
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const css = document.createElement('style');
  css.textContent = `
  #amb{position:absolute;inset:0;pointer-events:none;z-index:1;overflow:hidden}
  #amb .cloud{position:absolute;left:0;top:0;will-change:transform}
  #amb .cloud svg,#amb .bird svg{display:block;width:100%;height:100%;overflow:visible}
  #amb .bird{position:absolute;left:0;top:0}
  #amb .bird .w{transform-origin:50% 60%;animation:flap .32s ease-in-out infinite alternate}
  @keyframes flap{from{transform:scaleY(1)}to{transform:scaleY(-.55)}}
  #amb .mote{position:absolute;width:5px;height:5px;border-radius:50%;background:rgba(255,255,255,.75);box-shadow:0 0 6px rgba(255,240,200,.9)}
  .char .shadow{background:radial-gradient(ellipse at center,rgba(60,30,10,.30) 0%,rgba(60,30,10,.16) 45%,rgba(60,30,10,0) 72%) !important;left:0 !important;right:0 !important;bottom:-6% !important;height:12% !important;border-radius:50%}
  .fx-star{position:absolute;pointer-events:none;z-index:82;width:22px;height:22px}
  .fx-star svg{width:100%;height:100%;display:block;overflow:visible}
  @media (prefers-reduced-motion:reduce){#amb{display:none}}
  `;
  document.head.appendChild(css);
  const amb = document.createElement('div'); amb.id = 'amb';
  const bg = document.getElementById('bg');
  if (bg && bg.nextSibling) stage.insertBefore(amb, bg.nextSibling); else stage.appendChild(amb);

  const lay = () => (typeof L !== 'undefined' && L && L.W) ? L : {W: stage.clientWidth, H: stage.clientHeight, hz: stage.clientHeight*0.5, hE: stage.clientHeight*0.4};
  const rnd = (a, b) => a + Math.random()*(b - a);
  const sleepR = ms => new Promise(r => setTimeout(r, ms));

  /* ---------- облака ---------- */
  const CLOUD = '<svg viewBox="0 0 120 60"><g fill="#fff"><ellipse cx="38" cy="40" rx="30" ry="17"/><ellipse cx="62" cy="28" rx="27" ry="23"/><ellipse cx="86" cy="40" rx="27" ry="16"/><rect x="20" y="38" width="84" height="18" rx="9"/></g><ellipse cx="60" cy="52" rx="44" ry="5" fill="#dcefff" opacity=".7"/></svg>';
  const clouds = [];
  function makeClouds(){
    if (!W.outdoor || !W.clouds || reduce) return;
    for (let i = 0; i < 4; i++){
      const c = document.createElement('div'); c.className = 'cloud'; c.innerHTML = CLOUD; amb.appendChild(c);
      clouds.push({el: c, x: Math.random(), y: rnd(0.08, 0.55), s: rnd(0.55, 1.05), v: rnd(0.004, 0.009), o: rnd(.75, .95)});
    }
  }
  let lastT = 0;
  function tick(t){
    const dt = Math.min(0.1, (t - lastT)/1000 || 0); lastT = t;
    const l = lay(), sky = l.hz || l.H*0.5;
    for (const c of clouds){
      c.x += c.v*dt; if (c.x > 1.15) { c.x = -0.25; c.y = rnd(0.08, 0.55); }
      /* выше на небе = дальше = меньше и медленнее */
      const w = l.hE*0.55*c.s*(0.6 + 0.4*(c.y/0.55));
      c.el.style.width = w + 'px'; c.el.style.height = w*0.5 + 'px'; c.el.style.opacity = c.o;
      c.el.style.transform = `translate(${c.x*l.W}px,${c.y*sky - w*0.25}px)`;
    }
    requestAnimationFrame(tick);
  }

  /* ---------- птички ---------- */
  const BIRD = '<svg viewBox="0 0 40 20"><g class="w"><path d="M2 10 Q11 1 20 10 Q29 1 38 10" fill="none" stroke="#4a5a7a" stroke-width="3.2" stroke-linecap="round" stroke-linejoin="round"/></g><circle cx="20" cy="11" r="2.4" fill="#4a5a7a"/></svg>';
  async function birds(){
    if (!W.outdoor || !W.birds || reduce) return;
    await sleepR(rnd(4000, 9000));
    while (true){
      const l = lay(), sky = l.hz || l.H*0.5;
      const n = Math.random() < 0.4 ? 2 : 1, dir = Math.random() < 0.5 ? 1 : -1;
      for (let i = 0; i < n; i++){
        const b = document.createElement('div'); b.className = 'bird'; b.innerHTML = BIRD; amb.appendChild(b);
        const s = l.hE*rnd(0.07, 0.11), y0 = sky*rnd(0.1, 0.45) + i*s*0.8;
        Object.assign(b.style, {width: s + 'px', height: s*0.5 + 'px'});
        const x0 = dir > 0 ? -s*2 - i*s*1.5 : l.W + s*2 + i*s*1.5, x1 = dir > 0 ? l.W + s*3 : -s*3;
        const dur = rnd(6000, 9000);
        b.animate([
          {transform: `translate(${x0}px,${y0}px) scaleX(${dir})`},
          {transform: `translate(${(x0 + x1)/2}px,${y0 - s*rnd(0.5, 2)}px) scaleX(${dir})`},
          {transform: `translate(${x1}px,${y0 + s*rnd(-1, 1)}px) scaleX(${dir})`}
        ], {duration: dur, easing: 'linear', fill: 'forwards'}).finished.then(() => b.remove()).catch(() => b.remove());
      }
      await sleepR(rnd(14000, 26000));
    }
  }

  /* ---------- пылинки в солнечном свете (дома) ---------- */
  async function motes(){
    if (W.outdoor || !W.motes || reduce) return;
    await sleepR(2000);
    while (true){
      const l = lay(), top = (l.hz || l.H*0.5);
      const m = document.createElement('i'); m.className = 'mote'; amb.appendChild(m);
      const x = rnd(0.1, 0.9)*l.W, y = rnd(0.15, 0.85)*top, dx = rnd(-1, 1)*l.hE*0.3, dy = rnd(-0.4, 0.2)*l.hE*0.3, sc = rnd(0.6, 1.4);
      m.animate([{transform: `translate(${x}px,${y}px) scale(${sc})`, opacity: 0}, {opacity: .8, offset: .3}, {opacity: .6, offset: .7}, {transform: `translate(${x + dx}px,${y + dy}px) scale(${sc})`, opacity: 0}],
        {duration: rnd(5000, 8000), easing: 'ease-in-out', fill: 'forwards'}).finished.then(() => m.remove()).catch(() => m.remove());
      await sleepR(rnd(700, 1500));
    }
  }

  /* ---------- звёздочки на успех ---------- */
  const STAR = '<svg viewBox="0 0 24 24"><path d="M12 1.5l3 6.7 7.3.7-5.5 4.9 1.6 7.2L12 17.3 5.6 21l1.6-7.2L1.7 8.9 9 8.2z" fill="#ffd84d" stroke="#f2a900" stroke-width="1.4" stroke-linejoin="round"/></svg>';
  window.starBurst = function(x, y, n = 10){
    const l = lay();
    for (let i = 0; i < n; i++){
      const s = document.createElement('div'); s.className = 'fx-star'; s.innerHTML = STAR; stage.appendChild(s);
      const a = -Math.PI/2 + (i/(n - 1) - 0.5)*Math.PI*1.4, r = l.hE*rnd(0.25, 0.45), size = l.hE*rnd(0.05, 0.09);
      Object.assign(s.style, {left: (x - size/2) + 'px', top: (y - size/2) + 'px', width: size + 'px', height: size + 'px'});
      s.animate([{transform: 'translate(0,0) scale(.2) rotate(0)', opacity: 1},
                 {transform: `translate(${Math.cos(a)*r}px,${Math.sin(a)*r}px) scale(1.1) rotate(${rnd(-160, 160)}deg)`, opacity: 1, offset: .55},
                 {transform: `translate(${Math.cos(a)*r*1.15}px,${Math.sin(a)*r*1.15 + l.hE*0.15}px) scale(.6) rotate(${rnd(-200, 200)}deg)`, opacity: 0}],
        {duration: 1000 + Math.random()*300, easing: 'cubic-bezier(.2,.7,.3,1)', fill: 'forwards'}).finished.then(() => s.remove()).catch(() => s.remove());
    }
  };
  /* похвала: звёздочки над Эмили */
  function hookPraise(){
    if (typeof window.praise !== 'function' || window.praise.__world) return;
    const orig = window.praise;
    window.praise = function(){
      try {
        const e = (typeof heroes !== 'undefined') && heroes.emily;
        if (e && e.el && e.el.isConnected){
          const st = stage.getBoundingClientRect(), r = e.el.getBoundingClientRect();
          if (r.width > 2) window.starBurst(r.left - st.left + r.width/2, r.top - st.top + r.height*0.2);
        }
      } catch(err){}
      return orig.apply(this, arguments);
    };
    window.praise.__world = true;
  }

  makeClouds();
  requestAnimationFrame(tick);
  birds(); motes(); hookPraise();
})();
