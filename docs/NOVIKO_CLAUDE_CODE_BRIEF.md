# NOVIKO — Website Build Brief (for Claude Code)

Paste the "Starter prompt" at the bottom into Claude Code, and put this file plus `noviko-landing-prototype.html` in the project folder.

---

## 0. Fill these in before building

| Item | Answer |
|---|---|
| Owner name / contact | ___ |
| Domain | ___ (e.g. noviko.com) |
| Store platform | Shopify (recommended) / other: ___ |
| Fulfillment | Print-on-demand (Tapstitch / Printful / other: ___) or in-house |
| Logo file | ___ (SVG preferred) |
| Main character(s) name + short bio | ___ |
| Issue #1 name | ___ (placeholder: "Origin Story") |
| Issue #1 products (name, price, colors, sizes) | ___ |
| Instagram / TikTok handles | ___ |
| Email provider | Klaviyo / Shopify Email / other: ___ |

Anything left blank: use the placeholders in the prototype and flag it in a TODO list.

---

## 1. What Noviko is

Noviko is a streetwear brand built on original comic and cartoon art: graphic tees, hoodies, and more. The site should feel like **opening a comic book**, not browsing a template store. Inspiration for the level of immersion: Hound Archives (houndarchives.com), cinematic and story-driven, but translated into a bright, inked, printed-comic world.

**Core idea:** each drop is an *Issue*. Each product is a *panel* (a page) in that issue's story. Visitors read the issue and shop as they go.

---

## 2. Site map

| Page | Comic name | What it does |
|---|---|---|
| Home | **The Cover** | Big Issue #1 cover with logo, character art, speech balloon, two buttons: "Read Issue #1" and "Shop the tees". |
| Issue picker | **Pick your issue** | Issue #1 open. Issue #2+ shown "still sealed" (polybag look) with a "Notify me" option. |
| Issue page | **Issue #1 reader** | Vertical scroll of comic panels. Caption boxes tell the story; each panel = one product with price + "Add to stash". Ends with "To be continued..." + fan club signup. |
| Shop all | **The longbox** | Plain grid of every product, filterable by issue / type (tee, hoodie, etc). Fast path for people who just want to buy. |
| Product page | **Panel close-up** | Product opens like zooming into a panel: big photos, size picker, size chart, story caption, "Add to stash". |
| Cart | **Your stash** | Slide-out drawer. |
| About | **Origin story** | The founder + the characters, told as a short comic strip. |
| Newsletter | **Fan club** | Email (+ optional SMS) signup, early access to new issues. |
| FAQ / Shipping / Returns / Contact | Normal pages, styled to match. |
| 404 | **Wrong universe** | Character looking lost + link home. |

---

## 3. Design system (from the prototype)

**Colors**
- Ink black `#000000` (all outlines, true black)
- Paper white `#FFFFFF` (panels)
- Ben-Day yellow `#FFE14D` (page background, with magenta halftone dots)
- Magenta `#FF2E88` (primary buttons, accents)
- Cyan `#00B4E6` (secondary, focus rings)
- Night violet `#6B5CE7` (dark panels, "sealed" issues)

**Type**
- Display / logo / buttons: **Dela Gothic One**
- Balloons, captions, body: **Comic Neue** (700 for balloons)
- Speech balloons and caption boxes can be uppercase (that's real comic lettering). Everywhere else: sentence case.

**Visual rules**
- Thick 4px black outlines on panels and buttons, hard offset shadows (no soft blur shadows).
- Logo uses CMYK misregistration (cyan + magenta copies offset behind black).
- Halftone dots, speed lines, and burst shapes are the texture. Use them, don't overload them.
- Panels in a 2-column comic grid on mobile, wide panels span both columns. Vary panel sizes like a real comic page.

**Motion (keep it intentional)**
- One page-load moment: the cover "slams" in.
- Add to stash triggers a sound-effect burst (BAM!, ZAP!, POW!) and the stash counter updates.
- Panels on the issue page can reveal as you scroll (one at a time, like turning pages). No fade-up on every random section.
- Respect `prefers-reduced-motion`.

---

## 4. Tech

- **Shopify custom theme (Online Store 2.0)** built with Shopify CLI, Liquid sections + JSON templates, so the owner can edit products, prices, and text in the Shopify admin without code.
- Issue pages = Shopify collections using a custom `collection.issue` template. Caption text per product = product metafield (`custom.panel_caption`). Issue status (open / sealed) = collection metafield.
- Cart drawer using Shopify AJAX Cart API.
- Email signup wired to the chosen provider (Klaviyo form embed or Shopify customer form).
- Mobile first. Most traffic will come from Instagram/TikTok on phones.
- Performance: compress/convert art to WebP, lazy-load below-the-fold images, Lighthouse mobile score 85+.
- Accessibility: alt text on all art, visible keyboard focus, contrast passes AA, buttons are real buttons.
- SEO: unique title + meta description per page, product schema (JSON-LD), clean URLs, Open Graph images (the issue cover).

---

## 5. Art assets needed

1. Logo (SVG)
2. Issue #1 cover art (main character, portrait, ~1200x1500)
3. One panel illustration per product (scene the tee belongs to)
4. Flat product mockups + on-body photos per product
5. "Sealed" Issue #2 cover (silhouette / teaser)
6. 404 "wrong universe" character pose
7. Burst / sound-effect shapes (can be SVG in code)

Use the owner's own art first. AI-generated art only as placeholders or with his approval.

---

## 6. Rules

- **Original characters only.** No Marvel, DC, anime, or cartoon-studio characters or lookalikes, and no copying another brand's logo/layout. Generic comic language (halftones, balloons, "POW") is fine.
- Buying must stay fast: from any product panel, add to cart in one tap; checkout reachable in two. The story is the hook, it can't block the sale.
- Every placeholder gets listed in `TODO.md`.

---

## 7. Build order

1. Set up Shopify theme project, design tokens, fonts, base layout (header + stash drawer + footer).
2. Home / Cover (match the prototype).
3. Issue picker + Issue reader template.
4. Product page (panel close-up) + cart drawer.
5. Longbox (shop all) + filters.
6. Origin story, fan club, FAQ, shipping, contact, 404.
7. SEO, schema, performance, accessibility pass.
8. Test on real phone sizes (iPhone SE through Pro Max, Android), then push to the live store.

## 8. Done when

- [ ] Home matches the prototype's look and feel on mobile and desktop
- [ ] Issue #1 reads as a scrolling comic and every panel can add to cart
- [ ] Issue #2 shows sealed with a working notify signup
- [ ] Owner can add a new product/issue from Shopify admin without touching code
- [ ] Lighthouse mobile 85+, no console errors
- [ ] TODO.md lists every remaining placeholder

---

## Starter prompt (paste into Claude Code)

```
I'm building a custom Shopify theme for my streetwear brand NOVIKO (comic/cartoon graphic tees).
Read NOVIKO_CLAUDE_CODE_BRIEF.md fully, and open noviko-landing-prototype.html — that's the
approved look for the homepage. I don't code, so explain each step simply and tell me exactly
what to click/run.

Start with step 1 of the build order. Before writing code, list anything you need from me
(store URL, Shopify CLI login, logo files, product info), then walk me through setup.
Build one step at a time and show me before moving on.
```
