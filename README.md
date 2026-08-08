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
- **Contact form** — AJAX POST to a form backend, delivered straight to Ali's inbox. Nothing opens,
  no page reload, works identically on mobile. Honeypot field for spam, loading state on the button.

## ⚠️ One setup step: the contact form access key

The form needs a free [Web3Forms](https://web3forms.com) key before it can deliver mail. Until then
it silently falls back to opening the visitor's Gmail/mail app, and the helper text under the button
changes to match — so the page is never broken, just not yet sending directly.

**To turn on direct sending (about two minutes, no account needed):**

1. Go to **https://web3forms.com**
2. Enter **`dr.aliaziz145@gmail.com`** in the "Create Access Key" box and submit.
3. Web3Forms emails that address an access key — a UUID like
   `a1b2c3d4-5678-90ab-cdef-1234567890ab`. Ali must open the email to confirm.
4. In `index.html`, find this line (search for `cf-key`) and replace the placeholder:

   ```html
   <input type="hidden" name="access_key" id="cf-key" value="PASTE-YOUR-WEB3FORMS-ACCESS-KEY-HERE" />
   ```

That's the only edit. The JS reads the key from that input, so there is nothing to change in
`js/main.js`.

### Is the key safe in public HTML?

Yes — Web3Forms access keys are designed to sit in client-side markup. The key only lets a sender
post a message to the one address it was issued for; it exposes no inbox access and no data.

### How it behaves

| Situation | What happens |
|---|---|
| Key set, submit pressed | Button shows a spinner, `fetch` POSTs JSON to `api.web3forms.com/submit`, form clears, green "Message sent" confirmation |
| Backend returns an error | Red message with Ali's address so the visitor can still reach him |
| Network offline | Same red fallback message |
| Key not set yet | Falls back to Gmail compose / `mailto:` |
| JS disabled entirely | The `<form>` still has a real `action` and `method="POST"`, so it submits natively |

The two links under the button — "Write from your own mail app" and "Copy his address" — remain as
manual escape hatches in every case.

**Free tier:** 250 submissions/month. [Formspree](https://formspree.io) is a drop-in alternative if
you'd rather use it — swap the `action` URL and the field names.

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
