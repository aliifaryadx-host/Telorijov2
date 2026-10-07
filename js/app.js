/* TelorIjo app.js: render data, transisi, efek, status server, modal, musik */
(() => {
  const D = window.TJ, $ = (s, r = document) => r.querySelector(s), $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const body = document.body, both = `${D.ip}:${D.port}`, wipe = $('#wipe');
  let sfxOn = true, ctx, busy = false, started = false;

  /* ---- SFX sintetis ---- */
  const tone = (t, a, b, d, v, dl = 0) => {
    if (!sfxOn) return;
    try {
      ctx = ctx || new (window.AudioContext || window.webkitAudioContext)(); ctx.resume();
      const o = ctx.createOscillator(), g = ctx.createGain(), s = ctx.currentTime + dl;
      o.type = t; o.frequency.setValueAtTime(a, s); o.frequency.exponentialRampToValueAtTime(b, s + d);
      g.gain.setValueAtTime(v, s); g.gain.exponentialRampToValueAtTime(.001, s + d);
      o.connect(g); g.connect(ctx.destination); o.start(s); o.stop(s + d);
    } catch (e) {}
  };
  const sfx = {
    hover: () => tone('triangle', 440, 880, .05, .06),
    sel: () => { tone('sine', 150, 30, .25, .3); tone('sawtooth', 800, 200, .15, .15); },
    wh: () => tone('sawtooth', 120, 1400, .35, .06),
    start: () => { tone('sine', 120, 25, .5, .4); [330, 495, 660].forEach((f, i) => tone('square', f, f, .1, .07, i * .08)); }
  };

  /* ---- Efek ---- */
  const restart = (el, c, ms) => { el.classList.remove(c); void el.offsetWidth; el.classList.add(c); setTimeout(() => el.classList.remove(c), ms); };
  const shake = () => restart($('#app'), 'shake', 420), flash = () => restart($('#flash'), 'go', 250);
  const colors = ['#d6001c', '#fff', '#ffe500', '#000', '#ff3b57'];
  function burst(x, y) {
    const fx = $('#fx'), r = document.createElement('div');
    r.className = 'ring'; r.style.left = x + 'px'; r.style.top = y + 'px'; fx.appendChild(r); setTimeout(() => r.remove(), 600);
    for (let i = 0; i < 14; i++) {
      const a = Math.random() * 6.28, d = 60 + Math.random() * 110, p = document.createElement('b');
      p.className = 'shard';
      p.style.cssText = `--x:${x}px;--y:${y}px;--dx:${Math.cos(a) * d}px;--dy:${Math.sin(a) * d}px;--r:${Math.random() * 720 - 360}deg;--s:${10 + Math.random() * 22}px;--c:${colors[i % 5]}`;
      fx.appendChild(p); setTimeout(() => p.remove(), 700);
    }
  }
  function transition(fn) {
    if (busy) return; busy = true; sfx.wh();
    restart(wipe, 'run', 1020); setTimeout(fn, 560); setTimeout(() => (busy = false), 1020);
  }

  /* ---- Build ---- */
  $$('[data-ransom]').forEach(el => {
    el.textContent = '';
    [...el.dataset.ransom].forEach((ch, i) => { const s = document.createElement('span'); s.textContent = ch === ' ' ? '\u00A0' : ch; s.style.setProperty('--i', i); s.setAttribute('aria-hidden', 'true'); el.appendChild(s); });
  });
  for (let i = 0; i < 16; i++) {
    const s = document.createElement('i'); s.textContent = '■✦◆★'[i % 4];
    s.style.cssText = `left:${Math.random() * 100}%;font-size:${14 + Math.random() * 30}px;animation-duration:${14 + Math.random() * 18}s;animation-delay:${-Math.random() * 30}s`;
    $('#stars').appendChild(s);
  }
  let statusTxt = 'JOIN THE ADVENTURE';
  function tickers() {
    $$('[data-tk]').forEach(t => {
      let w = D.ticker[t.dataset.tk]; if (!w) return;
      if (t.dataset.tk === 'main') w = [statusTxt, `IP: ${D.ip}`, `PORT: ${D.port}`, ...w.slice(1)];
      const once = w.map(x => `<span>${x}</span><span>★</span>`).join('');
      t.innerHTML = once.repeat(4) + once.repeat(4);
    });
  }
  (function typer(el = $('#typer'), w = 0, i = 0, del = false) {
    const word = D.roles[w]; el.textContent = word.slice(0, i); let ms = del ? 35 : 75;
    if (!del && i === word.length) { del = true; ms = 1400; } else if (del && i === 0) { del = false; w = (w + 1) % D.roles.length; ms = 350; } else i += del ? -1 : 1;
    setTimeout(() => typer(el, w, i, del), ms);
  })();

  $('#heroIp').textContent = both; $('#jIp').textContent = $('#mIp').textContent = D.ip; $('#jPort').textContent = $('#mPort').textContent = D.port;
  $('#discord').href = D.discord; $('#direct').href = `minecraft://?addExternalServer=TelorIjo|${both}`;

  const rv = (h, i = 0) => `<div class="rv" style="--d:${(i % 3) * 100}ms">${h}</div>`;
  $('#feat').innerHTML = D.features.map((f, i) => rv(`<div class="card tilt"><div class="card-in"><div class="ico"><img src="assets/${f.icon}" alt="" onerror="this.remove()">${f.title[0]}</div><h3>${f.title}</h3><p>${f.desc}</p></div></div>`, i)).join('');
  $('#gal').innerHTML = D.gallery.map((g, i) => rv(`<figure class="frame tilt" style="--r:${[-1.5, 1, -.5][i % 3]}deg" data-slot="assets/${g}"><img src="assets/${g}" alt="Screenshot ${i + 1}" loading="lazy" onerror="this.parentNode.classList.add('no-img')"></figure>`, i)).join('');
  const tm = ([n, r], i) => `<div class="tm"><div class="av"><img src="assets/${i + 1}.png" alt="${n}" onerror="this.onerror=null;this.src='https://mc-heads.net/avatar/MHF_Steve/128'"></div><b>${n}</b><small>${r.toUpperCase()}</small></div>`;
  $('#t1').innerHTML = D.team.slice(0, 5).map(tm).join('').repeat(6);
  $('#t2').innerHTML = D.team.slice(5).map((m, i) => tm(m, i + 5)).join('').repeat(6);
  $('#tabs').innerHTML = `<div class="tb">${Object.keys(D.steps).map((k, i) => `<button class="${i ? '' : 'on'}" data-tab="${k}">${k.toUpperCase()}</button>`).join('')}</div>` +
    Object.entries(D.steps).map(([k, s], i) => `<ol class="${i ? '' : 'on'}" data-p="${k}">${s.map(x => `<li>${x}</li>`).join('')}</ol>`).join('');
  $('#faqList').innerHTML = D.faqs.map(([q, a], i) => rv(`<div class="fq"><button aria-expanded="false"><span class="n">${String(i + 1).padStart(2, '0')}</span><span class="t">${q}</span><span class="p">+</span></button><div class="bd"><div><p>${a}</p></div></div></div>`, i)).join('');
  const L = [['D', 'DISCORD', 'Gabung komunitas & event', D.discord], ['V', 'VOTE', 'Dukung server TelorIjo', D.vote], ['S', 'STORE', 'Rank & cosmetics', D.store], ['T', 'DAFTAR STAFF', 'Jadi bagian tim', D.staffForm], ['Y', 'DAFTAR STREAMER', 'Untuk content creator', D.streamerForm]];
  $('#cta').innerHTML = L.map(([i, k, t, u], n) => `<a class="ch press rv ${u === '#' ? 'soon' : ''}" style="--d:${n * 80}ms" href="${u}" target="_blank" rel="noopener"><span class="i">${i}</span><span class="t"><b>${k}</b><small>${t}</small></span><span class="go">${u === '#' ? 'SEGERA' : 'BUKA ►'}</span></a>`).join('');
  $('#rulesGrid').innerHTML = D.rules.map(([r, p], i) => rv(`<div class="card tilt"><div class="card-in"><span class="rn">#${String(i + 1).padStart(2, '0')}</span><p style="font-size:.9rem;color:#fff;font-weight:600">${r}</p><span class="pen">${p}</span></div></div>`, i)).join('');
  $('#rulesList').innerHTML = D.rules.map(([r, p], i) => `<div class="ru" style="--d:${150 + i * 55}ms"><b>#${i + 1}</b><div><p>${r}</p><small>Penalty: ${p}</small></div></div>`).join('');

  /* ---- Status server live ---- */
  const stat = (v, l, id = '') => `<div class="stat rv"><b ${id}>${v}</b><small>${l}</small></div>`;
  $('#statsBox').innerHTML = stat('…', 'STATUS', 'id="sSt"') + stat('–', 'PEMAIN ONLINE', 'id="sPl"') + stat('–', 'KAPASITAS', 'id="sMx"') + stat('J + B', 'JAVA &amp; BEDROCK') + stat('2026', 'SEJAK');
  async function status() {
    let on = null, pl = null, mx = null;
    try { const d = await (await fetch(`https://api.mcsrvstat.us/bedrock/3/${D.ip}:${D.port}`)).json(); on = !!d.online; pl = d.players?.online ?? null; mx = d.players?.max ?? null; } catch (e) {}
    $('#stText').textContent = on === null ? 'Server' : on ? 'Server Online' : 'Server Offline';
    $('#stDot').classList.toggle('off', on === false);
    $('#stPl').textContent = on && pl != null ? ` ${pl}/${mx}` : '';
    $('#sSt').textContent = on === null ? '?' : on ? 'ON' : 'OFF'; $('#sPl').textContent = pl ?? '–'; $('#sMx').textContent = mx ?? '–';
    statusTxt = on ? `SERVER ONLINE${pl != null ? ` ${pl}/${mx}` : ''}` : on === false ? 'SERVER OFFLINE' : 'JOIN THE ADVENTURE'; tickers();
  }

  /* ---- Copy ---- */
  function copy(txt, lbl) {
    const done = () => { lbl.dataset.o = lbl.dataset.o || lbl.textContent; lbl.textContent = '✓ COPIED'; clearTimeout(lbl._t); lbl._t = setTimeout(() => (lbl.textContent = lbl.dataset.o), 1800); };
    if (navigator.clipboard && isSecureContext) navigator.clipboard.writeText(txt).then(done, done);
    else { const t = document.createElement('textarea'); t.value = txt; body.appendChild(t); t.select(); try { document.execCommand('copy'); } catch (e) {} t.remove(); done(); }
  }

  /* ---- Modal ---- */
  const open = m => { m.hidden = false; body.style.overflow = 'hidden'; };
  const close = m => { m.classList.add('out'); setTimeout(() => { m.hidden = true; m.classList.remove('out'); if (!$('.mod:not([hidden])')) body.style.overflow = ''; }, 260); };

  /* ---- Mulai ---- */
  function start() {
    if (started || busy) return; started = true;
    sfx.start(); shake(); flash(); $('#intro').classList.add('leave');
    transition(() => { $('#intro').hidden = true; body.classList.remove('is-intro'); body.classList.add('booted'); scrollTo(0, 0); });
  }

  /* ---- Event ---- */
  document.addEventListener('pointerdown', e => { const b = e.target.closest('.press'); if (b) { burst(e.clientX, e.clientY); restart(b, 'pressed', 400); } });
  document.addEventListener('click', e => {
    const t = e.target, q = s => t.closest(s);
    if (q('#start')) return start();
    let el;
    if ((el = q('[data-nav]'))) { e.preventDefault(); sfx.sel(); $('#menu').classList.remove('open'); return transition(() => document.getElementById(el.dataset.nav).scrollIntoView()); }
    if ((el = q('[data-open]'))) { sfx.sel(); shake(); return open(document.getElementById(el.dataset.open)); }
    if ((el = q('[data-close]')) ) return close(el.closest('.mod'));
    if (t.classList.contains('mod')) return close(t);
    if ((el = q('[data-copy]'))) { sfx.sel(); const v = { ip: D.ip, port: D.port, both }[el.dataset.copy]; return copy(v, $('.cl', el)); }
    if ((el = q('[data-tab]'))) { sfx.sel(); $$('[data-tab]').forEach(b => b.classList.toggle('on', b === el)); return $$('[data-p]').forEach(o => o.classList.toggle('on', o.dataset.p === el.dataset.tab)); }
    if ((el = q('.fq button'))) { const f = el.parentNode, was = f.classList.contains('open'); sfx.hover(); $$('.fq').forEach(x => x.classList.remove('open')); f.classList.toggle('open', !was); return el.setAttribute('aria-expanded', !was); }
    if (q('#burger')) { sfx.hover(); return $('#menu').classList.toggle('open'); }
    if (q('#sfxBtn')) { sfxOn = !sfxOn; t.textContent = sfxOn ? 'SFX ON' : 'SFX OFF'; t.setAttribute('aria-pressed', sfxOn); return sfxOn && sfx.sel(); }
    if (q('#toTop')) { sfx.sel(); return scrollTo({ top: 0, behavior: 'smooth' }); }
    if ((el = q('.gal .frame:not(.no-img)'))) { const lb = $('#lb'); $('img', lb).src = $('img', el).src; lb.hidden = false; sfx.sel(); return; }
    if (q('#lb')) { $('#lb').hidden = true; }
  });
  document.addEventListener('mouseover', e => { const t = e.target.closest('button,.btn,.nav a'); if (t && !t.contains(e.relatedTarget) && t.id !== 'start') sfx.hover(); });
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape') $$('.mod:not([hidden])').forEach(close);
    if (e.key === 'Enter' && !started) start();
  });
  document.addEventListener('pointermove', e => {
    if (e.pointerType !== 'mouse') return;
    const el = e.target.closest('.tilt'); $$('.tilt').forEach(x => { if (x !== el) { x.style.setProperty('--rx', '0deg'); x.style.setProperty('--ry', '0deg'); } });
    if (!el) return; const r = el.getBoundingClientRect();
    el.style.setProperty('--ry', (((e.clientX - r.left) / r.width - .5) * 16).toFixed(2) + 'deg');
    el.style.setProperty('--rx', (-((e.clientY - r.top) / r.height - .5) * 16).toFixed(2) + 'deg');
  });

  /* ---- Scroll: progress, reveal 3D, scroll-spy ---- */
  addEventListener('scroll', () => $('#toTop').classList.toggle('show', scrollY > 600));
  addEventListener('scroll', () => $('#prog').style.setProperty('--p', scrollY / Math.max(1, document.documentElement.scrollHeight - innerHeight)), { passive: true });
  const io = new IntersectionObserver(es => es.forEach(e => e.isIntersecting && (e.target.classList.add('in'), io.unobserve(e.target))), { threshold: .12 });
  $$('.rv').forEach(el => io.observe(el));
  const spy = new IntersectionObserver(es => es.forEach(e => e.isIntersecting && $$('.nav a').forEach(a => a.classList.toggle('on', a.dataset.nav === e.target.id))), { rootMargin: '-45% 0px -50% 0px' });
  ['home', 'about', 'join', 'features', 'gallery', 'rules', 'team', 'faq'].forEach(id => spy.observe(document.getElementById(id)));

  const clock = () => { const n = new Date(); $('#clock').textContent = String(n.getHours()).padStart(2, '0') + ':' + String(n.getMinutes()).padStart(2, '0'); };
  tickers(); clock(); setInterval(clock, 1000); status(); setInterval(status, 60000);
  $('#start').focus({ preventScroll: true });
})();
