# Muhammad Ali Aziz — Portfolio

A responsive, animated single-page portfolio for **Muhammad Ali Aziz**, Pharm-D — Associate Manager,
Quality Assurance (CMO) with 6+ years in pharmaceutical manufacturing QA.

Static site. No build step, no dependencies. Open `index.html` in a browser, or serve the folder.

```
python -m http.server 8080      # then visit http://localhost:8080
```

## Structure

```
index.html                       markup + inline SVG icon sprite
css/style.css                    design tokens, dual theme, layout, animations
js/main.js                       theme, nav, scroll effects, counters, canvas, form
assets/ali-aziz.jpg              portrait — hero card + header brand mark (200×200)
assets/Muhammad-Ali-Aziz-CV.docx download served by the "Download CV" buttons
```

> The portrait is 200×200, so it is only rendered at 96px (hero) and 38px (header) to stay
> sharp on retina screens. Replace `assets/ali-aziz.jpg` with a larger crop if you want to
> use it bigger anywhere.

## Sections

Hero · Standards marquee · About · Expertise · Experience timeline · Skills · Projects ·
Education, training & certificates · Contact

## Features

- **Dual theme** — dark by default, light toggle, persisted in `localStorage`; follows the OS
  preference until the visitor makes an explicit choice.
- **Animations** — scroll-reveal with stagger, animated stat counters, skill meters, typing rotator,
  canvas molecular-network hero background, aurora blobs, marquee, pointer-glow and tilt on cards,
  scroll-progress bar, animated timeline.
- **Responsive** — breakpoints at 1024 / 880 / 620 / 400px, off-canvas drawer nav on mobile.
- **Accessible** — skip link, focus-visible rings, `aria-pressed` / `aria-expanded` state,
  `role="progressbar"` on skill meters, and full `prefers-reduced-motion` support (canvas and
  typing disabled, transitions collapsed).
- **Print stylesheet** — chrome and decoration stripped so the page prints as a clean CV.
- **Contact form** — validates client-side, then opens a pre-filled **Gmail compose window** in the
  visitor's own account addressed to `dr.aliaziz145@gmail.com`. Falls back to `mailto:` if the
  pop-up is blocked, with manual "use my mail app" and "copy address" options underneath.

## How the contact form sends mail

A static page has no server, so it cannot send email by itself. Submitting opens Gmail's compose
endpoint in a new tab:

```
https://mail.google.com/mail/?view=cm&fs=1&to=…&su=…&body=…
```

The visitor is signed into their own Gmail, the message is pre-filled and addressed to Ali, and
they press **Send**. Mail therefore leaves the visitor's own account — which also means it never
lands in spam and Ali can reply directly.

**If you want true one-click sending** (no compose window), the page needs a form backend. Drop in
a free service and change one line — e.g. [Web3Forms](https://web3forms.com) or
[Formspree](https://formspree.io): set `action` on the `<form>` and remove the submit handler in
`contactForm()`. Both deliver straight to Ali's inbox without the visitor seeing a compose screen.

## Content source

All content comes from the CV `M ALi AZIZ CV - 06-08-26_7014.docx` in this repo. LinkedIn
(`in/ali-aziz-34300a171`) blocks automated fetching (HTTP 999), so nothing was pulled from it —
the profile is linked, not scraped.

**Deliberately omitted from the public page:** CNIC number, date of birth, and street address.
These appear on the CV but are identity-theft vectors on a public URL. Email, phone, city and
LinkedIn are published.

**Note on the skills section:** the percentages in the capability meters are a subjective
self-assessment, labelled as such in the section lede. Adjust the `data-value` attributes in
`index.html` to change them.

## Customising

| What | Where |
|---|---|
| Brand colours | `:root` / `html[data-theme=…]` blocks at the top of `css/style.css` |
| Hero rotating lines | `lines` array in the `typed()` block of `js/main.js` |
| Stat numbers | `data-count` attributes in the `.stats` list |
| Skill values | `data-value` attributes on `.meter` elements |
| Contact address | `mailto:` links in `index.html` and in `contactForm()` in `js/main.js` |

## Deploying

Any static host works — GitHub Pages, Netlify, Vercel, Cloudflare Pages. Push the folder as-is;
there is nothing to compile.
