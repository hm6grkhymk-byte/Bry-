// Approximations of Shopify Liquid filters/tags, shared by the Node build and
// the in-browser preview cart. Preview only — not part of the theme.

export function registerShopify(engine, { locales, Tag, Hash }) {
  const money = (c) => `$${(Number(c || 0) / 100).toFixed(2)}`;
  const lookup = (key) => String(key).split('.').reduce((o, k) => (o ? o[k] : undefined), locales);
  const kv = (args) => {
    const o = {};
    for (const a of args) if (Array.isArray(a)) o[a[0]] = a[1];
    return o;
  };
  const esc = (s) => String(s ?? '').replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;');

  engine.registerFilter('t', (key, ...args) => {
    const vars = kv(args);
    let v = lookup(key);
    if (v && typeof v === 'object') v = Number(vars.count) === 1 ? v.one : v.other;
    if (v == null) return `[missing ${key}]`;
    return String(v).replace(/\{\{\s*(\w+)\s*\}\}/g, (_, k) => vars[k] ?? '');
  });
  engine.registerFilter('asset_url', (f) => `assets/${f}`);
  engine.registerFilter('stylesheet_tag', (u) => `<link rel="stylesheet" href="${u}">`);
  engine.registerFilter('preload_tag', (u, ...args) => {
    const o = kv(args);
    return `<link rel="preload" href="${u}" as="${o.as}" type="${o.type || ''}" crossorigin>`;
  });
  engine.registerFilter('image_url', (img) => (img && (img.src || (img.preview_image && img.preview_image.src))) || '');
  engine.registerFilter('image_tag', (src, ...args) => {
    const o = kv(args);
    const attrs = [`src="${src}"`, `alt="${esc(o.alt ?? '')}"`, `loading="${o.loading || 'lazy'}"`];
    if (o.class) attrs.push(`class="${o.class}"`);
    if (o.fetchpriority) attrs.push(`fetchpriority="${o.fetchpriority}"`);
    if (o.sizes) attrs.push(`sizes="${o.sizes}"`);
    attrs.push('decoding="async"');
    return `<img ${attrs.join(' ')}>`;
  });
  engine.registerFilter('placeholder_svg_tag', (_n, cls) => `<svg class="${cls || ''}" viewBox="0 0 100 125" aria-hidden="true"><rect width="100" height="125"/></svg>`);
  engine.registerFilter('money', money);
  engine.registerFilter('money_with_currency', (c) => `${money(c)} USD`);
  engine.registerFilter('money_without_currency', (c) => (Number(c || 0) / 100).toFixed(2));
  engine.registerFilter('handle', (s) => String(s).toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, ''));
  engine.registerFilter('payment_type_svg_tag', (t) => `<svg class="payment-icon" viewBox="0 0 38 24" role="img" aria-label="${t}"><rect width="38" height="24" rx="3" fill="#fff" stroke="#000"/><text x="19" y="15" font-size="7" font-family="Arial" text-anchor="middle">${t}</text></svg>`);
  engine.registerFilter('json', (v) => (v === undefined ? 'null' : JSON.stringify(v, (k, val) => (k === 'collections' || k === 'products' || k === 'preview_image' ? undefined : val))));
  engine.registerFilter('structured_data', (p) => JSON.stringify({ '@context': 'https://schema.org', '@type': 'Product', name: p.title, offers: { '@type': 'Offer', price: (p.price / 100).toFixed(2), priceCurrency: 'USD' } }));
  engine.registerFilter('media_tag', () => '');
  engine.registerFilter('time_tag', (d) => `<time>${d}</time>`);
  engine.registerFilter('default_errors', () => '');
  engine.registerFilter('format_code', (c) => c);

  // {% schema %} is metadata only.
  engine.registerTag('schema', class extends Tag {
    constructor(token, remain, liquid) {
      super(token, remain, liquid);
      while (remain.length) { const t = remain.shift(); if (t.name === 'endschema') break; }
    }
    * render() { return ''; }
  });

  // {% paginate list by N %}: single page in the preview.
  engine.registerTag('paginate', class extends Tag {
    constructor(token, remain, liquid) {
      super(token, remain, liquid);
      this.tpls = [];
      const stream = liquid.parser.parseStream(remain);
      stream.on('tag:endpaginate', () => stream.stop()).on('template', (t) => this.tpls.push(t)).on('end', () => { throw new Error('paginate not closed'); });
      stream.start();
    }
    * render(ctx, emitter) {
      ctx.push({ paginate: { pages: 1, current_offset: 0, current_page: 1 } });
      yield this.liquid.renderer.renderTemplates(this.tpls, ctx, emitter);
      ctx.pop();
    }
  });

  // {% form 'type', [object,] id: x, class: y, data-stash-form: '' %}
  engine.registerTag('form', class extends Tag {
    constructor(token, remain, liquid) {
      super(token, remain, liquid);
      const m = token.args.match(/^\s*'([^']+)'\s*,?\s*(.*)$/s);
      this.ftype = m[1];
      const rest = m[2].replace(/^\s*[a-z_]+\s*,\s*(?=[a-z_-]+:)/, '').replace(/data-stash-form:\s*''/, "data_stash_form: 'y'");
      this.hash = new Hash(rest);
      this.tpls = [];
      const stream = liquid.parser.parseStream(remain);
      stream.on('tag:endform', () => stream.stop()).on('template', (t) => this.tpls.push(t)).on('end', () => { throw new Error('form not closed'); });
      stream.start();
    }
    * render(ctx, emitter) {
      const h = yield this.hash.render(ctx);
      const actions = { product: '/cart/add', customer: '/contact#customer', contact: '/contact', storefront_password: '/password' };
      emitter.write(`<form method="post" action="${actions[this.ftype] || '/'}" data-form-type="${this.ftype}" id="${h.id || ''}" class="${h.class || ''}"${h.data_stash_form ? ' data-stash-form' : ''} accept-charset="UTF-8">`);
      ctx.push({ form: { errors: false, 'posted_successfully?': false, email: '', name: '', body: '' } });
      yield this.liquid.renderer.renderTemplates(this.tpls, ctx, emitter);
      ctx.pop();
      emitter.write('</form>');
    }
  });
}
