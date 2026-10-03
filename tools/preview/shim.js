/*
 * PREVIEW ONLY: stands in for Shopify so the static preview is clickable.
 * - Fakes the AJAX Cart API (/cart/add.js, /cart/change.js, /cart.js) and
 *   re-renders the real cart-drawer.liquid in the browser with liquidjs.
 * - Simulates signups, checkout, and longbox filters/sorting.
 * Not part of the Shopify theme.
 */
(() => {
  const STORE_KEY = 'noviko-preview-cart';
  let memoryCart = [];
  const loadCart = () => {
    try { return JSON.parse(localStorage.getItem(STORE_KEY)) || []; } catch (e) { return memoryCart; }
  };
  const saveCart = (lines) => {
    memoryCart = lines;
    try { localStorage.setItem(STORE_KEY, JSON.stringify(lines)); } catch (e) { /* storage blocked: keep in memory */ }
  };

  let dataPromise = null;
  const getData = () => (dataPromise ||= fetch('preview-data.json').then((r) => r.json()));

  let enginePromise = null;
  async function getEngine() {
    if (enginePromise) return enginePromise;
    enginePromise = (async () => {
      const [{ Liquid, Tag, Hash }, { registerShopify }, data] = await Promise.all([
        import('./liquid.browser.mjs'),
        import('./preview-filters.mjs'),
        getData(),
      ]);
      const engine = new Liquid({ templates: { 'icon.liquid': data.templates.icon }, extname: '.liquid', jsTruthy: false });
      registerShopify(engine, { locales: data.locales, Tag, Hash });
      return { engine, data };
    })();
    return enginePromise;
  }

  function findVariant(data, id) {
    for (const p of data.products) {
      const v = p.variants.find((x) => String(x.id) === String(id));
      if (v) return { product: p, variant: v };
    }
    return null;
  }

  function buildCart(data, lines) {
    const items = lines.map((line) => {
      const hit = findVariant(data, line.id);
      if (!hit) return null;
      return {
        url: data.urlMap[hit.product.url],
        quantity: line.quantity,
        final_line_price: hit.variant.price * line.quantity,
        image: { src: hit.variant.image || hit.product.image },
        product: { title: hit.product.title, has_only_default_variant: hit.product.has_only_default_variant },
        variant: { title: hit.variant.title },
      };
    }).filter(Boolean);
    return {
      items,
      item_count: items.reduce((n, i) => n + i.quantity, 0),
      total_price: items.reduce((n, i) => n + i.final_line_price, 0),
    };
  }

  async function renderDrawer(lines) {
    const { engine, data } = await getEngine();
    const cart = buildCart(data, lines);
    const html = await engine.parseAndRender(data.templates['cart-drawer'], {
      cart,
      routes: { cart_url: 'cart.html', all_products_collection_url: 'longbox.html' },
    });
    return { cart, html: `<div id="shopify-section-cart-drawer" class="shopify-section">${html}</div>` };
  }

  const json = (body, status = 200) => new Response(JSON.stringify(body), { status, headers: { 'Content-Type': 'application/json' } });

  const realFetch = window.fetch.bind(window);
  window.fetch = async (input, init = {}) => {
    const url = typeof input === 'string' ? input : input.url;
    if (/\/cart\/add\.js$/.test(url)) {
      const body = init.body;
      const id = body instanceof FormData ? body.get('id') : JSON.parse(body).id;
      const qty = Number((body instanceof FormData && body.get('quantity')) || 1);
      const data = await getData();
      const hit = findVariant(data, id);
      if (!hit || !hit.variant.available) return json({ status: 422, description: 'That size is sold out.' }, 422);
      const lines = loadCart();
      const line = lines.find((l) => String(l.id) === String(id));
      if (line) line.quantity += qty; else lines.push({ id: Number(id), quantity: qty });
      saveCart(lines);
      const { html } = await renderDrawer(lines);
      await new Promise((r) => setTimeout(r, 250)); // feel like a network call
      return json({ id: Number(id), product_title: hit.product.title, quantity: qty, sections: { 'cart-drawer': html } });
    }
    if (/\/cart\/change\.js$/.test(url)) {
      const { line, quantity } = JSON.parse(init.body);
      const lines = loadCart();
      if (lines[line - 1]) {
        if (quantity <= 0) lines.splice(line - 1, 1); else lines[line - 1].quantity = quantity;
      }
      saveCart(lines);
      const { cart, html } = await renderDrawer(lines);
      return json({ item_count: cart.item_count, total_price: cart.total_price, sections: { 'cart-drawer': html } });
    }
    if (/\/cart\.js$/.test(url)) {
      const { cart } = await renderDrawer(loadCart());
      return json(cart);
    }
    return realFetch(input, init);
  };

  /* ---------- Toast + banner ---------- */
  function toast(message) {
    const el = document.createElement('div');
    el.className = 'preview-toast';
    el.setAttribute('role', 'status');
    el.textContent = message;
    document.body.appendChild(el);
    setTimeout(() => el.remove(), 3200);
  }

  const style = document.createElement('style');
  style.textContent = `
    .preview-banner{position:relative;z-index:60;padding:6px 16px;background:#000;color:#fff;font:700 13px/1.35 'Comic Neue',system-ui,sans-serif;text-align:center}
    .preview-banner a{color:#FFE14D}
    .preview-toast{position:fixed;left:50%;bottom:24px;z-index:3000;transform:translateX(-50%);max-width:min(92vw,28rem);padding:12px 18px;background:#fff;border:4px solid #000;box-shadow:6px 6px 0 #000;font:700 16px/1.35 'Comic Neue',system-ui,sans-serif;text-align:center}
  `;
  document.head.appendChild(style);

  /* ---------- Forms ---------- */
  document.addEventListener('submit', async (event) => {
    const form = event.target;
    const submitter = event.submitter;
    if (form.matches('[data-stash-form]')) return; // theme JS + fake cart handle it

    event.preventDefault();
    const { locales } = await getData();

    if (submitter && submitter.name === 'checkout') {
      toast('Checkout runs on Shopify. In the real store this goes straight to secure checkout.');
      return;
    }
    if (form.dataset.formType === 'customer') {
      form.innerHTML = `<p class="fan-club-form__success caption-box" role="status">${locales.newsletter.success}</p>`;
      return;
    }
    if (form.dataset.formType === 'contact') {
      form.innerHTML = `<p class="caption-box" role="status">${locales.contact.success}</p>`;
      return;
    }
    if (form.matches('[data-filter-form]')) {
      applyFilters(form);
      return;
    }
    toast('This part runs on Shopify. The preview stops here.');
  }, true);

  /* ---------- Longbox filters + sorting (client-side stand-in) ---------- */
  async function applyFilters(form) {
    const data = await getData();
    const fd = new FormData(form);
    const types = fd.getAll('filter.p.product_type');
    const sizes = fd.getAll('filter.v.option.size');
    const min = Number(fd.get('filter.v.price.gte') || 0) * 100;
    const maxRaw = fd.get('filter.v.price.lte');
    const max = maxRaw ? Number(maxRaw) * 100 : Infinity;
    const sort = fd.get('sort_by');
    const grid = document.querySelector('.longbox__grid');
    if (!grid) return;
    const cards = Array.from(grid.children);
    const byFile = Object.fromEntries(data.products.map((p) => [data.urlMap[p.url], p]));
    let shown = 0;
    cards.forEach((li) => {
      const link = li.querySelector('a[href^="product-"]');
      const p = link && byFile[link.getAttribute('href')];
      if (!p) return;
      li.dataset.price = p.price;
      li.dataset.title = p.title;
      const ok = (!types.length || types.includes(p.type))
        && (!sizes.length || p.variants.some((v) => v.available && v.options.some((o) => sizes.includes(o))))
        && p.price >= min && p.price <= max;
      li.hidden = !ok;
      if (ok) shown += 1;
    });
    const order = {
      'price-ascending': (a, b) => a.dataset.price - b.dataset.price,
      'price-descending': (a, b) => b.dataset.price - a.dataset.price,
      'title-ascending': (a, b) => a.dataset.title.localeCompare(b.dataset.title),
    }[sort];
    if (order) cards.sort(order).forEach((li) => grid.appendChild(li));
    const count = document.querySelector('.longbox__count');
    if (count) count.textContent = `${shown} ${shown === 1 ? 'product' : 'products'}`;
  }

  /* ---------- On load: restore the stash, add the banner ---------- */
  document.addEventListener('DOMContentLoaded', async () => {
    const banner = document.createElement('div');
    banner.className = 'preview-banner';
    banner.innerHTML = 'PREVIEW · sample products &amp; placeholder art · cart works, checkout &amp; signups are simulated';
    document.body.prepend(banner);

    const lines = loadCart();
    if (!lines.length) return;
    const { cart, html } = await renderDrawer(lines);
    const fresh = new DOMParser().parseFromString(html, 'text/html').querySelector('[data-stash-contents]');
    const current = document.querySelector('[data-stash-contents]');
    if (fresh && current) current.replaceWith(fresh);
    document.querySelectorAll('[data-stash-count]').forEach((el) => { el.textContent = cart.item_count; });
    const label = (window.Noviko && window.Noviko.strings) || {};
    document.querySelectorAll('[data-stash-count-label]').forEach((el) => {
      el.textContent = cart.item_count === 1 ? label.stashOne : (label.stashOther || '').replace('99999', cart.item_count);
    });
    if (/cart\.html$/.test(location.pathname) && window.Noviko && window.Noviko.stash) window.Noviko.stash.open();
  });
})();
