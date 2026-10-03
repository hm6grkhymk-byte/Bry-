# Getting the NOVIKO theme into your Shopify store

You don't need to code for this. You have two ways to do it. **Option A is the easiest.**

---

## Option A: Connect GitHub to Shopify (no installs)

Shopify can read the theme straight from this GitHub repository and keeps it in sync every time we push changes.

1. Log in to your Shopify admin (`your-store.myshopify.com/admin`).
2. Go to **Online Store → Themes**.
3. Scroll to **Theme library**, click **Add theme**, then **Connect from GitHub**.
4. If Shopify asks, click **Log in with GitHub** and allow access to the repository **`Bry-`**.
5. Pick the repository **`Bry-`** and the branch **`claude/noviko-shopify-theme-otm8on`**.
6. The theme shows up in your Theme library as **unpublished**, so customers can't see it yet.
7. Click **⋯ → Preview** to look around, or **Customize** to open the theme editor.

> Note: when you change something in the theme editor, Shopify saves it back to GitHub on that branch. That's normal.

**Don't click "Publish"** until we've finished the build and tested it on phones (build step 8).

---

## Option B: Shopify CLI (live preview while editing code)

Only needed if you want to run the preview from your own computer.

1. Install **Node.js** (the "LTS" version) from https://nodejs.org.
2. Open **Terminal** (Mac) or **PowerShell** (Windows) and run:
   ```
   npm install -g @shopify/cli
   ```
3. Download this repository (on GitHub: **Code → Download ZIP**, then unzip it), and in the terminal go into that folder:
   ```
   cd path/to/Bry-
   ```
4. Start the preview (use your real store address):
   ```
   shopify theme dev --store your-store.myshopify.com
   ```
5. It asks you to log in to Shopify in your browser. Then it prints a link like `http://127.0.0.1:9292`. Open it to see the theme with your real products.

---

## After the theme is in your store

In **Online Store → Themes → Customize** (the theme editor):

- **Theme settings (paint-roller icon) → Logo**: upload the NOVIKO logo (SVG or PNG) and favicon.
- **Theme settings → Colors**: the six comic colors. These are already set to the brand palette.
- **Theme settings → Comic effects**: halftone dots on/off, and the sound-effect words (BAM!, ZAP!, POW!…).
- **Theme settings → Social media**: Instagram / TikTok links.
- **Home page → Issue cover**: cover art, speech balloon, caption, title, and the two buttons.
- **Header / Footer**: the announcement bar, menus, and fan club text.

In **Online Store → Navigation**, set up the menus listed in `TODO.md`.

---

## What's in this folder (for reference)

| Folder | What's inside |
|---|---|
| `layout/` | The page frame every page shares (header, main area, footer, stash drawer). |
| `sections/` | The building blocks you can edit in the theme editor (cover, header, footer, stash…). |
| `snippets/` | Small reusable pieces (logo, icons, price, fan club form). |
| `templates/` | Which sections appear on which page type. |
| `assets/` | The styles (`base.css`), the script (`noviko.js`) and the fonts. |
| `config/` | Theme settings (colors, logo, social links). |
| `locales/` | All the button and message wording (e.g. "Add to stash"). |
| `docs/` | The brief and preview screenshots. These aren't uploaded to Shopify. |
