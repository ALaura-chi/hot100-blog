const root = document.documentElement;
const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)');

function initTheme() {
  const button = document.querySelector<HTMLButtonElement>('#theme-toggle');
  const system = matchMedia('(prefers-color-scheme: dark)');
  let manual = false;
  try { manual = ['light','dark'].includes(localStorage.getItem('hot100-theme') || ''); } catch {}
  const refresh = () => {
    const dark = root.dataset.theme === 'dark';
    button?.setAttribute('aria-label', dark ? '切换到浅色模式' : '切换到深色模式');
    button?.setAttribute('aria-pressed', String(dark));
    window.dispatchEvent(new CustomEvent('themechange'));
  };
  button?.addEventListener('click', () => {
    root.dataset.theme = root.dataset.theme === 'dark' ? 'light' : 'dark'; manual = true;
    try { localStorage.setItem('hot100-theme', root.dataset.theme); } catch {}
    refresh();
  });
  system.addEventListener('change', event => { if (!manual) { root.dataset.theme = event.matches ? 'dark' : 'light'; refresh(); } });
  refresh();
}

function initMenus() {
  const menu = document.querySelector<HTMLElement>('#header-links');
  const toggle = document.querySelector<HTMLButtonElement>('#menu-toggle');
  const directory = document.querySelector<HTMLDetailsElement>('#problem-directory');
  const mobile = matchMedia('(max-width: 899px)');
  const setMenu = (open: boolean) => {
    menu?.classList.toggle('is-open', open);
    toggle?.setAttribute('aria-expanded', String(open));
    toggle?.setAttribute('aria-label', open ? '收起导航菜单' : '展开导航菜单');
  };
  toggle?.addEventListener('click', () => setMenu(toggle.getAttribute('aria-expanded') !== 'true'));
  menu?.addEventListener('click', event => { if ((event.target as Element).closest('a')) setMenu(false); });
  const setDirectory = () => { if (directory) directory.open = !mobile.matches; };
  setDirectory(); mobile.addEventListener('change', setDirectory);
  directory?.querySelectorAll<HTMLAnchorElement>('a').forEach(link => link.addEventListener('click', () => { if (mobile.matches) directory.open = false; }));
  document.addEventListener('keydown', event => {
    if (event.key !== 'Escape') return;
    if (toggle?.getAttribute('aria-expanded') === 'true') { setMenu(false); toggle.focus(); }
    if (mobile.matches && directory?.open) { directory.open = false; directory.querySelector('summary')?.focus(); }
  });
}

function initCopy() {
  const status = document.querySelector<HTMLElement>('#copy-status');
  document.querySelectorAll<HTMLPreElement>('.prose pre').forEach(pre => {
    if (pre.parentElement?.classList.contains('code-block')) return;
    const code = pre.querySelector('code'); if (!code) return;
    const wrapper = document.createElement('div'); wrapper.className = 'code-block';
    const toolbar = document.createElement('div'); toolbar.className = 'code-toolbar';
    const label = document.createElement('span'); label.textContent = 'JAVA';
    const button = document.createElement('button'); button.type = 'button'; button.className = 'copy-button'; button.textContent = 'Copy'; button.setAttribute('aria-label','复制 Java 代码');
    toolbar.append(label, button); pre.before(wrapper); wrapper.append(toolbar, pre);
    button.addEventListener('click', async () => {
      try {
        if (!navigator.clipboard) throw new Error('Clipboard unavailable');
        await navigator.clipboard.writeText(code.textContent || ''); button.textContent = '已复制';
        if (status) status.textContent = '代码已复制到剪贴板';
      } catch { button.textContent = '复制失败'; if (status) status.textContent = '复制未成功，请选中代码手动复制'; }
      setTimeout(() => { button.textContent = 'Copy'; }, 1800);
    });
  });
}

function initReading() {
  const sections = [...document.querySelectorAll<HTMLElement>('[data-problem]')];
  const links = [...document.querySelectorAll<HTMLAnchorElement>('.problem-link')];
  const scrollPane = document.querySelector<HTMLElement>('.index-scroll');
  const bar = document.querySelector<HTMLElement>('#reading-progress-fill');
  const topButton = document.querySelector<HTMLButtonElement>('#back-to-top');
  let positions: number[] = [], active = -1, frame = 0;
  const measure = () => { positions = sections.map(section => section.getBoundingClientRect().top + scrollY); queue(); };
  const update = () => {
    frame = 0;
    const limit = document.documentElement.scrollHeight - innerHeight;
    const progress = limit > 0 ? Math.max(0, Math.min(1, scrollY / limit)) : 0;
    if (bar) bar.style.transform = `scaleX(${progress})`;
    if (topButton) topButton.hidden = scrollY < 500;
    if (!sections.length) return;
    let index = 0, left = 0, right = positions.length - 1;
    while (left <= right) { const middle = (left + right) >> 1; if (positions[middle] <= scrollY + 145) { index = middle; left = middle + 1; } else right = middle - 1; }
    if (limit > 0 && scrollY >= limit - 3) index = sections.length - 1;
    if (index === active) return;
    if (active >= 0 && links[active]) { links[active].classList.remove('active'); links[active].removeAttribute('aria-current'); }
    const link = links[index]; active = index;
    if (!link) return;
    link.classList.add('active'); link.setAttribute('aria-current','location');
    if (innerWidth >= 900 && scrollPane) {
      const box = link.getBoundingClientRect(), pane = scrollPane.getBoundingClientRect();
      if (box.top < pane.top + 10) scrollPane.scrollTop -= pane.top + 10 - box.top;
      else if (box.bottom > pane.bottom - 10) scrollPane.scrollTop += box.bottom - pane.bottom + 10;
    }
  };
  const queue = () => { if (!frame) frame = requestAnimationFrame(update); };
  window.addEventListener('scroll', queue, {passive:true}); window.addEventListener('resize', measure, {passive:true});
  topButton?.addEventListener('click', () => scrollTo({top:0, behavior:reducedMotion.matches?'instant':'smooth'}));
  const article = document.querySelector('.article-body'); if (article) new ResizeObserver(measure).observe(article);
  document.fonts.ready.then(measure); measure();
}

function initBackground() {
  const canvas = document.querySelector<HTMLCanvasElement>('#background-grid'); if (!canvas) return;
  const context = canvas.getContext('2d'); if (!context) return;
  const coarse = matchMedia('(pointer: coarse)');
  let width = innerWidth, height = innerHeight, frame = 0;
  let pointer: {x:number;y:number}|null = null;
  let waves: {x:number;y:number;start:number}[] = [];
  const draw = (now: number) => {
    frame = 0; if (document.hidden) return;
    context.clearRect(0,0,width,height); context.strokeStyle = getComputedStyle(root).getPropertyValue('--grid-color'); context.lineWidth = 1;
    const animated = !reducedMotion.matches && !coarse.matches;
    waves = animated ? waves.filter(wave=>now-wave.start<1400) : [];
    const point = (x:number,y:number) => {
      let offset = 0;
      if (animated && pointer) { const distance = Math.hypot(x-pointer.x,y-pointer.y); offset += Math.max(0,1-distance/220)*5; }
      for (const wave of waves) { const distance = Math.hypot(x-wave.x,y-wave.y), age=(now-wave.start)/1000; offset += Math.sin(distance/24-age*9)*Math.exp(-Math.abs(distance-age*200)/90)*(1-age/1.4)*6; }
      return [x+offset,y+offset];
    };
    for (let x=0;x<=width;x+=64) { context.beginPath(); for(let y=0;y<=height+16;y+=16){const [px,py]=point(x,y);if(y===0)context.moveTo(px,py);else context.lineTo(px,py);}context.stroke(); }
    for (let y=0;y<=height;y+=64) { context.beginPath(); for(let x=0;x<=width+16;x+=16){const [px,py]=point(x,y);if(x===0)context.moveTo(px,py);else context.lineTo(px,py);}context.stroke(); }
    if (waves.length) frame = requestAnimationFrame(draw);
  };
  const schedule = () => { if (!frame && !document.hidden) frame = requestAnimationFrame(draw); };
  const resize = () => { width=innerWidth; height=innerHeight; const ratio=Math.min(devicePixelRatio||1,2);canvas.width=Math.round(width*ratio);canvas.height=Math.round(height*ratio);context.setTransform(ratio,0,0,ratio,0,0);schedule(); };
  window.addEventListener('resize', resize, {passive:true});
  window.addEventListener('pointermove', event=>{if(reducedMotion.matches||coarse.matches)return;pointer={x:event.clientX,y:event.clientY};schedule();},{passive:true});
  document.addEventListener('pointerleave',()=>{pointer=null;schedule();});
  window.addEventListener('click',event=>{if(!event.detail||reducedMotion.matches||coarse.matches)return;waves.push({x:event.clientX,y:event.clientY,start:performance.now()});waves=waves.slice(-3);schedule();},{passive:true});
  window.addEventListener('themechange',schedule); reducedMotion.addEventListener('change',schedule);
  document.addEventListener('visibilitychange',()=>{if(document.hidden){cancelAnimationFrame(frame);frame=0;waves=[];}else schedule();});
  resize();
}

initTheme(); initMenus(); initCopy(); initReading(); initBackground();
export {};
