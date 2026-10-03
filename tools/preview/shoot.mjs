// Serves out/ locally, screenshots key pages at real phone sizes, and runs the
// main buying flows. Usage: node shoot.mjs   (screenshots -> ../../docs/previews)
import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { chromium } from 'playwright';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const OUT = path.join(HERE, 'out');
const SHOTS = path.resolve(HERE, '../../docs/previews');
fs.mkdirSync(SHOTS, { recursive: true });
const types = { '.html': 'text/html', '.css': 'text/css', '.js': 'text/javascript', '.mjs': 'text/javascript', '.json': 'application/json', '.svg': 'image/svg+xml', '.woff2': 'font/woff2', '.png': 'image/png' };

const server = http.createServer((req, res) => {
  let p = decodeURIComponent(new URL(req.url, 'http://x').pathname);
  if (p === '/') p = '/index.html';
  const file = path.join(OUT, p);
  if (!file.startsWith(OUT) || !fs.existsSync(file)) { res.writeHead(404); res.end(); return; }
  res.writeHead(200, { 'content-type': types[path.extname(file)] || 'application/octet-stream' });
  fs.createReadStream(file).pipe(res);
});
await new Promise((r) => server.listen(8124, r));
const base = 'http://localhost:8124';

const browser = await chromium.launch({ executablePath: process.env.CHROMIUM || '/opt/pw-browsers/chromium' });
const problems = [];
async function open(vp, url, opts = {}) {
  const ctx = await browser.newContext({ viewport: vp, deviceScaleFactor: opts.dpr || 2, isMobile: vp.width < 600, hasTouch: vp.width < 600, reducedMotion: opts.reduced ? 'reduce' : 'no-preference' });
  const page = await ctx.newPage();
  page.on('console', (m) => { if (m.type() === 'error' && !/favicon/.test(JSON.stringify(m.location()))) problems.push(`[${vp.width}] ${url}: ${m.text()} ${JSON.stringify(m.location())}`); });
  page.on('pageerror', (e) => problems.push(`[${vp.width}] ${url}: ${e.message}`));
  page.on('requestfailed', (r) => problems.push(`[${vp.width}] ${url}: failed ${r.url()}`));
  page.on('response', (r) => { if (r.status() >= 400) problems.push(`[${vp.width}] ${url}: ${r.status()} ${r.url()}`); });
  await page.goto(`${base}/${url}`);
  await page.waitForTimeout(opts.wait ?? 1200);
  return page;
}
const scrollAll = async (page) => {
  await page.evaluate(async () => {
    for (let y = 0; y < document.body.scrollHeight; y += 400) { window.scrollTo(0, y); await new Promise((r) => setTimeout(r, 120)); }
    window.scrollTo(0, 0);
  });
  await page.waitForTimeout(500);
};

const SE = { width: 375, height: 667 };
const PROMAX = { width: 430, height: 932 };
const ANDROID = { width: 360, height: 800 };
const DESKTOP = { width: 1440, height: 900 };

// Every page at every size: no errors, no sideways scrolling.
const pages = fs.readdirSync(OUT).filter((f) => f.endsWith('.html'));
for (const vp of [SE, ANDROID, PROMAX, DESKTOP]) {
  for (const f of pages) {
    const page = await open(vp, f, { wait: 300 });
    const overflow = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
    if (overflow > 1) problems.push(`[${vp.width}] ${f}: page scrolls sideways by ${overflow}px`);
    await page.context().close();
  }
}

// Screenshots
const shots = [
  ['index.html', SE, 'home-iphone-se'], ['index.html', PROMAX, 'home-iphone-pro-max'], ['index.html', DESKTOP, 'home-desktop'],
  ['collections.html', SE, 'issues-phone', true], ['collections.html', DESKTOP, 'issues-desktop'],
  ['issue-1.html', SE, 'issue-1-phone', true], ['issue-1.html', DESKTOP, 'issue-1-desktop', true],
  ['issue-2.html', SE, 'issue-2-sealed-phone'],
  ['product-signal-tee.html', SE, 'product-phone', true], ['product-signal-tee.html', DESKTOP, 'product-desktop'],
  ['longbox.html', SE, 'longbox-phone', true], ['longbox.html', DESKTOP, 'longbox-desktop'],
  ['origin-story.html', SE, 'origin-story-phone', true], ['fan-club.html', SE, 'fan-club-phone'],
  ['faq.html', SE, 'faq-phone'], ['404.html', SE, '404-phone'], ['404.html', DESKTOP, '404-desktop'],
];
for (const [f, vp, name, full] of shots) {
  const page = await open(vp, f, { dpr: full || vp.width > 600 ? 1 : 2 });
  if (full) await scrollAll(page);
  await page.screenshot({ path: `${SHOTS}/${name}.png`, fullPage: !!full });
  await page.context().close();
}

// Flow 1: issue panel -> pick size -> add to stash -> burst -> drawer -> +1 -> checkout reachable
{
  const page = await open(SE, 'issue-1.html');
  const panel = page.locator('#Panel-1');
  await panel.scrollIntoViewIfNeeded(); await page.waitForTimeout(600);
  await panel.locator('.chip:has-text("M")').first().click();
  await panel.locator('button[name=add]').click();
  await page.waitForSelector('.sfx-burst', { timeout: 3000 });
  await page.waitForTimeout(1100);
  const open1 = await page.evaluate(() => document.querySelector('[data-stash-drawer]').open);
  const count1 = (await page.textContent('[data-stash-count]')).trim();
  await page.screenshot({ path: `${SHOTS}/flow-issue-add-drawer.png` });
  await page.locator('[data-stash-drawer] .qty__button').nth(1).click();
  await page.waitForTimeout(600);
  const count2 = (await page.textContent('[data-stash-count]')).trim();
  const checkout = await page.locator('[data-stash-drawer] button[name=checkout]').isVisible();
  console.log(`issue flow: drawer open=${open1}, count after add=${count1}, after +1=${count2}, checkout visible=${checkout}`);
  if (!open1 || count1 !== '1' || count2 !== '2' || !checkout) problems.push('issue add-to-stash flow failed');
  // cart persists to another page
  await page.goto(`${base}/longbox.html`); await page.waitForTimeout(900);
  const count3 = (await page.textContent('[data-stash-count]')).trim();
  if (count3 !== '2') problems.push(`stash did not persist across pages (count ${count3})`);
  await page.context().close();
}

// Flow 2: product page variant picker -> sold-out combo -> available combo -> add
{
  const page = await open(SE, 'product-signal-tee.html');
  const chip = (t) => page.locator('.variant-picker label.chip').filter({ hasText: new RegExp(`^\\s*${t}\\s*$`) });
  await chip('White').click();
  await chip('S').click();
  await page.waitForTimeout(200);
  const soldOutText = (await page.textContent('[data-add-button]')).trim();
  const disabled = await page.locator('[data-add-button]').isDisabled();
  await chip('L').click();
  const selected = await page.$eval('select[name=id]', (s) => s.options[s.selectedIndex].text.trim());
  await page.locator('[data-add-button]').click();
  await page.waitForTimeout(1200);
  const count = (await page.textContent('[data-stash-count]')).trim();
  console.log(`product flow: White/S -> "${soldOutText}" disabled=${disabled}; White/L selected="${selected}"; count=${count}`);
  if (!disabled || !/White \/ L/.test(selected) || count !== '1') problems.push('product variant flow failed');
  await page.context().close();
}

// Flow 3: longbox filter by type
{
  const page = await open(SE, 'longbox.html');
  await page.locator('.longbox__drawer > summary').click();
  await page.locator('.filter .chip:has-text("Hoodie")').click();
  await page.waitForTimeout(800);
  const visible = await page.locator('.longbox__grid > li:not([hidden])').count();
  console.log(`longbox filter: Hoodie -> ${visible} visible`);
  if (visible !== 1) problems.push('longbox filter flow failed');
  await page.screenshot({ path: `${SHOTS}/longbox-filtered-phone.png` });
  await page.context().close();
}

// Flow 4: sealed issue notify signup
{
  const page = await open(SE, 'collections.html');
  await page.locator('.notify summary').click();
  await page.fill('.notify input[type=email]', 'fan@example.com');
  await page.locator('.notify button[type=submit]').click();
  await page.waitForTimeout(300);
  const ok = await page.locator('.notify .fan-club-form__success').isVisible();
  console.log(`notify signup success shown=${ok}`);
  if (!ok) problems.push('notify flow failed');
  await page.context().close();
}

// Flow 5: keyboard — stash opens from keyboard, Escape closes, focus returns
{
  const page = await open(SE, 'index.html');
  await page.focus('[data-stash-open]');
  await page.keyboard.press('Enter'); await page.waitForTimeout(400);
  const opened = await page.evaluate(() => document.querySelector('[data-stash-drawer]').open);
  await page.keyboard.press('Escape'); await page.waitForTimeout(300);
  const back = await page.evaluate(() => document.activeElement.matches('[data-stash-open]'));
  console.log(`keyboard: opened=${opened} focusReturned=${back}`);
  if (!opened || !back) problems.push('keyboard stash flow failed');
  await page.context().close();
}

// Reduced motion: everything visible without animation
{
  const page = await open(SE, 'issue-1.html', { reduced: true });
  const hidden = await page.evaluate(() => Array.from(document.querySelectorAll('[data-reveal]')).filter((el) => getComputedStyle(el).opacity !== '1').length);
  console.log(`reduced motion: hidden panels=${hidden}`);
  if (hidden) problems.push('panels hidden under reduced motion');
  await page.context().close();
}

await browser.close();
server.close();
console.log(problems.length ? `PROBLEMS:\n${[...new Set(problems)].join('\n')}` : 'No problems found.');
