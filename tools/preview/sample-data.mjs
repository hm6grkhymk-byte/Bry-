// Sample store data for the preview. Product names, prices and captions are
// placeholders until the owner provides real Issue #1 info (see TODO.md).
import { scenes, covers, garment } from './art.mjs';

export const files = {}; // path -> svg string
let mediaId = 1000;
function image(path, svgString, alt, w, h) {
  files[path] = svgString;
  const img = { id: mediaId++, src: path, alt, width: w, height: h, aspect_ratio: w / h, media_type: 'image' };
  img.preview_image = img;
  return img;
}

const SIZES = ['S', 'M', 'L', 'XL', '2XL'];
let variantId = 40000;

function makeProduct({ handle, title, type, price, compare, kind, color, print, scene, caption, sizes = SIZES, soldOut = [], colors = null, description }) {
  const media = [];
  if (colors) {
    colors.forEach(([name, hex]) => media.push(image(`art/${handle}-${name.toLowerCase()}.svg`, garment(kind, hex, print), `${title} in ${name}`, 800, 1000)));
  } else {
    media.push(image(`art/${handle}.svg`, garment(kind, color, print), `${title}, front`, 800, 1000));
    if (kind !== 'stickers') media.push(image(`art/${handle}-alt.svg`, garment(kind, color, print, '#00B4E6'), `${title}, on cyan`, 800, 1000));
  }
  const panelArt = scene ? image(`art/panel-${scene}.svg`, scenes[scene](), '', 1200, 900) : null;

  let variants;
  let options;
  if (!sizes.length) {
    options = ['Title'];
    variants = [{ title: 'Default Title', options: ['Default Title'] }];
  } else if (colors) {
    options = ['Color', 'Size'];
    variants = colors.flatMap(([name], ci) => sizes.map((s) => ({ title: `${name} / ${s}`, options: [name, s], featured_media: media[ci] })));
  } else {
    options = ['Size'];
    variants = sizes.map((s) => ({ title: s, options: [s] }));
  }
  variants = variants.map((v) => ({
    ...v,
    id: variantId++,
    price,
    compare_at_price: compare || null,
    available: !soldOut.includes(v.title),
    featured_media: v.featured_media || null,
  }));
  const available = variants.some((v) => v.available);
  const first = variants.find((v) => v.available) || variants[0];
  const product = {
    id: variantId++,
    handle,
    title,
    type,
    url: `/products/${handle}`,
    price,
    available,
    description: `<p>${description}</p><ul><li>Placeholder fabric and fit details</li><li>Printed on demand</li></ul>`,
    media,
    featured_media: media[0],
    images: media,
    options,
    has_only_default_variant: !sizes.length,
    variants,
    first_available_variant: first,
    selected_or_first_available_variant: first,
    collections: [],
    metafields: { custom: { panel_caption: { value: caption }, panel_art: { value: panelArt }, size_chart: { value: null } } },
  };
  product.options_with_values = options.map((name, i) => ({
    name,
    position: i + 1,
    values: [...new Set(variants.map((v) => v.options[i]))],
    selected_value: first.options[i],
  }));
  return product;
}

export const products = [
  makeProduct({ handle: 'night-shift-tee', title: 'Night Shift Tee', type: 'Tee', price: 3800, kind: 'tee', color: '#000', print: '#1', scene: 'night-shift',
    caption: 'Midnight. The city was asleep… almost.', description: 'Panel 1 of Issue #1. Heavyweight tee with the Night Shift print.' }),
  makeProduct({ handle: 'rooftop-run-hoodie', title: 'Rooftop Run Hoodie', type: 'Hoodie', price: 6800, kind: 'hoodie', color: '#6B5CE7', print: 'RUN', scene: 'rooftop-run',
    caption: 'Then something moved across the rooftops.', description: 'Panel 2 of Issue #1. Midweight hoodie with the Rooftop Run print.' }),
  makeProduct({ handle: 'first-spark-tee', title: 'First Spark Tee', type: 'Tee', price: 3800, compare: 4400, kind: 'tee', color: '#fff', print: 'ZAP', scene: 'first-spark', soldOut: ['2XL'],
    caption: 'One spark. That’s all it took.', description: 'Panel 3 of Issue #1. The moment it all started.' }),
  makeProduct({ handle: 'city-ink-long-sleeve', title: 'City Ink Long Sleeve', type: 'Long sleeve', price: 4500, kind: 'long', color: '#00B4E6', print: 'INK', scene: 'city-ink',
    caption: 'Rain. Ink. Footprints that didn’t belong to anyone.', description: 'Panel 4 of Issue #1. Long sleeve with the City Ink print.' }),
  makeProduct({ handle: 'signal-tee', title: 'Signal Tee', type: 'Tee', price: 3800, kind: 'tee', print: 'SIG', scene: 'signal', colors: [['Black', '#000'], ['White', '#fff']], soldOut: ['White / S'],
    caption: 'Somewhere across town, a signal answered.', description: 'Panel 5 of Issue #1. Two colorways.' }),
  makeProduct({ handle: 'origin-sticker-pack', title: 'Origin Sticker Pack', type: 'Accessory', price: 800, kind: 'stickers', scene: 'sticker-drop', sizes: [],
    caption: 'Evidence left behind.', description: 'Three die-cut stickers from Issue #1.' }),
];

const filtersFor = (list) => {
  const types = [...new Set(list.map((p) => p.type))];
  const sizes = SIZES;
  return [
    { type: 'list', label: 'Type', param_name: 'filter.p.product_type', active_values: [],
      values: types.map((t) => ({ label: t, value: t, param_name: 'filter.p.product_type', count: list.filter((p) => p.type === t).length, active: false })) },
    { type: 'list', label: 'Size', param_name: 'filter.v.option.size', active_values: [],
      values: sizes.map((s) => ({ label: s, value: s, param_name: 'filter.v.option.size', count: list.filter((p) => p.variants.some((v) => v.options.includes(s) && v.available)).length, active: false })) },
    { type: 'price_range', label: 'Price', min_value: { param_name: 'filter.v.price.gte', value: null }, max_value: { param_name: 'filter.v.price.lte', value: null }, range_max: 6800 },
  ];
};

const sortOptions = [
  { value: 'manual', name: 'Featured' },
  { value: 'price-ascending', name: 'Price, low to high' },
  { value: 'price-descending', name: 'Price, high to low' },
  { value: 'title-ascending', name: 'Alphabetically, A–Z' },
];

export const issue1 = {
  id: 501, handle: 'issue-1-origin-story', title: 'Origin Story', url: '/collections/issue-1-origin-story', template_suffix: 'issue',
  description: '<p>Midnight in a city drawn in ink. Six panels, one spark, and the start of everything. (Placeholder intro: replace with the real Issue #1 opening.)</p>',
  featured_image: image('art/cover-issue-1.svg', covers['issue-1'](), 'Issue #1 cover', 800, 1200),
  products, products_count: products.length,
  metafields: { custom: { issue_number: { value: 1 }, issue_status: { value: 'open' }, issue_teaser: { value: 'Six panels, one spark, and the start of everything.' } } },
  filters: filtersFor(products), sort_options: sortOptions, sort_by: 'manual', default_sort_by: 'manual',
};

export const issue2 = {
  id: 502, handle: 'issue-2', title: 'Issue #2: ???', url: '/collections/issue-2', template_suffix: 'issue',
  description: '', featured_image: image('art/cover-issue-2.svg', covers['issue-2'](), 'Issue #2 teaser silhouette', 800, 1200),
  products: [], products_count: 0,
  metafields: { custom: { issue_number: { value: 2 }, issue_status: { value: 'sealed' }, issue_teaser: { value: 'Something new is coming to the city. Still sealed.' } } },
  filters: [], sort_options: sortOptions, sort_by: 'manual', default_sort_by: 'manual',
};

export const allProducts = {
  id: 500, handle: 'all', title: 'Products', url: '/collections/all', template_suffix: '', description: '',
  featured_image: null, products, products_count: products.length,
  metafields: { custom: {} }, filters: filtersFor(products), sort_options: sortOptions, sort_by: 'manual', default_sort_by: 'manual',
};

products.forEach((p) => { p.collections = [issue1]; });

export const collections = [issue1, issue2];

export const pages = {
  'origin-story': { title: 'Origin story', handle: 'origin-story', content: '', template_suffix: 'origin-story' },
  'fan-club': { title: 'Fan club', handle: 'fan-club', content: '', template_suffix: 'fan-club' },
  faq: { title: 'FAQ', handle: 'faq', content: '<p>Quick answers about fit, shipping and returns. (Placeholder answers below.)</p>', template_suffix: 'faq' },
  contact: { title: 'Contact', handle: 'contact', content: '<p>Questions about an order, a collab or the next issue? Drop us a line.</p>', template_suffix: 'contact' },
  shipping: { title: 'Shipping', handle: 'shipping', content: '<p><strong>Placeholder:</strong> add your shipping times, costs and carriers here.</p>', template_suffix: '' },
  returns: { title: 'Returns', handle: 'returns', content: '<p><strong>Placeholder:</strong> add your return and exchange policy here.</p>', template_suffix: '' },
};
