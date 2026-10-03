# Getting the NOVIKO theme into your Shopify store

You don't need to code for any of this. Work through the parts in order. Each one is just clicking in the Shopify admin.

---

## Part 1: Add the theme to your store (no installs)

Shopify can read the theme straight from this GitHub repository and keeps it in sync every time changes are pushed.

1. Log in to your Shopify admin (`your-store.myshopify.com/admin`).
2. Go to **Online Store → Themes**.
3. Scroll to **Theme library**, click **Add theme**, then **Connect from GitHub**.
4. If Shopify asks, click **Log in with GitHub** and allow access to the repository **`Bry-`**.
5. Pick the repository **`Bry-`** and the branch **`claude/noviko-shopify-theme-otm8on`**.
6. The theme shows up in your Theme library as **unpublished**, so customers can't see it yet.
7. Click **⋯ → Preview** to look around, or **Customize** to open the theme editor.

> When you change something in the theme editor, Shopify saves it back to GitHub on that branch. That's normal.

**Don't click "Publish"** until Parts 2–6 are done and you've checked it on your phone.

---

## Part 2: Create the "custom data" fields (once)

These are the extra boxes that turn products into comic panels and collections into issues.

Go to **Settings → Custom data**.

**Products → Add definition** (do this 3 times):

| Name | Namespace and key | Type |
|---|---|---|
| Panel caption | `custom.panel_caption` | Multi-line text |
| Panel art | `custom.panel_art` | File (images only) |
| Size chart | `custom.size_chart` | Page (optional, only if a product needs its own chart) |

**Collections → Add definition** (do this 3 times):

| Name | Namespace and key | Type |
|---|---|---|
| Issue number | `custom.issue_number` | Integer |
| Issue status | `custom.issue_status` | Single line text → tick **Limit to preset choices** → add `open` and `sealed` |
| Issue teaser | `custom.issue_teaser` | Multi-line text |

Type the namespace and key exactly as shown. The theme looks for those names.

---

## Part 3: Make Issue #1

1. **Products → Add product** for each tee/hoodie. Fill in title, price, photos and sizes as usual.
   At the bottom of each product, under **Metafields**:
   - **Panel caption**: the story line for this panel, e.g. *"Midnight. The city was asleep… almost."*
   - **Panel art**: the comic panel illustration this product belongs to.
2. **Products → Collections → Create collection**:
   - Title: the issue name (e.g. *Origin Story*). Description: the opening narration.
   - **Collection image**: the Issue #1 cover.
   - Add the Issue #1 products. **Sort: Manually** and drag them into story order. That's the panel order.
   - On the right, **Theme template** → choose **issue**.
   - Metafields: **Issue number** `1`, **Issue status** `open`.
3. For **Issue #2**, create another collection the same way with **Issue status** `sealed`, a teaser line, and a silhouette/teaser image. It shows up sealed in a polybag with a **Notify me** button. Signups are saved as customers tagged `notify-<collection-handle>`.

**Adding a new issue later** = repeat step 2. **Adding a new product** = step 1 plus add it to the issue collection. No code either way.

---

## Part 4: Pages and menus

**Online Store → Pages → Add page** for each of these. Pick the **Theme template** on the right:

| Page | Template |
|---|---|
| Origin story | `origin-story` (edit the comic strip panels and characters in the theme editor) |
| Fan club | `fan-club` |
| FAQ | `faq` (edit questions in the theme editor) |
| Contact | `contact` |
| Shipping | default `page` |
| Returns | default `page` |
| Size chart | default `page` (put a table in it, then pick it in the theme editor under *Product page → Default size chart*) |

**Online Store → Navigation**:

- **Main menu**: Issues → `/collections`, Shop all → `/collections/all`, Origin story, Fan club
- **Footer menu**: FAQ, Shipping, Returns, Contact

---

## Part 5: Filters for the longbox (shop all)

Install Shopify's free **Search & Discovery** app, then in **Search & Discovery → Filters** add:
**Product type**, **Size** (variant option), **Price**, and **Availability**. They appear automatically on the shop-all page.

---

## Part 6: Theme editor

**Online Store → Themes → Customize**:

- **Theme settings (paint-roller icon) → Logo**: upload the NOVIKO logo (SVG or PNG) and favicon.
- **Theme settings → Social sharing**: the Issue #1 cover at 1200 × 630, used when the site is shared.
- **Theme settings → Social media**: Instagram / TikTok links.
- **Theme settings → Comic effects**: halftone dots on/off, sound-effect words (BAM!, ZAP!, POW!…).
- **Home page → Issue cover**: cover art, speech balloon, caption, title. The "Read Issue #1" button finds the issue automatically.
- **404 page → Wrong universe**: the "lost character" art.

---

## Option B: Shopify CLI (only for code changes)

1. Install **Node.js** (LTS) from https://nodejs.org.
2. In Terminal: `npm install -g @shopify/cli`
3. In this folder: `shopify theme dev --store your-store.myshopify.com`

## The sample-data preview

`tools/preview/` builds a clickable copy of the theme with sample products, so the design can be checked without a store:

```
cd tools/preview && npm install && node build.mjs && node shoot.mjs
```

It isn't uploaded to Shopify.
