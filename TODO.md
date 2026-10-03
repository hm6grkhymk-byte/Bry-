# NOVIKO — TODO

Everything below is a placeholder or an open question. Tick items off as they're filled in.

## Needed from the owner

- [ ] **The prototype file** `noviko-landing-prototype.html`. It was never added, so the homepage cover was built from the written brief. Once it's added, the cover gets matched to it.
- [ ] **Which Shopify store** this theme is for. (The Shopify account connected to Claude is a different store, "Gospelscribe". Nothing was changed there.)
- [ ] Owner name / contact
- [ ] Domain (e.g. noviko.com)
- [ ] Fulfillment: print-on-demand (Tapstitch / Printful / other) or in-house
- [ ] Logo file (SVG preferred)
- [ ] Main character(s): name and short bio
- [ ] Issue #1 name (placeholder: "Origin Story")
- [ ] Issue #1 products: name, price, colors, sizes
- [ ] Instagram / TikTok handles
- [ ] Email provider: Klaviyo / Shopify Email / other (the theme currently uses Shopify customer signups)

## Placeholder text (edit in the theme editor or admin)

| Where | Placeholder |
|---|---|
| Announcement bar | "Issue #1 is out now. Read it, wear it." |
| Home › Issue cover | balloon "You picked the right comic.", caption "Meanwhile, in a city drawn in ink…", burst "First issue!", corner "No. 1 / Vol. 1", title "Origin Story", text "Every drop is a new issue…" |
| Pick your issue | "The back issues", "Every drop is a new issue of the story…" |
| Issue reader end | "Don't miss the next issue", "Fan club members get early access…" |
| Longbox | "Every panel, every issue" |
| Origin story page | all 4 strip panels + the "Main character" card |
| Fan club page | "Get every issue first" + perks list + "Join free!" |
| FAQ page | all 4 answers are placeholders (fit, shipping times, returns) |
| 404 | "Uh… where am I?", "Meanwhile, in the wrong universe…" |
| Footer | fan club text + "About Noviko" text |
| Button and message wording | `locales/en.default.json` (e.g. "Your stash is empty. Every hero needs gear.") |

## Placeholder art (none of the owner's art is in yet)

- [ ] Issue #1 cover art for the homepage (portrait, ~1200 × 1500). Shows an "Art coming soon" burst until uploaded.
- [ ] Issue #1 cover for the collection image (shown on Pick your issue + issue page)
- [ ] Panel illustration per product (product metafield *Panel art*)
- [ ] Flat mockups + on-body photos per product
- [ ] Sealed Issue #2 silhouette / teaser
- [ ] 404 "wrong universe" character pose
- [ ] Origin story strip art + character art
- [ ] Share image (1200 × 630) and favicon

The preview site uses simple generated placeholder art (garment outlines and comic scenes, stamped "PLACEHOLDER ART"). It's only in `tools/preview/` and is not part of the theme.

## Store setup (see SETUP.md)

- [ ] Custom data definitions (3 product, 3 collection)
- [ ] Issue #1 + Issue #2 collections on the **issue** template
- [ ] Pages: Origin story, Fan club, FAQ, Contact, Shipping, Returns, Size chart
- [ ] Menus: Main menu + Footer
- [ ] Search & Discovery filters (type, size, price, availability)
- [ ] Customer accounts: Shopify's new customer accounts (no theme templates needed)

## Not done / later

- [ ] Optional SMS signup for the fan club (needs Klaviyo or Shopify SMS)
- [ ] Swap the fan club form to Klaviyo if Klaviyo is chosen
- [ ] Real-device test on the live store (the preview was tested at iPhone SE, Android 360px, iPhone Pro Max and desktop sizes in Chromium)
- [ ] Publish the theme (Online Store → Themes → Publish) when the owner signs off
