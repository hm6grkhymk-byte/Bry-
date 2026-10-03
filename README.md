# NOVIKO: Shopify theme

A custom Shopify Online Store 2.0 theme for **NOVIKO**, streetwear printed from original comic art. Each drop is an *Issue* and each product is a *panel*.

- **Brief:** [`docs/NOVIKO_CLAUDE_CODE_BRIEF.md`](docs/NOVIKO_CLAUDE_CODE_BRIEF.md)
- **How to put it in your store:** [`SETUP.md`](SETUP.md)
- **Open placeholders and questions:** [`TODO.md`](TODO.md)
- **Preview screenshots:** [`docs/previews/`](docs/previews)

## Build progress

| Step | Status |
|---|---|
| 1. Theme setup, design tokens, fonts, header + stash drawer + footer | ✅ Done |
| 2. Home / Cover | 🟡 First version built from the brief. Will be matched to the prototype once it's added. |
| 3. Issue picker + Issue reader | ⬜ |
| 4. Product page (panel close-up) + cart drawer polish | ⬜ (basic product page in place) |
| 5. Longbox (shop all) + filters | ⬜ (basic grid in place) |
| 6. Origin story, fan club, FAQ, shipping, contact, 404 | ⬜ (basic 404 + page template in place) |
| 7. SEO, schema, performance, accessibility | ⬜ |
| 8. Real-device testing, go live | ⬜ |

## For developers

```bash
npm install -g @shopify/cli
shopify theme check          # lint (currently: no offenses)
shopify theme dev --store your-store.myshopify.com
```

- Design tokens live in `assets/base.css` (`:root`). Colors are overridden from theme settings in `snippets/theme-styles.liquid`.
- Fonts (Dela Gothic One, Comic Neue, both SIL Open Font License) are self-hosted in `assets/` for speed.
- The stash drawer (`sections/cart-drawer.liquid`) is re-rendered with the Section Rendering API from `assets/noviko.js`. Any `<form data-stash-form>` that posts to `/cart/add` gets the AJAX add, sound-effect burst and drawer open. Without JS it falls back to the `/cart` page.
- All motion respects `prefers-reduced-motion`.
