/* ==========================================================================
   Muhammad Ali Aziz — Portfolio
   Vanilla JS. No dependencies. Every animation degrades gracefully when
   the visitor has asked for reduced motion.
   ========================================================================== */
(function () {
  'use strict';

  var root = document.documentElement;
  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  var $  = function (sel, ctx) { return (ctx || document).querySelector(sel); };
  var $$ = function (sel, ctx) { return Array.prototype.slice.call((ctx || document).querySelectorAll(sel)); };

  /* ---------------------------------------------------------------- theme */
  (function theme() {
    var btn = $('#themeToggle');
    if (!btn) return;

    var sync = function () {
      var isLight = root.getAttribute('data-theme') === 'light';
      btn.setAttribute('aria-pressed', String(isLight));
      btn.setAttribute('aria-label', isLight ? 'Switch to dark theme' : 'Switch to light theme');
      document.dispatchEvent(new CustomEvent('themechange'));
    };

    btn.addEventListener('click', function () {
      var next = root.getAttribute('data-theme') === 'light' ? 'dark' : 'light';
      root.setAttribute('data-theme', next);
      try { localStorage.setItem('aa-theme', next); } catch (e) { /* private mode */ }
      sync();
    });

    // Follow the OS only while the visitor has not made an explicit choice.
    var mq = window.matchMedia('(prefers-color-scheme: light)');
    var onOS = function (e) {
      var stored = null;
      try { stored = localStorage.getItem('aa-theme'); } catch (err) { /* ignore */ }
      if (stored) return;
      root.setAttribute('data-theme', e.matches ? 'light' : 'dark');
      sync();
    };
    if (mq.addEventListener) mq.addEventListener('change', onOS);
    else if (mq.addListener) mq.addListener(onOS);

    sync();
  })();

  /* -------------------------------------------------- header + scroll bar */
  (function scrollChrome() {
    var header   = $('#siteHeader');
    var progress = $('#scrollProgress span');
    var toTop    = $('#toTop');
    var ticking  = false;

    function update() {
      var y = window.scrollY || window.pageYOffset;
      var max = document.documentElement.scrollHeight - window.innerHeight;

      if (header) header.classList.toggle('stuck', y > 12);
      if (progress) progress.style.width = (max > 0 ? (y / max) * 100 : 0) + '%';
      if (toTop) toTop.classList.toggle('show', y > 600);

      ticking = false;
    }

    window.addEventListener('scroll', function () {
      if (!ticking) { ticking = true; window.requestAnimationFrame(update); }
    }, { passive: true });

    if (toTop) {
      toTop.addEventListener('click', function () {
        window.scrollTo({ top: 0, behavior: reduceMotion ? 'auto' : 'smooth' });
      });
    }

    update();
  })();

  /* ----------------------------------------------------------- mobile nav */
  (function mobileNav() {
    var toggle = $('#navToggle');
    var nav    = $('#nav');
    var scrim  = $('#navScrim');
    if (!toggle || !nav || !scrim) return;

    function setOpen(open) {
      document.body.classList.toggle('nav-open', open);
      nav.classList.toggle('open', open);
      toggle.setAttribute('aria-expanded', String(open));
      toggle.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');

      if (open) {
        scrim.hidden = false;
        window.requestAnimationFrame(function () { scrim.classList.add('show'); });
      } else {
        scrim.classList.remove('show');
        window.setTimeout(function () { scrim.hidden = true; }, 340);
      }
    }

    toggle.addEventListener('click', function () {
      setOpen(!document.body.classList.contains('nav-open'));
    });
    scrim.addEventListener('click', function () { setOpen(false); });
    $$('a', nav).forEach(function (a) { a.addEventListener('click', function () { setOpen(false); }); });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && document.body.classList.contains('nav-open')) setOpen(false);
    });
    // Leaving the mobile breakpoint should never strand the drawer open.
    var desktop = window.matchMedia('(min-width: 881px)');
    var onBreakpoint = function (e) { if (e.matches) setOpen(false); };
    if (desktop.addEventListener) desktop.addEventListener('change', onBreakpoint);
    else if (desktop.addListener) desktop.addListener(onBreakpoint);
  })();

  /* ------------------------------------------------------------ scrollspy */
  (function scrollspy() {
    var links = $$('.nav-list a[href^="#"]');
    if (!links.length) return;

    var map = {};
    var sections = [];
    links.forEach(function (a) {
      var el = document.getElementById(a.getAttribute('href').slice(1));
      if (el) { map[el.id] = a; sections.push(el); }
    });

    var spy = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        links.forEach(function (a) { a.classList.remove('active'); });
        if (map[entry.target.id]) map[entry.target.id].classList.add('active');
      });
    }, { rootMargin: '-45% 0px -50% 0px', threshold: 0 });

    sections.forEach(function (s) { spy.observe(s); });
  })();

  /* --------------------------------------------------- reveal transitions */
  (function reveal() {
    var items = $$('.reveal');
    if (!items.length) return;

    items.forEach(function (el) {
      var d = el.getAttribute('data-delay');
      if (d) el.style.setProperty('--d', d);
    });

    if (reduceMotion || !('IntersectionObserver' in window)) {
      items.forEach(function (el) { el.classList.add('in'); });
      return;
    }

    var io = new IntersectionObserver(function (entries, obs) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        entry.target.classList.add('in');
        obs.unobserve(entry.target);
      });
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0.12 });

    items.forEach(function (el) { io.observe(el); });
  })();

  /* -------------------------------------------------------- count-up nums */
  (function counters() {
    var nums = $$('.count');
    if (!nums.length) return;

    function run(el) {
      var target = parseFloat(el.getAttribute('data-count')) || 0;
      if (reduceMotion) { el.textContent = String(target); return; }

      var dur = 1400;
      var start = null;
      function step(ts) {
        if (start === null) start = ts;
        var p = Math.min((ts - start) / dur, 1);
        var eased = 1 - Math.pow(1 - p, 3);          // easeOutCubic
        el.textContent = String(Math.round(target * eased));
        if (p < 1) window.requestAnimationFrame(step);
      }
      window.requestAnimationFrame(step);
    }

    if (!('IntersectionObserver' in window)) { nums.forEach(run); return; }

    var io = new IntersectionObserver(function (entries, obs) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        run(entry.target);
        obs.unobserve(entry.target);
      });
    }, { threshold: 0.6 });

    nums.forEach(function (el) { io.observe(el); });
  })();

  /* ----------------------------------------------------------- skill bars */
  (function meters() {
    var bars = $$('.meter');
    if (!bars.length) return;

    function fill(el) {
      var v = Math.max(0, Math.min(100, parseFloat(el.getAttribute('data-value')) || 0));
      var track = $('.meter-track', el);
      var bar = $('.meter-fill', el);
      if (track) {
        track.setAttribute('role', 'progressbar');
        track.setAttribute('aria-valuenow', String(v));
        track.setAttribute('aria-valuemin', '0');
        track.setAttribute('aria-valuemax', '100');
      }
      if (bar) bar.style.width = v + '%';
    }

    if (!('IntersectionObserver' in window)) { bars.forEach(fill); return; }

    var io = new IntersectionObserver(function (entries, obs) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        fill(entry.target);
        obs.unobserve(entry.target);
      });
    }, { threshold: 0.35 });

    bars.forEach(function (el) { io.observe(el); });
  })();

  /* ------------------------------------------------------ typing rotator */
  (function typed() {
    var el = $('#typed');
    if (!el) return;

    var lines = [
      'Associate Manager — Quality Assurance (CMO)',
      'Pharm-D · ISO 9001:2015 Lead Auditor',
      'QMS · GMP Audits · CAPA · Risk Management'
    ];

    if (reduceMotion) {
      el.textContent = lines[0];
      var caret = $('.caret');
      if (caret) caret.style.display = 'none';
      return;
    }

    var i = 0, c = 0, deleting = false;

    function tick() {
      var line = lines[i];
      c += deleting ? -1 : 1;
      el.textContent = line.slice(0, c);

      var delay = deleting ? 30 : 58;
      if (!deleting && c === line.length) { deleting = true; delay = 2100; }
      else if (deleting && c === 0) { deleting = false; i = (i + 1) % lines.length; delay = 320; }

      window.setTimeout(tick, delay);
    }
    window.setTimeout(tick, 500);
  })();

  /* ---------------------------------------------- hero molecular network */
  (function heroCanvas() {
    var canvas = $('#heroCanvas');
    if (!canvas || reduceMotion) { if (canvas) canvas.style.display = 'none'; return; }

    var ctx = canvas.getContext('2d');
    if (!ctx) return;

    var dots = [];
    var w = 0, h = 0, dpr = 1;
    var stroke = 'rgba(150,205,255,.5)';
    var raf = null;
    var visible = true;

    function readColour() {
      stroke = (getComputedStyle(root).getPropertyValue('--net') || '').trim() || stroke;
    }

    function resize() {
      var rect = canvas.getBoundingClientRect();
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      w = rect.width; h = rect.height;
      canvas.width = Math.round(w * dpr);
      canvas.height = Math.round(h * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

      // Fewer nodes on small screens — this runs behind text, not in front of it.
      var count = Math.round(Math.min(72, Math.max(20, (w * h) / 17000)));
      dots = [];
      for (var i = 0; i < count; i++) {
        dots.push({
          x: Math.random() * w,
          y: Math.random() * h,
          vx: (Math.random() - 0.5) * 0.28,
          vy: (Math.random() - 0.5) * 0.28,
          r: Math.random() * 1.6 + 0.9
        });
      }
    }

    function draw() {
      ctx.clearRect(0, 0, w, h);
      var link = 132;

      for (var i = 0; i < dots.length; i++) {
        var d = dots[i];
        d.x += d.vx; d.y += d.vy;
        if (d.x < 0 || d.x > w) d.vx *= -1;
        if (d.y < 0 || d.y > h) d.vy *= -1;

        ctx.beginPath();
        ctx.arc(d.x, d.y, d.r, 0, Math.PI * 2);
        ctx.fillStyle = stroke;
        ctx.fill();

        for (var j = i + 1; j < dots.length; j++) {
          var o = dots[j];
          var dx = d.x - o.x, dy = d.y - o.y;
          var dist = Math.sqrt(dx * dx + dy * dy);
          if (dist > link) continue;
          ctx.globalAlpha = (1 - dist / link) * 0.55;
          ctx.beginPath();
          ctx.moveTo(d.x, d.y);
          ctx.lineTo(o.x, o.y);
          ctx.strokeStyle = stroke;
          ctx.lineWidth = 0.7;
          ctx.stroke();
          ctx.globalAlpha = 1;
        }
      }
      raf = window.requestAnimationFrame(draw);
    }

    function start() { if (raf === null) raf = window.requestAnimationFrame(draw); }
    function stop() { if (raf !== null) { window.cancelAnimationFrame(raf); raf = null; } }

    readColour();
    resize();
    start();

    var rt = null;
    window.addEventListener('resize', function () {
      window.clearTimeout(rt);
      rt = window.setTimeout(resize, 180);
    }, { passive: true });

    document.addEventListener('themechange', readColour);
    document.addEventListener('visibilitychange', function () {
      if (document.hidden) stop(); else if (visible) start();
    });

    // Stop burning frames once the hero has scrolled away.
    if ('IntersectionObserver' in window) {
      new IntersectionObserver(function (entries) {
        visible = entries[0].isIntersecting;
        if (visible && !document.hidden) start(); else stop();
      }, { threshold: 0 }).observe(canvas);
    }
  })();

  /* -------------------------------------------- pointer glow + card tilt */
  (function pointerFx() {
    if (reduceMotion || !window.matchMedia('(hover: hover)').matches) return;

    $$('.card, .project').forEach(function (el) {
      el.addEventListener('pointermove', function (e) {
        var r = el.getBoundingClientRect();
        el.style.setProperty('--mx', ((e.clientX - r.left) / r.width) * 100 + '%');
        el.style.setProperty('--my', ((e.clientY - r.top) / r.height) * 100 + '%');
      });
    });

    $$('.tilt').forEach(function (el) {
      el.addEventListener('pointermove', function (e) {
        var r = el.getBoundingClientRect();
        var px = (e.clientX - r.left) / r.width - 0.5;
        var py = (e.clientY - r.top) / r.height - 0.5;
        el.style.transform =
          'perspective(900px) rotateX(' + (-py * 4).toFixed(2) + 'deg) rotateY(' +
          (px * 4).toFixed(2) + 'deg) translateY(-6px)';
      });
      el.addEventListener('pointerleave', function () { el.style.transform = ''; });
    });
  })();

  /* --------------------------------------------------------- contact form */
  (function contactForm() {
    var TO   = 'dr.aliaziz145@gmail.com';
    var form = $('#contactForm');
    var note = $('#formNote');
    if (!form) return;

    function say(text, kind) {
      note.textContent = text;
      note.className = 'form-note' + (kind ? ' ' + kind : '');
    }

    // Validate, then build the subject/body. Returns null when the form is incomplete.
    function collect() {
      var name    = $('#cf-name');
      var email   = $('#cf-email');
      var subject = $('#cf-subject');
      var message = $('#cf-message');
      var ok = true;

      [name, email, message].forEach(function (input) {
        var valid = input.value.trim() !== '' &&
          (input.type !== 'email' || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(input.value.trim()));
        input.parentElement.classList.toggle('invalid', !valid);
        if (!valid) ok = false;
      });

      if (!ok) {
        say('Please add your name, a valid email address and a message.', 'err');
        return null;
      }

      return {
        subject: subject.value.trim() || ('Portfolio enquiry from ' + name.value.trim()),
        body: message.value.trim() +
              '\n\n—\n' + name.value.trim() +
              '\n' + email.value.trim()
      };
    }

    function mailtoUrl(d) {
      return 'mailto:' + TO +
        '?subject=' + encodeURIComponent(d.subject) +
        '&body=' + encodeURIComponent(d.body);
    }

    // Gmail's compose endpoint — sends from the visitor's own signed-in account.
    function gmailUrl(d) {
      return 'https://mail.google.com/mail/?view=cm&fs=1' +
        '&to=' + encodeURIComponent(TO) +
        '&su=' + encodeURIComponent(d.subject) +
        '&body=' + encodeURIComponent(d.body);
    }

    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var d = collect();
      if (!d) return;

      var win = window.open(gmailUrl(d), '_blank', 'noopener,noreferrer');
      if (win) {
        say('Gmail is opening in a new tab — press Send there to deliver it.', 'ok');
      } else {
        // Popup blocked: fall back to whatever mail client the OS has registered.
        window.location.href = mailtoUrl(d);
        say('Pop-up blocked, so we handed the message to your default mail app instead.', 'err');
      }
    });

    var mailAppBtn = $('#useMailApp');
    if (mailAppBtn) {
      mailAppBtn.addEventListener('click', function () {
        var d = collect();
        if (!d) return;
        window.location.href = mailtoUrl(d);
        say('Opening your default mail app…', 'ok');
      });
    }

    var copyBtn = $('#copyEmail');
    if (copyBtn) {
      copyBtn.addEventListener('click', function () {
        var done = function () { say('Copied ' + TO + ' to your clipboard.', 'ok'); };

        if (navigator.clipboard && navigator.clipboard.writeText) {
          navigator.clipboard.writeText(TO).then(done, function () { say(TO, 'ok'); });
          return;
        }
        // execCommand fallback for non-secure origins (opening the file directly).
        var tmp = document.createElement('textarea');
        tmp.value = TO;
        tmp.setAttribute('readonly', '');
        tmp.style.cssText = 'position:fixed;top:-1000px;opacity:0';
        document.body.appendChild(tmp);
        tmp.select();
        try { document.execCommand('copy'); done(); } catch (err) { say(TO, 'ok'); }
        document.body.removeChild(tmp);
      });
    }

    $$('input, textarea', form).forEach(function (input) {
      input.addEventListener('input', function () {
        input.parentElement.classList.remove('invalid');
      });
    });
  })();

  /* ------------------------------------------------------------ footer yr */
  (function year() {
    var el = $('#year');
    if (el) el.textContent = String(new Date().getFullYear());
  })();

})();
