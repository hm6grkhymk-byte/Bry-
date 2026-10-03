# NOVIKO: Shopify theme

A custom Shopify Online Store 2.0 theme for **NOVIKO**, streetwear printed from original comic art. Each drop is an *Issue* and each product is a *panel*.

- **Brief:** [`docs/NOVIKO_CLAUDE_CODE_BRIEF.md`](docs/NOVIKO_CLAUDE_CODE_BRIEF.md)
- **Store setup, step by step:** [`SETUP.md`](SETUP.md)
- **Open placeholders and questions:** [`TODO.md`](TODO.md)
- **Screenshots:** [`docs/previews/`](docs/previews)

## Build progress

| Step | Status |
|---|---|
| 1. Theme setup, design tokens, fonts, header + stash drawer + footer | ✅ |
| 2. Home / Cover | ✅ built from the brief (prototype file still to be matched) |
| 3. Pick your issue (sealed issues + notify me) + Issue reader | ✅ |
| 4. Panel close-up (product page) + stash drawer | ✅ |
| 5. Longbox (shop all) + filters + sorting | ✅ |
| 6. Origin story, fan club, FAQ, contact, shipping/returns, 404 | ✅ |
| 7. SEO (titles, Open Graph, product/organization/FAQ JSON-LD), performance, accessibility | ✅ preview Lighthouse mobile: performance 99, accessibility 100, SEO 100 |
| 8. Phone-size testing | ✅ in the preview (375 / 360 / 430 / 1440px); ⬜ on the live store |

## Pages

| Shopify page | Comic name | Files |
|---|---|---|
| Home | The Cover | `sections/cover.liquid` |
| `/collections` | Pick your issue | `sections/main-issue-picker.liquid` |
| Collection, template **issue** | Issue reader | `templates/collection.issue.json`, `sections/main-issue.liquid` |
| `/collections/all` and other collections | The longbox | `sections/main-collection.liquid` |
| Product | Panel close-up | `sections/main-product.liquid` |
| Cart | Your stash (drawer) | `sections/cart-drawer.liquid`, `sections/main-cart.liquid` |
| Page, template **origin-story** | Origin story | `sections/comic-strip.liquid` |
| Page, template **fan-club** | Fan club | `sections/fan-club.liquid` |
| Page, template **faq** / **contact** | FAQ / Contact | `sections/faq.liquid`, `sections/contact-form.liquid` |
| 404 | Wrong universe | `sections/main-404.liquid` |
| Password | Coming soon | `sections/main-password.liquid` |

## Data model (no code needed to add products or issues)

- An **issue** is a collection using the `issue` template, with metafields `custom.issue_number`, `custom.issue_status` (`open`/`sealed`) and `custom.issue_teaser`. Its image is the cover.
- A **panel** is a product in that collection, with metafields `custom.panel_caption` and `custom.panel_art`. Collection sort order = panel order.

## For developers

```bash
shopify theme check                    # lint (no offenses)
shopify theme dev --store your-store.myshopify.com
cd tools/preview && npm install && node build.mjs && node shoot.mjs   # sample-data preview + flow tests
```

- Design tokens: `assets/base.css` (`:root`), colors overridden from theme settings in `snippets/theme-styles.liquid`.
- Fonts (Dela Gothic One, Comic Neue; SIL OFL) are self-hosted in `assets/`.
- `assets/noviko.js` (no dependencies): stash drawer via AJAX Cart API + Section Rendering, sound-effect burst, panel scroll reveal, variant picker, gallery, filter auto-apply. Everything falls back to plain forms without JS, and all motion respects `prefers-reduced-motion`.
- `tools/preview/` renders the theme with liquidjs and sample data. It approximates Shopify; the live store is the source of truth.
