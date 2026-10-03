// Builds a static, clickable preview of the theme with sample data.
//   node build.mjs  ->  out/  (open out/index.html via a local server)
// This approximates Shopify's rendering; the real store is the source of truth.
import { Liquid, Tag, Hash } from 'liquidjs';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { registerShopify } from './filters.mjs';
import * as data from './sample-data.mjs';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const THEME = path.resolve(HERE, '../..');
const OUT = path.join(HERE, 'out');
fs.rmSync(OUT, { recursive: true, force: true });
fs.mkdirSync(path.join(OUT, 'assets'), { recursive: true });
fs.mkdirSync(path.join(OUT, 'art'), { recursive: true });

const read = (p) => fs.readFileSync(path.join(THEME, p), 'utf8');
// liquidjs can't parse Shopify's `?` predicate names.
const prep = (src) => src.replace(/posted_successfully\?/g, 'posted_successfully_q');
const locales = JSON.parse(read('locales/en.default.json'));

/* ---------- Theme settings ---------- */
const settings = {};
for (const g of JSON.parse(read('config/settings_schema.json'))) for (const s of g.settings || []) if ('default' in s) settings[s.id] = s.default;
Object.assign(settings, {
  social_instagram_link: 'https://instagram.com/',
  social_tiktok_link: 'https://tiktok.com/',
  logo: null,
});

/* ---------- Engine ---------- */
const engine = new Liquid({
  root: [path.join(THEME, 'snippets')],
  extname: '.liquid',
  dynamicPartials: true,
  relativeReference: false,
  jsTruthy: false,
  fs: {
    readFileSync: (f) => prep(fs.readFileSync(f, 'utf8')),
    readFile: async (f) => prep(fs.readFileSync(f, 'utf8')),
    existsSync: fs.existsSync,
    exists: async (f) => fs.existsSync(f),
    contains: () => true,
    resolve: (root, file, ext) => path.resolve(root, file.endsWith(ext) ? file : file + ext),
  },
});
registerShopify(engine, { locales, Tag, Hash });

const defaults = (list = []) => Object.fromEntries(list.filter((s) => 'default' in s).map((s) => [s.id, s.default]));
const linklists = {
  'main-menu': { links: [
    { title: 'Issues', url: '/collections' },
    { title: 'Shop all', url: '/collections/all' },
    { title: 'Origin story', url: '/pages/origin-story' },
    { title: 'Fan club', url: '/pages/fan-club' },
  ] },
  footer: { links: [
    { title: 'FAQ', url: '/pages/faq' },
    { title: 'Shipping', url: '/pages/shipping' },
    { title: 'Returns', url: '/pages/returns' },
    { title: 'Contact', url: '/pages/contact' },
  ] },
};

function resolveSetting(value, type) {
  if (type === 'link_list') return linklists[value] || { links: [] };
  if (type === 'url' && typeof value === 'string' && value.startsWith('shopify://')) return '/collections/all';
  return value;
}

async function renderSection(id, cfg, globals) {
  const src = prep(read(`sections/${cfg.type}.liquid`));
  const schema = JSON.parse((src.match(/{% schema %}([\s\S]*?){% endschema %}/) || [, '{}'])[1]);
  const typeOf = Object.fromEntries((schema.settings || []).map((s) => [s.id, s.type]));
  const settingsOut = { ...defaults(schema.settings), ...(cfg.settings || {}) };
  for (const k of Object.keys(settingsOut)) settingsOut[k] = resolveSetting(settingsOut[k], typeOf[k]);
  const blocks = (cfg.block_order || []).map((bid) => {
    const b = cfg.blocks[bid];
    const bs = (schema.blocks || []).find((x) => x.type === b.type) || {};
    const btypes = Object.fromEntries((bs.settings || []).map((s) => [s.id, s.type]));
    const s = { ...defaults(bs.settings), ...b.settings };
    for (const k of Object.keys(s)) s[k] = resolveSetting(s[k], btypes[k]);
    return { id: bid, type: b.type, settings: s, shopify_attributes: '' };
  });
  engine.options.globals = globals;
  const html = await engine.parseAndRender(src, { ...globals, section: { id, settings: settingsOut, blocks } });
  return `<div id="shopify-section-${id}" class="shopify-section ${schema.class || ''}">${html}</div>`;
}

async function renderGroup(name, globals) {
  const g = JSON.parse(read(`sections/${name}.json`));
  let out = '';
  for (const id of g.order) out += await renderSection(id, g.sections[id], globals);
  return out;
}

/* ---------- URL map: Shopify paths -> preview files ---------- */
const urlMap = {
  '/': 'index.html',
  '/collections': 'collections.html',
  '/collections/all': 'longbox.html',
  '/cart': 'cart.html',
  [data.issue1.url]: 'issue-1.html',
  [data.issue2.url]: 'issue-2.html',
};
for (const p of data.products) urlMap[p.url] = `product-${p.handle}.html`;
for (const pg of Object.values(data.pages)) urlMap[`/pages/${pg.handle}`] = `${pg.handle}.html`;

function mapUrl(url) {
  if (/^(https?:|mailto:|#|data:|assets\/|art\/|\/\/)/.test(url)) return url;
  const [pathPart, hash = ''] = url.split('#');
  const clean = pathPart.split('?')[0];
  const file = urlMap[clean] ?? (clean.startsWith('/') ? '404.html' : clean);
  return file + (hash ? `#${hash}` : '');
}

function rewrite(html) {
  return html
    .replace(/(href|data-url)="([^"]*)"/g, (_, attr, url) => `${attr}="${mapUrl(url)}"`)
    .replace(/<\/head>/, '<script src="preview-shim.js"></script></head>');
}

/* ---------- Pages ---------- */
const emptyCart = { item_count: 0, items: [], total_price: 0, currency: { iso_code: 'USD' } };

async function renderPage(file, { template, suffix, layout = 'theme', ...objects }) {
  const pageType = template;
  const globals = {
    settings,
    cart: emptyCart,
    shop: {
      name: 'Noviko',
      description: 'Streetwear printed from original comic art.',
      url: '/',
      enabled_payment_types: ['visa', 'master', 'american_express', 'paypal', 'shopify_pay'],
      password_message: 'Issue #1 drops soon.',
    },
    routes: {
      root_url: '/', cart_url: '/cart', cart_add_url: '/cart/add', cart_change_url: '/cart/change',
      collections_url: '/collections', all_products_collection_url: '/collections/all', search_url: '/search',
    },
    request: { locale: { iso_code: 'en' }, page_type: pageType, design_mode: false, origin: 'https://noviko.example' },
    template: { name: template, suffix },
    canonical_url: 'https://noviko.example/',
    page_title: objects.title || 'Noviko',
    page_description: 'Streetwear printed from original comic art. Every drop is a new issue.',
    content_for_header: '',
    current_page: 1,
    collections: data.collections,
    linklists,
    ...objects,
  };
  const tplName = suffix ? `${template}.${suffix}` : template;
  const tpl = JSON.parse(read(`templates/${tplName}.json`));
  let content = '';
  for (const id of tpl.order) content += await renderSection(id, tpl.sections[id], globals);

  let html;
  if ((tpl.layout || layout) === 'password') {
    html = prep(read('layout/password.liquid')).replace('{{ content_for_layout }}', content);
  } else {
    html = prep(read('layout/theme.liquid'))
      .replace("{% sections 'header-group' %}", await renderGroup('header-group', globals))
      .replace("{% sections 'footer-group' %}", await renderGroup('footer-group', globals))
      .replace("{% section 'cart-drawer' %}", await renderSection('cart-drawer', { type: 'cart-drawer' }, globals))
      .replace('{{ content_for_layout }}', content);
  }
  engine.options.globals = globals;
  const out = rewrite(await engine.parseAndRender(html, globals));
  fs.writeFileSync(path.join(OUT, file), out);
  const missing = out.match(/\[missing [^\]]+\]/g);
  if (missing) console.warn(file, 'missing translations:', [...new Set(missing)]);
}

await renderPage('index.html', { template: 'index', title: 'Noviko' });
await renderPage('collections.html', { template: 'list-collections', title: 'Pick your issue' });
await renderPage('issue-1.html', { template: 'collection', suffix: 'issue', collection: data.issue1, title: 'Issue #1: Origin Story' });
await renderPage('issue-2.html', { template: 'collection', suffix: 'issue', collection: data.issue2, title: 'Issue #2' });
await renderPage('longbox.html', { template: 'collection', collection: data.allProducts, title: 'The longbox' });
for (const p of data.products) {
  await renderPage(`product-${p.handle}.html`, { template: 'product', product: p, title: p.title });
}
for (const pg of Object.values(data.pages)) {
  await renderPage(`${pg.handle}.html`, { template: 'page', suffix: pg.template_suffix || undefined, page: pg, title: pg.title });
}
await renderPage('cart.html', { template: 'cart', title: 'Your stash' });
await renderPage('404.html', { template: '404', title: 'Wrong universe' });
await renderPage('coming-soon.html', { template: 'password', title: 'Coming soon' });

/* ---------- Static files ---------- */
for (const f of fs.readdirSync(path.join(THEME, 'assets'))) fs.copyFileSync(path.join(THEME, 'assets', f), path.join(OUT, 'assets', f));
for (const [p, svg] of Object.entries(data.files)) fs.writeFileSync(path.join(OUT, p), svg);
fs.copyFileSync(path.join(HERE, 'shim.js'), path.join(OUT, 'preview-shim.js'));
fs.copyFileSync(path.join(HERE, 'filters.mjs'), path.join(OUT, 'preview-filters.mjs'));
fs.copyFileSync(path.join(HERE, 'node_modules/liquidjs/dist/liquid.browser.mjs'), path.join(OUT, 'liquid.browser.mjs'));

// What the in-browser cart needs to re-render the stash drawer.
fs.writeFileSync(path.join(OUT, 'preview-data.json'), JSON.stringify({
  locales,
  templates: {
    'cart-drawer': prep(read('sections/cart-drawer.liquid')),
    icon: read('snippets/icon.liquid'),
  },
  urlMap,
  products: data.products.map((p) => ({
    handle: p.handle, title: p.title, type: p.type, url: p.url, price: p.price,
    image: p.featured_media.src,
    variants: p.variants.map((v) => ({ id: v.id, title: v.title, options: v.options, price: v.price, available: v.available, image: v.featured_media ? v.featured_media.src : null })),
    has_only_default_variant: p.has_only_default_variant,
  })),
}));

console.log('Preview built:', fs.readdirSync(OUT).filter((f) => f.endsWith('.html')).length, 'pages ->', OUT);
