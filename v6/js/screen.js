/* Экран для детской игры: полный экран и никакого случайного увеличения.
   1. Первое нажатие на странице включает полноэкранный режим (Android, iPad). На iPhone браузер этого не умеет:
      там игру добавляют на главный экран («Поделиться» → «На экран Домой»), и она открывается без панелей браузера.
   2. Увеличение запрещено: двумя пальцами, двойным тапом и жестами Safari. Прокрутка карты одним пальцем работает. */
(function(){
  const standalone = matchMedia('(display-mode: fullscreen), (display-mode: standalone)').matches || navigator.standalone === true;

  /* ---------- без увеличения ---------- */
  const css = document.createElement('style');
  css.textContent = 'html,body{touch-action:manipulation;-webkit-text-size-adjust:100%;text-size-adjust:100%}';
  (document.head || document.documentElement).appendChild(css);
  const stop = e => { if (e.cancelable) e.preventDefault(); };
  /* Safari: щипок двумя пальцами */
  for (const ev of ['gesturestart', 'gesturechange', 'gestureend']) document.addEventListener(ev, stop, {passive: false});
  /* два пальца и больше — не увеличиваем */
  document.addEventListener('touchstart', e => { if (e.touches.length > 1) stop(e); }, {passive: false});
  document.addEventListener('touchmove', e => { if (e.touches.length > 1 || (e.scale && e.scale !== 1)) stop(e); }, {passive: false});
  /* двойной тап: второе касание сразу после первого не увеличивает, но само нажатие работает */
  let lastEnd = 0;
  document.addEventListener('touchend', e => {
    const now = Date.now();
    if (now - lastEnd < 350 && e.changedTouches.length === 1){
      const t = e.target.closest && e.target.closest('a,button,input,label,select,textarea');
      stop(e);
      if (t) t.click();   /* кнопки и ссылки при быстром повторном нажатии всё равно срабатывают */
    }
    lastEnd = now;
  }, {passive: false});
  document.addEventListener('dblclick', stop, {passive: false});

  /* ---------- полный экран по первому нажатию ---------- */
  if (standalone) return;
  const el = document.documentElement;
  const req = el.requestFullscreen || el.webkitRequestFullscreen;
  if (!req) return;
  const inFs = () => document.fullscreenElement || document.webkitFullscreenElement;
  function go(e){
    if (inFs()) return;
    /* по ссылке на другую страницу полный экран всё равно закроется — там включится снова */
    if (e && e.target && e.target.closest && e.target.closest('a[href]')) return;
    try { const p = req.call(el, {navigationUI: 'hide'}); if (p && p.catch) p.catch(() => {}); } catch(err){}
  }
  document.addEventListener('pointerup', go, true);
  document.addEventListener('click', go, true);
})();
