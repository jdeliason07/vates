# VATES

Single-product storefront for **No. 01** — a one-piece borosilicate glass bottle, $49.

Static site: plain HTML, CSS and JS. No framework, no build step, no dependencies.

## Run it

Open `index.html` directly, or serve the folder:

```sh
python3 -m http.server 8000   # → http://localhost:8000
```

## Layout

```
index.html                     the storefront
thanks.html                    order confirmation — fires the Purchase event
leaderboard.html               what each creator has earned, ranked
shipping.html privacy.html terms.html    the three Stripe asks for
404.html  robots.txt  sitemap.xml  site.webmanifest  favicon.ico
assets/js/config.js            THE ONLY FILE TO EDIT TO GO LIVE
assets/js/track.js             attribution and the ad pixels
assets/fonts/inter-*.woff2     Inter, self-hosted, three weights
assets/fonts/fraunces-*.woff2  Fraunces, self-hosted — the display voice, one variable file
assets/img/og.jpg              the 1200x630 share card
assets/brand/loom-colors.css   the brand color system — imported first, unmodified
assets/css/styles.css          storefront styles
assets/js/app.js               the shop UI, order drawer, cart state, film-to-reel handover
assets/js/leaderboard.js       draws the leaderboard from /api/leaderboard
api/leaderboard.mjs            that endpoint — the one server-side file, holds the Stripe key
assets/brand/vates-*.svg       the wordmark, and the "v" cropped square for the favicon
assets/img/reel/01–32.webp     the archive reel of creators, in Our story
assets/video/intro.mp4/.webm   the film, framed in Our story — plays on a tap
assets/img/hero-poster.jpg     its poster frame
assets/img/no-01-desk.webp/.jpg  the hero photograph — No. 01 on a desk in window light
assets/img/no-01.webp/.jpg     the pair on a workbench — the In hand rail thumb
assets/img/no-01-thumb.webp    the bottle on its own, cut out — the product tiles
```

## Deployment

Hosting is **Vercel, already configured**, so this repo intentionally contains
**no** deployment configuration: no GitHub Actions workflow, no `vercel.json`,
no Pages settings. The single server-side file is `api/leaderboard.mjs`, which
Vercel picks up automatically because it is in `/api`; it needs environment
variables set in the dashboard, but no configuration in the repository and no
build step. The site is served straight from the repository root — there
is nothing to build and no output directory to point at. If Vercel's project
settings ask for a framework preset, it's "Other"; leave the build command
empty and the output directory as the root.

## The design

The storefront is a black shop page in the modern direct-to-consumer idiom —
the shape of a Shopify-era product page, built out of this brand's own parts.
The reference was a phone: an announcement bar rotating one promise at a time,
a sticky masthead with a cart pill, a rail of round category thumbs, a
full-bleed hero, serif collection tabs over a grid of square product tiles with
a badge in one corner and a round **+** in the other, a carousel of white cards,
a signup band with an Email/SMS toggle, a four-column footer, and the wordmark
set enormous and cropped by the bottom of the page.

Everything is drawn in black and white. The wordmark is white — the six bands
it used to be filled with are kept only as accents, and they are the one place
colour appears outside the photographs: the filament between the shop and the
story, the drawer's opening edge, the rule on each carousel card, and the tier
dots on the kit tiles. There is no second palette.

## Page order

1. **The announcement bar** — three standing promises, one at a time.
2. **The masthead** — hamburger, wordmark, two icons, the cart pill. Sticky.
3. **The rail** — six round thumbs that scroll sideways: the collections and
   the sections below.
4. **The hero** — the photograph full-bleed, the tagline and promise over it.
5. **The shop** — three collection tabs over one grid: Best sellers, Bottles,
   The kit. The count under the tabs is read off what is actually showing.
6. **Our story** — the letter from the founders, with the film framed beside
   it. When the film ends, the archive reel takes over its frame.
7. **The Vates Standard** — the four rules, numbered.
8. **In hand** — the specs. Height and weight are dashes until the spec sheet
   fills them.
9. **The carousel** — sourced lines, on white cards.
10. **The closing ask**, **the signup band**, **the footer**, and the wordmark
    across the bottom.

`leaderboard.html` and the legal pages sit outside that order. They wear the
same masthead and footer with the moving parts left out: no cart to open and no
menu to trap focus in, so the wordmark and a Shop pill do the whole job, and
none of them loads `app.js`.

### What the idiom asks for, and what is not faked

Copying a shop page this closely means arriving at slots that this brand cannot
honestly fill. Each one is answered rather than filled:

- **Reviews.** The carousel sits exactly where a shop of this shape puts
  "Real people. Real results." with five stars and a verified-buyer badge. No.
  01 has not shipped to anyone, so there is nothing to quote. The cards carry
  sourced lines from the archive instead, with the source printed on each, and
  the line underneath says plainly that they are not customer reviews. Swap
  them for real, verified ones the day there are some — the card markup takes a
  name, a date and a quote already.
- **Search and account.** A one-product shop has nothing to search and no
  account to sign into. The two masthead icons go to the leaderboard and to
  "Reaching us" on the shipping page.
- **Live chat.** The floating bubble is where a chat widget goes. There is no
  chat here, so it links to the page that says how to reach us.
- **The kit tiles.** No photographs of the notepad, the pen, the Page of
  Inspiration or the letter exist yet. Their tiles carry the wordmark on a
  band-tinted ground — plainly a placeholder — and none of them has a price or
  an add button, because none of them is sold on its own.
- **The signup band.** Email and SMS both switch the field, and neither has
  anywhere to send an address. It says so on submit rather than pretending.

### The rhythm

Every band carries the same padding above and below (`--section-y`), so a
divider always lands centred. One band filament — the six colours as a
hairline — falls between the shop and the story; the rest of the seams are
carried by the ground stepping from black to `--ground-2` and back.

### The collection tabs

One grid, filtered by each tile's `data-collection` list. The count is derived
from what is left showing, so it cannot drift from the grid, and the rule's
thumb slides to the open tab (`--i` and `--n` on `.tabs__track`). Anything else
on the page can select a collection by carrying `data-tab` — the rail and the
menu both do, alongside an `href` to `#shop` so the browser does the scrolling.

### The two panels

The cart drawer and the menu are the same object opening from opposite edges,
over one backdrop, and only one is ever open: opening either closes the other.
Both trap Tab, both close on Escape and on the backdrop, and both hand focus
back to whatever opened them.

## The film and the reel

The film is framed inside **Our story** rather than in front of the site: it
plays on a tap, with its poster showing until then. The moment it
ends, the archive reel — the same 32 stills, `assets/img/reel/01–32.webp` —
takes over the film's own frame and loops, cutting every 2.6 seconds. Replaying
the film puts it back on top; the reel returns at the next `ended`. The reel is
two `<img>` slots taking turns, the next picture decoded before it is faded up,
and it holds its picture when the tab is hidden or the section is off screen.

## The quotes

Thirteen of the reel's pictures carry something the person in them said,
shown under the frame in Our story as each picture comes round. The
quotes are declared in `index.html`, in the `#reel-captions` JSON block, for the
same reason the pictures are named there: changing a quote, or moving one from
one frame to another, is an edit to the markup and not to `app.js`. The key is
the frame's two-digit number, so it is the filename — `08` is
`assets/img/reel/08.webp`.

Every entry carries a `src`: the primary source the quote is taken from — a
letter, a transcript, a dated address. Nothing reads that field. It is there so
that adding a quote means finding its source first, which is the whole of what
keeps the list honest.

It started at thirty and lost seventeen to that rule. "E pur si muove" was not
written down until 124 years after Galileo's trial. "We are what we repeatedly
do" is Will Durant summarising Aristotle, not Aristotle. "God must have loved
the common man" is Lincoln's, not Nimitz's. Five lines put into the mouths of
the men on Suribachi are not recorded as having been said by any of them. A
quote that cannot be sourced does not go under a real person's face.

The value is a *list*, because a frame can hold more than one person: The School
of Athens is Plato and Aristotle, Iwo Jima is six men. A frame with a list takes
the next entry each time it comes round, rather than picking one and dropping
the rest — no frame needs it at present, but the reel is a set of group
photographs and the next sourced quote may well land on one. Nineteen frames
have no entry and show none; the wash goes with them, so there is no shadow
across the bottom of a picture with nothing to read on it.

The quote and the picture turn together — `say()` is called from the same
`then()` that swaps the slots, so a line is never left under the wrong face.

The reel's frame is `aria-hidden`, and the quote box is written to from inside
the same turn. That is deliberate: a line replaced every couple of seconds is
decoration, and announcing each one would make the page unusable with a screen
reader.

The five white cards in the carousel are a separate, hand-written list in
`index.html`. They are not drawn from `#reel-captions` — the carousel is read
at a glance and the reel is watched, so they were chosen for that, and each
card prints its own source.

## Replacing the imagery

**Reel** — drop numbered files at `assets/img/reel/01.webp` … `32.webp`. The
count and the path are declared in `index.html` on `#about-reel`
(`data-frame-count` and `data-frame-src`, where `{n}` stands in for the
two-digit number), so changing how many pictures the reel holds is a
one-attribute edit, not a code change. Add the new frame's quote to
`#reel-captions` under the same number, or leave it out and the frame runs
without one. `HOLD` in `app.js` is how long each one stays — 2.6 seconds — and
the dissolve between them is the transition on `.story__reel img`, which wants
to stay well inside it. Six of the same stills are the rail's round thumbs, by
name in `index.html`.

**Hero photograph** — `no-01-desk.webp`, cropped by `object-fit: cover` and
framed by `object-position`. The picture is nearly square (1179×1086) and the
hero band is much wider than it is tall, so the crop is doing real work and is
set twice: centred on the phone, and at `50% 42%` above 60rem, where the band
is wide enough that anything else loses either the cap or the engraved base.
Any replacement wants both values checked. Swap `no-01-desk.webp` and its
`no-01-desk.jpg` fallback and update the `width`/`height` attributes on the
`<img>`.

**Product tiles** — `no-01-thumb.webp`, the bottle cut out of its background.
The cut-out is what makes the tile: it is dark smoke glass on transparency, so
on a flat near-black tile it all but disappears, and `.card__tile--stage` puts a
lit stage behind it the way a bottle in a shop window gets a lamp. The image is
absolutely positioned inside the tile rather than centred as a grid child — the
tile's height comes from its `aspect-ratio`, which is indefinite to a grid
child, so a percentage height on one is ignored and the 345×1222 bottle lays
itself out at its natural height and is cropped to a band of empty glass. Swap
the file, update the `width`/`height` attributes, and check `PRODUCT.image` in
`assets/js/app.js`, which the drawer thumbnail uses.

## Brand rules encoded here

- `loom-colors.css` is imported globally, once, ahead of `styles.css`, and is
  kept verbatim. Components reference only the semantic aliases
  (`--color-bg`, `--color-text-primary`, …), never the raw `--loom-*` names.
- The page ground is this site's own, not the brand's: `styles.css` re-points
  `--color-bg` to pure black under `[data-theme="dark"]`, and its own tokens
  (`--ground`, `--panel`, `--ink`, …) carry the shop from there. The Void is
  still the Void — the brand file is untouched — this page just does not sit on
  it. The `theme-color` meta on every page, and `site.webmanifest`, track the
  same value.
- The wordmark is artwork, not type: `assets/brand/vates-wordmark.svg`, a
  traced outline. It is always lowercase, and never tracked, stretched or
  italicized.
- It is filled flat white. The artwork was drawn filled with the six colour
  bands the logo is built from (#76b856, #f2ba4b, #e3873d, #cf4743, #8b4192,
  #4698d3); on this ground it is white, and the bands live on only as the
  accents listed above. The bands are still the brand's colours — recolouring
  the mark back is a one-attribute edit on the single `<path>` in each file.
- `vates-mark.svg` — the "v" cropped square, which is the SVG favicon — is
  white too, but through a `<style>` block rather than a `fill` attribute, so
  a `prefers-color-scheme: light` rule can flip it to near-black. A flat white
  mark would otherwise disappear into a light browser tab strip.
- The primary control is white on black — the cart pill, the tile's round
  **+**, Purchase and Checkout are all the same object at four sizes. An
  earlier version ran the six bands across the button; on a black ground the
  white pill is what the idiom expects and what carries the most contrast, so
  the bands moved to where they read as a signature rather than a control: the
  filament between the shop and the story, the drawer's opening edge, the rule
  under each carousel card, and the tier dots on the kit tiles.
- Three voices. Inter carries the product and UI copy; Fraunces (one
  self-hosted latin variable file) speaks the display lines — the collection
  tabs, the section titles, the statement lines; and the system monospace
  carries the small labels the idiom sets in mono: "2 Products", the tier
  under each tile, the footer column heads, the legal row. `.label` is that
  mono voice, and it is no longer uppercase or tracked.
- Corner radii come from `--radius-sm/md/pill` in `styles.css`. The tiles and
  inputs are gently rounded; anything that behaves like a button is a pill.

Dark is the shipped theme, and `<html>` carries `data-theme="dark"` outright.
`loom-colors.css` carries a `[data-theme="light"]` block, but no toggle is wired
up: the wordmark's gradient is tuned for a dark ground and loses contrast on
light. The ground override is scoped to `[data-theme="dark"]` so that block is
left intact if a toggle is ever added. A toggle would also want the shop's own
tokens redefined — they are declared once on `:root` and assume a black ground
throughout.

## Going live

Everything below is set in `assets/js/config.js`. There is no build step and no
secret anywhere in this repository — every identifier involved is public by
design.

**1. The domain.** Set `siteUrl`, then change the same origin in the three
places that cannot read it from JavaScript, because crawlers do not run any:
the `canonical`/`og:*` tags at the top of every page, `sitemap.xml`, and
`robots.txt`. It is `https://vates.store` throughout at the moment.

**2. Stripe.** Create a Payment Link for No. 01 and paste it into
`checkout.paymentLink`. In the link's own settings:

| Setting | Value | Why |
|---|---|---|
| Wallets — Apple Pay, Google Pay, Link | on | This is the whole of the twenty seconds. A returning iPhone buyer double-clicks and never types. |
| Receipts | on | Stripe's receipt **is** the order confirmation. There is no server here to send one. |
| After payment → redirect | `<siteUrl>/thanks.html?session_id={CHECKOUT_SESSION_ID}` | Without it no Purchase conversion is ever reported and the ad platforms have nothing to optimise towards. |
| Adjustable quantity | on | It replaces the stepper that used to sit beside the button. |

Until a link is pasted, Purchase falls back to the demonstration drawer, so an
unconfigured checkout can never present a dead button.

**3. Pixels.** Fill in whichever of `pixels.meta`, `pixels.tiktok` and
`pixels.ga4` you are using. An empty string means that platform's script is
never fetched, so unused pixels cost nothing at all.

**4. The edition line.** `product.edition.total` is 500 and `number` is
`null`, so the bottle section reads "An edition of 500 — numbered by hand" —
true as long as the run really is capped there. Once real inventory exists
(Stripe is the source of truth), set `number` and the line upgrades itself to
"No. 041 of 500" with no other change. Never set it from anything that counts
up on its own: a figure nobody put there on purpose is fabricated scarcity,
and both the FTC and the CMA treat a live-ticking claim of demand as a
deceptive practice, not a growth hack.

**5. The signup band.** The form at the foot of the page has nowhere to send an
address yet — `app.js` shows "The list isn't connected yet" and stops there.
The Email/SMS toggle switches the field's `type`, `autocomplete`, placeholder
and label, and nothing else. Point the `submit` handler at a real endpoint (a
form service such as Formspree or Buttondown, or a small serverless function)
before this ships, and once it collects an address — an email address or a
phone number — say so on the privacy page. SMS marketing also has consent
rules of its own (TCPA in the US); leave that button out rather than collecting
numbers you cannot lawfully text.

## The checkout

Two taps: a tile's **+** (or the closing band's Purchase) opens the drawer, and
the drawer's Checkout leaves for Stripe.
The step in between is not friction for its own sake — it is where "What's in
the box" gets read, which is the last thing anyone wants to know before paying.
From Stripe the buyer lands back on `thanks.html` and is done.

Four events are reported: `view` on load (what the retargeting audiences are
built from), `add` when the drawer opens, `checkout` when the Purchase leaves
for Stripe, and `purchase` on `thanks.html`. Each platform names them
differently; the mapping is one table in `track.js` and callers say "view",
"add", "checkout", "purchase".

`thanks.html` reports the list price of one bottle. There is no server here to
ask Stripe what was actually charged, so a two-bottle order is still reported as
$49 — under-reporting, which is the safe direction, and the true figures are in
Stripe. A webhook into the Conversions API is the fix when the ad spend
justifies it.

## The leaderboard

`leaderboard.html` shows what each creator has earned, ranked, and updates
itself. The line under it points people at the Instagram and TikTok accounts
to ask about joining.

The page fetches `/api/leaderboard` and draws whatever comes back. It holds no
key and never talks to Stripe — everything in `assets/js/` is readable by
anyone who opens view-source, so nothing secret can live there.

### Why there is a function at all

This is otherwise a static site, and the README above says it carries no
deployment configuration. `api/leaderboard.mjs` is the one exception, and it
exists because a Stripe secret key can read every customer's name, address and
email, issue refunds, and change where payouts land. There is no arrangement
in which that key can be shipped to a browser. So it lives in Vercel's
environment, the function reads it server-side, and the browser only ever
receives handles and totals.

No `vercel.json` is needed: anything in `/api` is picked up automatically, and
there is still no build step.

### Configuring it

Set these in **Vercel → Project → Settings → Environment Variables**, then
redeploy. Nothing goes in this repository.

| Variable | Default | |
|---|---|---|
| `STRIPE_SECRET_KEY` | — | Required. Use a **restricted** key with read access to Checkout Sessions and nothing else. |
| `LEADERBOARD_RATE` | `20` | Commission percentage. |
| `LEADERBOARD_MIN` | `1` | Hide creators below this many orders. |

Until `STRIPE_SECRET_KEY` is set the endpoint answers with an empty board and
`ready: false`, sent `no-store`, so the page reads "no sales yet" rather than
breaking and starts working the moment the variable is added — no cache to
wait out.

### What it reads, and what it does not

It reads **Checkout Sessions**, not Charges. `client_reference_id` — the token
`track.js` builds — lives on the session and is not copied onto the
PaymentIntent or the Charge, so the payments list is the wrong end to read it
from. Refunds are deducted (the charge is expanded for `amount_refunded`, so a
refunded order earns nobody a commission) and sessions that completed without
being paid are skipped.

The response carries handles, order counts and totals. No customer name, email
or address is read from Stripe, let alone returned. Stripe's own error text can
name the key, so failures are logged server-side and the caller is told only
that the board is empty.

Responses are cached at Vercel's edge for five minutes, with ten more of
stale-while-revalidate. Without that, every page view would be a round trip to
Stripe and the rate limit would be the ceiling on traffic.

### What the handle is

A label chosen when the link was minted, not a verified account. `?ref=janedoe`
is an arbitrary string; using someone's handle is a convention that makes the
payments list readable. It arrives from a query string a stranger controls, so
the function reduces it to `[a-z0-9-]` and clips it, and the page renders it as
plain text and never links it to a profile that may not be theirs.

## Knowing which creator sold it

Give a creator a link with a tag on it:

```
https://vates.store/?ref=janedoe
https://vates.store/?utm_source=tiktok&utm_medium=paid_social&utm_campaign=launch-aug
```

`ref`, `creator`, `via` and `aff` are all accepted, so whatever a partner
improvises still lands somewhere. `track.js` keeps the **first** touch in
`localStorage` and the last in `sessionStorage`, and only a tagged visit may
write first touch — an untagged return can never overwrite the creator who found
the customer in the first place.

On Purchase, that becomes Stripe's `client_reference_id`:

```
src_tiktok__med_paid-social__cmp_launch-aug__ref_janedoe__t_1787048629
```

which is readable on the payment itself in the Stripe dashboard. That is the
point: the credit is attached to the money, not only to a page view in an
analytics tool, so whoever is paying creators can sort the payments list and
settle up from it directly.

Platform click IDs (`fbclid`, `ttclid`, `gclid` and friends) are captured and
kept too. The pixels do not need them — they match on their own cookies — but a
future server-side Conversions API will.

## Cart behaviour

The drawer is the fallback path only. State lives in memory; the attribution in
`track.js` is the one thing that persists, and clearing browser data removes it.
