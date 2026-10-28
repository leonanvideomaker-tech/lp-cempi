(() => {
  const $ = (s, el = document) => el.querySelector(s);
  const $$ = (s, el = document) => [...el.querySelectorAll(s)];
  const clamp = (v, a = 0, b = 1) => Math.min(b, Math.max(a, v));
  const ease = t => 1 - Math.pow(1 - t, 3);
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const isDesktop = () => innerWidth > 900;

  /* revelar ao rolar */
  const io = new IntersectionObserver(es => {
    es.forEach(e => { if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); } });
  }, { rootMargin: '0px 0px -12% 0px' });
  $$('.rv').forEach(el => io.observe(el));

  /* luz do vidro seguindo o mouse */
  $$('.glass').forEach(el => {
    el.addEventListener('pointermove', e => {
      const r = el.getBoundingClientRect();
      el.style.setProperty('--mx', (e.clientX - r.left) + 'px');
      el.style.setProperty('--my', (e.clientY - r.top) + 'px');
    });
  });

  /* temas que convergem para a formação */
  const conv = $('.converge');
  const card = $('#stageCard');
  const chips = $$('.chip');
  // posições espalhadas fixas (não aleatórias a cada carga)
  const scatter = [
    [-210, -170, -9], [150, -230, 7], [200, -60, -5], [-300, 40, 6],
    [80, 190, -8], [-120, 230, 10], [210, 150, 4], [-40, -260, -6],
    [180, 40, 9], [-260, -60, -11], [10, 120, 5], [-180, 120, -4], [120, -120, 8]
  ];

  /* jornada */
  const journey = $('#journey');
  const mods = $$('.mod');
  const mult = $('.mult-bg');

  const nav = $('#nav');
  const dock = $('#dock');
  const hero = $('.hero');
  const offer = $('#planos');
  const final = $('.final');

  let ticking = false;
  function frame() {
    ticking = false;
    const vh = innerHeight;

    nav.classList.toggle('on', scrollY > 40);

    const heroEnd = hero.getBoundingClientRect().bottom;
    const o = offer.getBoundingClientRect();
    const f = final.getBoundingClientRect();
    const overOffer = o.top < vh * .8 && o.bottom > vh * .2;
    const overFinal = f.top < vh;
    dock.classList.toggle('on', heroEnd < 0 && !overOffer && !overFinal);

    // converge
    let p = 1, spread = 1;
    if (!reduce) {
      if (isDesktop()) {
        const r = conv.getBoundingClientRect();
        const prog = clamp(-r.top / (r.height - vh));
        p = ease(clamp((prog - .08) / .62));
      } else {
        // celular: junta enquanto o cartão sobe do pé até o meio da tela
        const r = card.getBoundingClientRect();
        p = ease(clamp((vh * .95 - r.top) / (vh * .5)));
        spread = innerWidth / 900;
      }
    }
    card.style.setProperty('--p', p.toFixed(3));
    chips.forEach((c, i) => {
      const [x, y, rot] = scatter[i % scatter.length];
      const k = 1 - p;
      c.style.transform = k > 0.001 ? `translate(${x * k * spread}px, ${y * k * spread}px) rotate(${rot * k}deg)` : '';
      c.style.opacity = (.55 + .45 * p).toFixed(3);
    });

    // jornada
    const jr = journey.getBoundingClientRect();
    const jp = clamp((vh * .6 - jr.top) / jr.height);
    journey.style.setProperty('--jp', jp.toFixed(3));
    mods.forEach(m => {
      const t = m.getBoundingClientRect().top;
      m.classList.toggle('lit', t < vh * .6);
    });

    // paralaxe leve
    if (!reduce) {
      const mr = mult.parentElement.getBoundingClientRect();
      if (mr.bottom > 0 && mr.top < vh) mult.style.setProperty('--py', ((mr.top + mr.height / 2 - vh / 2) * -.12).toFixed(1) + 'px');
    }
  }
  const onScroll = () => { if (!ticking) { ticking = true; requestAnimationFrame(frame); } };
  addEventListener('scroll', onScroll, { passive: true });
  addEventListener('resize', onScroll);
  frame();

  /* cursor próprio: ponto exato + anel com atraso; vira etiqueta em [data-cursor] */
  if (matchMedia('(hover: hover) and (pointer: fine)').matches && !reduce) {
    const cur = $('#cur');
    const dot = $('.cur-dot', cur);
    const ring = $('.cur-ring', cur);
    const label = $('.cur-label', cur);
    document.documentElement.classList.add('has-cur');
    cur.classList.add('is-out');
    let mx = -100, my = -100, rx = -100, ry = -100;
    addEventListener('pointermove', e => {
      if (e.pointerType !== 'mouse') return;
      mx = e.clientX; my = e.clientY;
      dot.style.transform = `translate(${mx}px, ${my}px)`;
      cur.classList.remove('is-out');
      // link vence etiqueta: em cima do botão do plano, mostra o anel dourado
      const t = e.target;
      const link = t.closest('a, button, summary');
      const lab = !link && t.closest('[data-cursor]');
      cur.classList.toggle('is-link', !!link);
      cur.classList.toggle('is-label', !!lab);
      if (lab) label.textContent = lab.dataset.cursor;
    }, { passive: true });
    document.addEventListener('mouseleave', () => cur.classList.add('is-out'));
    addEventListener('pointerdown', () => cur.classList.add('is-down'));
    addEventListener('pointerup', () => cur.classList.remove('is-down'));
    (function loop() {
      rx += (mx - rx) * .18; ry += (my - ry) * .18;
      ring.style.transform = `translate(${rx.toFixed(1)}px, ${ry.toFixed(1)}px)`;
      requestAnimationFrame(loop);
    })();
  }

  /* checkout: link ainda não existe */
  const toast = $('#toast');
  let tt;
  $$('[data-checkout]').forEach(a => {
    a.addEventListener('click', e => {
      if (window.fbq) fbq('track', 'InitiateCheckout', { content_name: 'Escola de Vendas ' + a.dataset.checkout });
      if (a.getAttribute('href') === '#') {
        e.preventDefault();
        toast.textContent = 'Link do checkout ainda não configurado (' + a.dataset.checkout + ').';
        toast.classList.add('on');
        clearTimeout(tt);
        tt = setTimeout(() => toast.classList.remove('on'), 2600);
      }
    });
  });
})();
