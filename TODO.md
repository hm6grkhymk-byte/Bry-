# NOVIKO — TODO

Everything below is a placeholder or an open question. Tick items off as they're filled in.

## Needed from the owner

- [ ] **The prototype file** `noviko-landing-prototype.html`. It was not in the project, so the homepage cover was built from the written brief. Once it's added, the cover gets matched to it.
- [ ] **Which Shopify store** this theme is for. (The Shopify account connected to Claude right now is a different store, "Gospelscribe". Nothing was changed there.)
- [ ] Owner name / contact
- [ ] Domain (e.g. noviko.com)
- [ ] Fulfillment: print-on-demand (Tapstitch / Printful / other) or in-house
- [ ] Logo file (SVG preferred) → upload in *Theme settings › Logo*
- [ ] Main character(s): name and short bio
- [ ] Issue #1 name (placeholder: "Origin Story")
- [ ] Issue #1 products: name, price, colors, sizes
- [ ] Instagram / TikTok handles → *Theme settings › Social media*
- [ ] Email provider: Klaviyo / Shopify Email / other

## Placeholder text in the theme (edit in the theme editor)

| Where | Placeholder | Notes |
|---|---|---|
| Announcement bar | "Issue #1 is out now. Read it, wear it." | Header group |
| Home › Issue cover › Speech balloon | "You picked the right comic." | Should be the main character's line |
| Home › Issue cover › Caption box | "Meanwhile, in a city drawn in ink…" | Opening narration of Issue #1 |
| Home › Issue cover › Burst sticker | "First issue!" | |
| Home › Issue cover › Corner box | "No. 1 / Vol. 1" | |
| Home › Issue cover › Issue title | "Origin Story" | Real Issue #1 name |
| Home › Issue cover › Text | "Every drop is a new issue…" | |
| Home › Issue cover › Main button link | empty (goes to /collections for now) | Point to the Issue #1 collection once it exists (step 3) |
| Footer › Fan club text | "Early access to every new issue…" | |
| Footer › About text | "Streetwear printed from original comic art…" | |
| Cart / 404 / newsletter wording | in `locales/en.default.json` | e.g. "Your stash is empty. Every hero needs gear." |

## Placeholder art

- [ ] Issue #1 cover art (portrait, ~1200 × 1500). The cover shows an "Art coming soon" burst until it's uploaded.
- [ ] Panel illustration per product
- [ ] Product mockups + on-body photos
- [ ] Sealed Issue #2 cover (silhouette / teaser)
- [ ] 404 "wrong universe" character pose (the 404 page currently shows a 404 burst only)
- [ ] Default share image (1200 × 630, the issue cover) → *Theme settings › Social sharing*
- [ ] Favicon → *Theme settings › Logo*

## Shopify admin setup (no code)

- [ ] Navigation › **Main menu**: Issues (/collections), Shop all (/collections/all), Origin story, Fan club
- [ ] Navigation › **Footer** menu: FAQ, Shipping, Returns, Contact
- [ ] Create pages: Origin story, Fan club, FAQ, Shipping, Returns, Contact (content comes in step 6)
- [ ] Customer accounts: use Shopify's new customer accounts (no theme templates needed)

## Basic versions to be replaced in later build steps

- [ ] `sections/main-product.liquid`: basic product page. Price doesn't update when switching sizes yet. → **Step 4** (Panel close-up: gallery, size buttons, size chart, story caption)
- [ ] `sections/main-collection.liquid`: basic grid → **Step 3** (Issue reader, `collection.issue` template) and **Step 5** (Longbox with filters)
- [ ] `sections/main-list-collections.liquid`: basic list → **Step 3** (Pick your issue, sealed Issue #2 + notify me)
- [ ] `sections/main-404.liquid`: needs character art → **Step 6**
- [ ] Fan club form saves to Shopify customers (tagged `newsletter, fan-club`). Swap to Klaviyo if chosen → **Step 6**
- [ ] Product JSON-LD schema, full SEO pass, Lighthouse run → **Step 7**
