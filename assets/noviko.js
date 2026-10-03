/*
 * NOVIKO theme script.
 * - Your stash (cart drawer): open/close, add to stash, change quantities.
 * - Sound-effect burst (BAM! ZAP! POW!) when something is added.
 * - Mobile menu: close on Escape / outside click.
 * No libraries. Everything still works without JS: forms post to /cart.
 */
(() => {
  const config = window.Noviko || {};
  const routes = config.routes || {};
  const strings = config.strings || {};
  const SECTION_ID = 'cart-drawer';
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');

  const $ = (selector, root = document) => root.querySelector(selector);
  const $$ = (selector, root = document) => Array.from(root.querySelectorAll(selector));

  /* ---------- Your stash (cart drawer) ---------- */

  const drawer = () => $('[data-stash-drawer]');
  let lastTrigger = null;

  function openStash(trigger) {
    const dialog = drawer();
    if (!dialog || dialog.open) return;
    lastTrigger = trigger || document.activeElement;
    dialog.showModal();
    document.documentElement.classList.add('stash-is-open');
  }

  function closeStash() {
    const dialog = drawer();
    if (!dialog || !dialog.open) return;
    dialog.close();
  }

  function onStashClosed() {
    document.documentElement.classList.remove('stash-is-open');
    if (lastTrigger && document.contains(lastTrigger)) lastTrigger.focus();
  }

  function announce(message) {
    const status = $('[data-stash-status]');
    if (!status) return;
    status.textContent = '';
    window.setTimeout(() => { status.textContent = message; }, 50);
  }

  function updateCount(count) {
    $$('[data-stash-count]').forEach((el) => {
      el.textContent = count;
      el.classList.remove('is-bumped');
      void el.offsetWidth; // restart the bump animation
      el.classList.add('is-bumped');
    });
    const label = count === 1
      ? strings.stashOne
      : (strings.stashOther || '').replace('99999', count);
    $$('[data-stash-count-label]').forEach((el) => { el.textContent = label; });
  }

  // Swap in freshly rendered drawer contents from the Section Rendering API.
  function renderStash(sections) {
    if (!sections || !sections[SECTION_ID]) return;
    const html = new DOMParser().parseFromString(sections[SECTION_ID], 'text/html');
    const fresh = $('[data-stash-contents]', html);
    const current = $('[data-stash-contents]');
    if (!fresh || !current) return;

    // Keep keyboard focus in roughly the same place after re-rendering.
    const buttons = $$('[data-stash-line]', current);
    const focusIndex = buttons.indexOf(document.activeElement);

    current.replaceWith(fresh);

    if (focusIndex > -1) {
      const next = $$('[data-stash-line]', fresh)[focusIndex];
      (next || $('[data-stash-close]') || fresh).focus();
    }
    updateCount(Number(fresh.dataset.itemCount || 0));
  }

  async function postJSON(url, body) {
    const isForm = body instanceof FormData;
    const response = await fetch(url, {
      method: 'POST',
      headers: isForm
        ? { Accept: 'application/json', 'X-Requested-With': 'XMLHttpRequest' }
        : { Accept: 'application/json', 'Content-Type': 'application/json' },
      body: isForm ? body : JSON.stringify(body),
    });
    const data = await response.json().catch(() => ({}));
    if (!response.ok || data.status) {
      throw new Error(data.description || data.message || strings.error);
    }
    return data;
  }

  async function addToStash(form, submitter) {
    const button = submitter || $('[type="submit"]', form);
    const error = $('[data-stash-error]', form);
    if (button.getAttribute('aria-disabled') === 'true') return;

    button.setAttribute('aria-disabled', 'true');
    button.classList.add('is-loading');
    if (error) error.textContent = '';

    const body = new FormData(form);
    body.append('sections', SECTION_ID);
    body.append('sections_url', window.location.pathname);

    try {
      const data = await postJSON(routes.cartAdd, body);
      renderStash(data.sections);
      sfxBurst(button);
      announce((strings.added || '').replace('{{ title }}', data.product_title || ''));
      // Let the burst land before the drawer slides over it.
      window.setTimeout(() => openStash(button), reducedMotion.matches ? 0 : 700);
    } catch (err) {
      if (error) error.textContent = err.message;
      else announce(err.message);
    } finally {
      button.removeAttribute('aria-disabled');
      button.classList.remove('is-loading');
    }
  }

  async function changeLine(button) {
    const contents = $('[data-stash-contents]');
    contents && contents.classList.add('is-updating');
    try {
      const data = await postJSON(routes.cartChange, {
        line: Number(button.dataset.stashLine),
        quantity: Number(button.dataset.stashQuantity),
        sections: [SECTION_ID],
        sections_url: window.location.pathname,
      });
      renderStash(data.sections);
      announce(strings.updated);
    } catch (err) {
      announce(err.message);
    } finally {
      const latest = $('[data-stash-contents]');
      latest && latest.classList.remove('is-updating');
    }
  }

  /* ---------- Sound-effect burst ---------- */

  function starPoints(points, outer, inner) {
    const coords = [];
    for (let i = 0; i < points * 2; i += 1) {
      const radius = i % 2 === 0 ? outer : inner * (0.85 + Math.random() * 0.3);
      const angle = (Math.PI * i) / points - Math.PI / 2;
      coords.push(`${(100 + radius * Math.cos(angle)).toFixed(1)},${(100 + radius * Math.sin(angle)).toFixed(1)}`);
    }
    return coords.join(' ');
  }

  function sfxBurst(anchor) {
    const words = (config.sfx || 'BAM!').split(',').map((w) => w.trim()).filter(Boolean);
    const word = words[Math.floor(Math.random() * words.length)] || 'BAM!';
    const fills = ['var(--yellow)', 'var(--cyan)', 'var(--paper)'];

    const el = document.createElement('div');
    el.className = 'sfx-burst';
    el.setAttribute('aria-hidden', 'true');
    el.style.setProperty('--burst-fill', fills[Math.floor(Math.random() * fills.length)]);
    el.style.setProperty('--burst-tilt', `${Math.round(Math.random() * 24 - 12)}deg`);
    el.innerHTML = `<svg viewBox="0 0 200 200"><polygon points="${starPoints(13, 96, 64)}"/></svg><span></span>`;
    el.querySelector('span').textContent = word;

    const rect = anchor.getBoundingClientRect();
    el.style.left = `${Math.min(Math.max(rect.left + rect.width / 2, 80), window.innerWidth - 80)}px`;
    el.style.top = `${Math.max(rect.top, 80)}px`;

    document.body.appendChild(el);
    el.addEventListener('animationend', () => el.remove(), { once: true });
    window.setTimeout(() => el.remove(), 2000); // safety net
  }

  /* ---------- Issue reader: panels reveal one at a time ---------- */

  function initReveal(root = document) {
    const items = $$('[data-reveal]:not(.is-revealed)', root);
    if (!items.length) return;
    if (reducedMotion.matches || !('IntersectionObserver' in window)) {
      items.forEach((el) => el.classList.add('is-revealed'));
      return;
    }
    const queue = [];
    let timer = null;
    const flush = () => {
      const el = queue.shift();
      if (!el) { timer = null; return; }
      el.classList.add('is-revealed');
      timer = window.setTimeout(flush, 140);
    };
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        observer.unobserve(entry.target);
        queue.push(entry.target);
      });
      if (!timer) flush();
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0.12 });
    items.forEach((el) => {
      observer.observe(el);
      // Keyboard users never land on an invisible panel.
      el.addEventListener('focusin', () => el.classList.add('is-revealed'), { once: true });
    });
  }

  /* ---------- Product page: option chips pick the variant ---------- */

  function initVariantPicker(picker) {
    const data = $('[data-variants]', picker);
    const form = document.getElementById(picker.dataset.form);
    if (!data || !form) return;
    const variants = JSON.parse(data.textContent);
    const select = $('select[name="id"]', form);
    const button = $('[data-add-button]', form);
    const section = picker.closest('[data-product-section]') || document;
    const fieldsets = $$('[data-option-index]', picker);

    const selected = () => fieldsets.map((fs) => {
      const input = $('input:checked', fs);
      return input ? input.value : null;
    });

    function markAvailability(current) {
      fieldsets.forEach((fs, index) => {
        $$('input', fs).forEach((input) => {
          const candidate = current.slice();
          candidate[index] = input.value;
          const match = variants.find((v) => v.options.every((value, i) => value === candidate[i]));
          input.closest('.chip').classList.toggle('chip--unavailable', !match || !match.available);
        });
      });
    }

    function update() {
      const current = selected();
      fieldsets.forEach((fs, index) => {
        const label = $('[data-option-value]', fs);
        if (label) label.textContent = current[index] || '';
      });
      markAvailability(current);

      const variant = variants.find((v) => v.options.every((value, i) => value === current[i]));
      if (!variant) {
        button.disabled = true;
        button.textContent = button.dataset.unavailableText;
        return;
      }
      if (select) select.value = variant.id;
      button.disabled = !variant.available;
      button.textContent = variant.available ? button.dataset.addText : button.dataset.soldOutText;
      const price = $('[data-price]', section);
      if (price && variant.price_html) price.outerHTML = variant.price_html;
      if (picker.dataset.url) {
        const url = new URL(picker.dataset.url, window.location.origin);
        url.searchParams.set('variant', variant.id);
        window.history.replaceState({}, '', url.pathname + url.search);
      }
      if (variant.media_id) {
        const slide = document.getElementById(`Media-${picker.dataset.section}-${variant.media_id}`);
        if (slide) slide.parentElement.scrollTo({ left: slide.offsetLeft, behavior: reducedMotion.matches ? 'auto' : 'smooth' });
      }
    }

    picker.addEventListener('change', update);
    markAvailability(selected());
  }

  /* ---------- Product gallery: thumbnails + active state ---------- */

  function initGallery(gallery) {
    const track = $('[data-gallery-track]', gallery);
    const thumbs = $$('[data-gallery-thumb]', gallery);
    if (!track || !thumbs.length) return;
    thumbs.forEach((thumb) => {
      thumb.addEventListener('click', () => {
        const slide = document.getElementById(thumb.dataset.galleryThumb);
        if (slide) track.scrollTo({ left: slide.offsetLeft, behavior: reducedMotion.matches ? 'auto' : 'smooth' });
      });
    });
    if (!('IntersectionObserver' in window)) return;
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        thumbs.forEach((t) => t.setAttribute('aria-current', String(t.dataset.galleryThumb === entry.target.id)));
      });
    }, { root: track, threshold: 0.6 });
    $$('[data-gallery-slide]', track).forEach((slide) => observer.observe(slide));
  }

  /* ---------- Longbox filters apply as soon as they change ---------- */

  function initFilters(form) {
    let timer = null;
    form.addEventListener('change', () => {
      window.clearTimeout(timer);
      timer = window.setTimeout(() => form.requestSubmit ? form.requestSubmit() : form.submit(), 350);
    });
  }

  /* ---------- Event wiring ---------- */

  document.addEventListener('click', (event) => {
    const opener = event.target.closest('[data-stash-open]');
    if (opener && drawer()) {
      event.preventDefault();
      openStash(opener);
      return;
    }

    if (event.target.closest('[data-stash-close]')) {
      closeStash();
      return;
    }

    const lineButton = event.target.closest('[data-stash-line]');
    if (lineButton) {
      changeLine(lineButton);
      return;
    }

    // Click on the dimmed backdrop (the <dialog> itself, outside the panel) closes the stash.
    const dialog = drawer();
    if (dialog && event.target === dialog) closeStash();

    // Click outside an open mobile menu closes it.
    $$('[data-menu-drawer][open]').forEach((menu) => {
      if (!menu.contains(event.target)) menu.removeAttribute('open');
    });
  });

  document.addEventListener('submit', (event) => {
    const form = event.target.closest('form[data-stash-form]');
    if (!form || !routes.cartAdd) return;
    event.preventDefault();
    addToStash(form, event.submitter);
  });

  document.addEventListener('keydown', (event) => {
    if (event.key !== 'Escape') return;
    $$('[data-menu-drawer][open]').forEach((menu) => {
      menu.removeAttribute('open');
      const summary = $('summary', menu);
      summary && summary.focus();
    });
  });

  document.addEventListener('close', (event) => {
    if (event.target.matches && event.target.matches('[data-stash-drawer]')) onStashClosed();
  }, true);

  // Theme editor: re-open the drawer when it's selected so it can be previewed.
  document.addEventListener('shopify:section:select', (event) => {
    if (event.detail && event.detail.sectionId === SECTION_ID) openStash();
  });

  function init(root = document) {
    initReveal(root);
    $$('[data-variant-picker]', root).forEach(initVariantPicker);
    $$('[data-gallery]', root).forEach(initGallery);
    $$('[data-filter-form]', root).forEach(initFilters);
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', () => init());
  else init();

  // Theme editor: re-run when a section is added or changed.
  document.addEventListener('shopify:section:load', (event) => init(event.target));

  // Expose for other scripts.
  config.stash = { open: openStash, close: closeStash, add: addToStash };
  window.Noviko = config;
})();
