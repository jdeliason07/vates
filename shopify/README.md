# Vates storefront — the courage repositioning

Prepared changes for the **live Shopify store** `vates.store`, theme
**"Vates — ritual full-bleed"** (role: `MAIN`).

**Nothing here has been applied to the live theme.** The files are
deployed to an unpublished staging theme; the live storefront is
unchanged. What is left to do is in *Remaining* at the bottom.

| Theme | ID | Role |
|---|---|---|
| `Vates — ritual full-bleed` | `159292948638` | **MAIN** — live, untouched |
| `Vates — courage (staging)` | `159478055070` | unpublished — these files |
| `Vates — pre-courage (rollback 2026-09-14)` | `159478022302` | unpublished — rollback copy |

Every file below is byte-identical between this repo and the staging
theme, verified by MD5 after upload.

> Note: this repository is the separate static storefront on Vercel
> (`loom-one-lime.vercel.app`). The Shopify theme has never been under
> version control, so these files live here as the reviewable source for
> the change.

---

## What the repositioning is

The old homepage argued **product → creator → productivity → purchase**.
It opened with "For the creators of the world.", put a bottle sentence
under it with a word that flipped through eight synonyms, and its
philosophy section framed No.01 as "your ritualistic object — a signal to
your brain that it's time to enter the flow state."

That made Vates read as a productivity brand with a nice bottle.

The new homepage argues **belief → tension → courage → identity →
product → action**:

| | Section | Says |
|---|---|---|
| Belief | `vates-hero` | Everything is possible. / *If you have the courage to act.* |
| Tension | `vates-tension` | The problem is rarely possibility. It's courage. |
| Courage | `vates-courage` | Courage changes everything. + the litany |
| Identity | `vates-faces` | Courage looks different on everyone. |
| Product | `vates-product` | No.01 — the first physical symbol of Vates. |
| Facts | `vates-stats` | 750ml · 1 of 500 · $49 |
| Action | `vates-signup` | Know when the next one opens. |

"For the creators of the world" is **kept**, and moved below a hairline
rule in the hero — the tribe, not the argument.

## The visual identity is unchanged

Same three faces (Fraunces, Inter, IBM Plex Mono), same near-black
ground, same hairline language, same tokens. `vates-home.css` is **not
edited**; `vates-courage.css` is added alongside it and adds the
statement scale the old module layout never needed. Header, footer,
product page, collection, cart, checkout, analytics and SEO metadata are
untouched.

---

## Files

### New

| File | Purpose |
|---|---|
| `assets/vates-courage.css` | The statement scale and the new sections' styles. Companion to `vates-home.css`, loaded after it. |
| `sections/vates-tension.liquid` | The tension. Three text fields and no layout options, so it cannot stop being sparse. |
| `sections/vates-courage.liquid` | Replaces `vates-ritual`. Keeps its measured crop and scroll reveal, drops the flow-state framing. |
| `sections/vates-faces.liquid` | "Courage looks different on everyone." Deliberately underbuilt — a frame for creator stories that do not exist yet. |

### Modified

| File | Change |
|---|---|
| `sections/vates-hero.liquid` | Belief headline + second line + brand block. Rotating-word lede and its script removed. **Carousel and its script unchanged.** |
| `sections/vates-product.liquid` | New copy structure (head + buy column). **Product form, variant id, availability check and rotating cut-out unchanged.** |
| `snippets/vates-assets.liquid` | One added line: loads `vates-courage.css` after `vates-home.css`. Order matters. |
| `templates/index.json` | New section order and settings. |

### Content

| File | Target |
|---|---|
| `content/manifesto.html` | Body HTML for the page `the-manifesto-1`. ~150 words. |

### Untouched but no longer on the homepage

`vates-trust`, `vates-tiles` and `vates-manifesto` still exist as theme
sections and can be re-added from the editor. `vates-ritual.liquid` is
superseded by `vates-courage.liquid` — leave the file in place or delete
it, but remove it from `index.json` either way. Reasons for each are in
the header comment of `templates/index.json`.

`.vt-ritual` and `.vt-flip` in `vates-home.css` become unused once
`vates-ritual` and the hero's rotating word are gone. Left in place
rather than edited out, so `vates-home.css` needs no change at all.

---

## Consistency audit

Asked for: one product name, no stale `No.00`, and no figure that
disagrees with itself anywhere on the store.

### Fixed by these files

- **`No.00` on the manifesto page.** The published manifesto said
  *"No.00 isn't a product. It's a decision, made daily."* This was the
  only surviving `No.00` reference in customer-facing copy. The rewrite
  names the object **No.01**.
- **Price, capacity and batch terms** now read identically in the
  product terms, the spec grid and the hero — `$49`, `750ml`, first
  batch of 500, ships November 7 2026, free shipping.

### Needs a decision — not fixed here

1. **Two prices exist on the store.** The live product `no-01` is
   **$49**. A **draft** duplicate titled "No.01"
   (handle `asset-pack-114825691138-example-product-4`, tagged
   "Sample Product") is **$89** and still carries the old copy:
   *"A ritualistic symbol of who you are… 750ml."* Everything prepared
   here uses **$49**, the live figure. If $89 is the real price, say so
   and it is a one-line change in three places. Either way the draft
   should be deleted — it is a sample product from theme setup and it is
   the last place the "ritualistic" language lives.

2. **This repo's static site says $89 and 32 oz / 950 ml** — in
   `index.html`, its Product structured data, `terms.html` and
   `assets/js/config.js`. Shopify says $49 and 750ml. Two live
   storefronts currently quote different prices and different capacities
   for the same bottle. Worth resolving before either is promoted.

3. **The live `no-01` product description is empty.** The product page
   therefore has no copy at all. `content/` has no product description
   yet because the price question above changes what it should say.

4. **Duplicate manifesto pages.** `the-manifesto` (unpublished) and
   `the-manifesto-1` (published, in the main menu). The unpublished one
   should be deleted so there is one manifesto.

5. **Archived `No.00` product** (`no-00-retired`) — archived and
   unlinked, so it is not a customer-facing problem. Leave it as the
   record, or delete it.

6. **"Why no logo"** — the old manifesto's best paragraph: the mark
   ships separately as decals, because *"a mark you're handed means
   nothing."* That is a real product fact and it is not in the rewrite,
   because a manifesto is not the place for it. It should move to the
   product page or the FAQ rather than be lost.

---

## Navigation

Current main menu: `Home · The Manifesto · Shop · Questions · Contact Us`.

Recommended: drop **Home** (the wordmark already goes home), fix the
trailing space in **"The Manifesto "**, and shorten to
`Shop · Manifesto · Questions · Contact`.

**No `Stories` item yet.** There is no footage, and an empty page is
worse than no page. The `vates-faces` section is where stories land, and
its "coming" slot holds the space until then. Add the nav item when
there is something behind it.

---

## Done

1. ✅ **Rollback copy taken** of the live theme before anything else:
   `Vates — pre-courage (rollback 2026-09-14)`. Publishing that theme
   reverts the storefront completely.
2. ✅ **Files deployed** to `Vates — courage (staging)`, unpublished.
   MD5-verified against this repo.

## Remaining

3. **Preview the staging theme** — Online Store → Themes → *Vates —
   courage (staging)* → Preview. Worth checking specifically:
   - the hero headline at 360px and at 1920px;
   - the courage photograph's type contrast on a phone;
   - that **Pre-order No.01 still adds to cart and reaches checkout**.
4. **The manifesto page is not updated yet, on purpose.** Pages are
   store-wide, not theme-scoped, so editing `the-manifesto-1` would go
   live immediately against the *current* theme. Do it at the same time
   as step 5, from `content/manifesto.html`.
5. **Publish** the staging theme.
6. Then the decisions in the audit above: delete the draft $89 product,
   delete the duplicate manifesto page, fix the menu, write the live
   product description.

### Not carried over to the staging theme

`sections/vates-ritual.liquid` is still present in the staging theme but
no longer referenced by `templates/index.json`. Left in place rather than
deleted, so nothing can break on publish; delete it afterwards if you
want the theme tidy.

`.vt-ritual` and `.vt-flip` in `vates-home.css` are likewise now unused.
`vates-home.css` was not edited at all — that was the point.

### Re-measure if you move the courage photograph

`vates-courage.liquid` puts near-black type directly on the photograph
with **no overlay**, because the type sits in the window light already in
the picture. Measured against `IMG_2245.jpg` the darkest patch under the
glyphs is 7.1:1 at 1920 and 1440, 7.7:1 on a tablet, 7.4:1 on a phone
and 7.7:1 at 360px — all clear of WCAG AA. Change the crop, the copy box
or the photograph and that stops being true.
