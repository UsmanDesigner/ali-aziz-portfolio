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

  var CONTACT_EMAIL = 'dr.aliaziz145@gmail.com';

  /* ------------------------------------------------------- shared helpers */

  // Small bottom-centre status bubble, used when there is no form note nearby.
  var toast = (function () {
    var el = null, timer = null;
    return function (msg) {
      el = el || $('#toast');
      if (!el) return;
      el.textContent = msg;
      el.classList.add('show');
      window.clearTimeout(timer);
      timer = window.setTimeout(function () { el.classList.remove('show'); }, 4500);
    };
  })();

  // Gmail's compose endpoint — works in any browser, desktop or mobile, and
  // never depends on an OS-registered mail handler.
  function gmailComposeUrl(subject, body) {
    return 'https://mail.google.com/mail/?view=cm&fs=1&to=' + encodeURIComponent(CONTACT_EMAIL) +
      (subject ? '&su=' + encodeURIComponent(subject) : '') +
      (body ? '&body=' + encodeURIComponent(body) : '');
  }

  function mailtoComposeUrl(subject, body) {
    return 'mailto:' + CONTACT_EMAIL +
      (subject ? '?subject=' + encodeURIComponent(subject) : '') +
      (body ? (subject ? '&' : '?') + 'body=' + encodeURIComponent(body) : '');
  }

  function copyText(text, done) {
    function legacy() {
      var tmp = document.createElement('textarea');
      tmp.value = text;
      tmp.setAttribute('readonly', '');
      tmp.style.cssText = 'position:fixed;top:-1000px;opacity:0';
      document.body.appendChild(tmp);
      tmp.select();
      var ok = false;
      try { ok = document.execCommand('copy'); } catch (e) { ok = false; }
      document.body.removeChild(tmp);
      done(ok);
    }

    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(text).then(function () { done(true); }, legacy);
      return;
    }
    legacy();
  }

  /* ------------------------------------------------------- email links */
  // A bare mailto: dead-ends on any machine with no mail client registered —
  // which is most Windows installs, Chromebooks and mobile browsers. Route the
  // address links through Gmail compose instead, and copy as a last resort.
  (function emailLinks() {
    $$('a[href^="mailto:"]').forEach(function (a) {
      a.addEventListener('click', function (e) {
        e.preventDefault();
        var win = window.open(gmailComposeUrl('', ''), '_blank', 'noopener,noreferrer');
        if (win) return;
        copyText(CONTACT_EMAIL, function (ok) {
          toast(ok ? 'Address copied: ' + CONTACT_EMAIL : CONTACT_EMAIL);
        });
      });
    });
  })();

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

  /* ------------------------------------------------ company logo fallback */
  // Each strip tile shows a monogram until a real logo file loads from
  // assets/logos/. The markup asks for .png; if that 404s we try the other
  // common formats before giving up, so the file just has to land in the
  // folder under the right base name — the extension does not matter.
  (function companyLogos() {
    var EXTS = ['.png', '.svg', '.jpg', '.jpeg', '.webp'];

    $$('.co-logo').forEach(function (img) {
      var slot = img.parentNode;
      var base = slot && slot.getAttribute('data-logo');
      var next = 1;                                   // markup already tried EXTS[0]

      function done() {
        if (slot) slot.classList.add('has-logo');
      }
      function fail() {
        if (base && next < EXTS.length) { img.src = base + EXTS[next++]; return; }
        img.remove();                                 // monogram stays visible
      }
      function settle() {
        if (img.naturalWidth) { done(); } else { fail(); }
      }

      if (img.complete) { settle(); return; }
      img.addEventListener('load', done);
      img.addEventListener('error', fail);
    });
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

    var keyField = $('#cf-key');
    var submitBtn = $('#cf-submit');
    var accessKey = keyField ? keyField.value.trim() : '';
    var keyReady  = accessKey && accessKey.indexOf('PASTE-YOUR') !== 0;

    function busy(on) {
      if (!submitBtn) return;
      submitBtn.classList.toggle('loading', on);
      submitBtn.disabled = on;
      var label = $('.btn-label', submitBtn);
      if (label) label.textContent = on ? 'Sending…' : 'Send message';
    }

    // Preferred path: POST to the form backend so the message lands in Ali's
    // inbox directly — no mail app, no compose tab. Works the same on mobile.
    function send(d) {
      busy(true);
      say('Sending…');

      fetch(form.action, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify({
          access_key: accessKey,
          from_name: 'Ali Aziz Portfolio',
          name: $('#cf-name').value.trim(),
          email: $('#cf-email').value.trim(),
          replyto: $('#cf-email').value.trim(),
          subject: d.subject,
          message: d.body
        })
      })
        .then(function (res) { return res.json().catch(function () { return {}; }); })
        .then(function (json) {
          busy(false);
          if (json && json.success) {
            form.reset();
            say('Message sent — Ali will get it in his inbox. Thank you!', 'ok');
          } else {
            say((json && json.message) || 'Could not send just now. Please email dr.aliaziz145@gmail.com directly.', 'err');
          }
        })
        .catch(function () {
          busy(false);
          say('Network problem — please email dr.aliaziz145@gmail.com directly.', 'err');
        });
    }

    // Fallback while no access key is configured: hand off to Gmail / the mail app.
    // Never auto-trigger mailto: here — on a machine with no registered mail
    // client that only produces an OS "choose an app" dialog and a dead end.
    function handOff(d) {
      var win = window.open(gmailComposeUrl(d.subject, d.body), '_blank', 'noopener,noreferrer');
      if (win) {
        say('Gmail is opening in a new tab — press Send there to deliver it.', 'ok');
        return;
      }
      copyText('To: ' + TO + '\nSubject: ' + d.subject + '\n\n' + d.body, function (ok) {
        say(ok
          ? 'Pop-up blocked — your message is copied to the clipboard. Paste it into an email to ' + TO + '.'
          : 'Pop-up blocked. Please email ' + TO + ' directly.', 'err');
      });
    }

    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var d = collect();
      if (!d) return;
      if (keyReady) send(d); else handOff(d);
    });

    // Don't promise direct delivery the page can't do yet.
    if (!keyReady) {
      say('Opens a pre-filled message in your own email app or Gmail.');
    }

    // The only place mailto: is still used — the visitor asked for it by name.
    var mailAppBtn = $('#useMailApp');
    if (mailAppBtn) {
      mailAppBtn.addEventListener('click', function () {
        var d = collect();
        if (!d) return;
        window.location.href = mailtoComposeUrl(d.subject, d.body);
        say('Handing the message to your default mail app…', 'ok');
      });
    }

    var copyBtn = $('#copyEmail');
    if (copyBtn) {
      copyBtn.addEventListener('click', function () {
        copyText(TO, function (ok) {
          say(ok ? 'Copied ' + TO + ' to your clipboard.' : TO, 'ok');
        });
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
