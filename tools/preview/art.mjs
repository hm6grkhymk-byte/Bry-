// Placeholder art for the preview only: simple inked garments and comic scenes
// (no characters). Every piece is stamped "PLACEHOLDER ART".

const INK = '#000';
const stamp = (w, h) =>
  `<g><rect x="${w - 214}" y="${h - 46}" width="198" height="30" fill="#fff" stroke="${INK}" stroke-width="3"/><text x="${w - 115}" y="${h - 25}" font-family="Arial Black, Arial, sans-serif" font-size="15" text-anchor="middle">PLACEHOLDER ART</text></g>`;

const halftone = (id, color, size = 14, r = 2.4) =>
  `<pattern id="${id}" width="${size}" height="${size}" patternUnits="userSpaceOnUse"><circle cx="${size / 2}" cy="${size / 2}" r="${r}" fill="${color}"/></pattern>`;

function burstPoints(cx, cy, outer, inner, n = 14, jitter = 0.18, seed = 1) {
  let s = seed;
  const rand = () => ((s = (s * 9301 + 49297) % 233280) / 233280);
  const pts = [];
  for (let i = 0; i < n * 2; i += 1) {
    const r = i % 2 === 0 ? outer * (1 - jitter / 2 + rand() * jitter) : inner * (1 - jitter / 2 + rand() * jitter);
    const a = (Math.PI * i) / n - Math.PI / 2;
    pts.push(`${(cx + r * Math.cos(a)).toFixed(1)},${(cy + r * Math.sin(a)).toFixed(1)}`);
  }
  return pts.join(' ');
}

const word = (x, y, text, size, fill, rotate = -8) =>
  `<text x="${x}" y="${y}" transform="rotate(${rotate} ${x} ${y})" font-family="Arial Black, Impact, sans-serif" font-size="${size}" text-anchor="middle" fill="${fill}" stroke="${INK}" stroke-width="${size / 9}" paint-order="stroke" stroke-linejoin="round">${text}</text>`;

const skyline = (y, fill, windows) => {
  const b = [[0, 140], [90, 220], [170, 120], [250, 260], [350, 170], [430, 300], [540, 150], [620, 240], [720, 190], [800, 280], [910, 130], [990, 230], [1080, 170], [1160, 210]];
  let out = '';
  b.forEach(([x, h], i) => {
    const w = (b[i + 1] ? b[i + 1][0] : 1200) - x;
    out += `<rect x="${x}" y="${y - h}" width="${w + 2}" height="${h + 400}" fill="${fill}"/>`;
    if (windows) for (let wy = y - h + 24; wy < y - 20; wy += 34) for (let wx = x + 14; wx < x + w - 20; wx += 30) if ((wx * 7 + wy) % 5 < 2) out += `<rect x="${wx}" y="${wy}" width="12" height="16" fill="${windows}"/>`;
  });
  return out;
};

const svg = (w, h, body, defs = '') =>
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${w} ${h}" width="${w}" height="${h}"><defs>${defs}</defs>${body}${stamp(w, h)}</svg>`;

/* ---------- Comic scenes (panel art) 1200x900 ---------- */
export const scenes = {
  'night-shift': () => svg(1200, 900,
    `<rect width="1200" height="900" fill="#6B5CE7"/><rect width="1200" height="900" fill="url(#d1)"/>
     <circle cx="880" cy="230" r="120" fill="#FFE14D" stroke="${INK}" stroke-width="8"/>
     ${skyline(900, INK, '#FFE14D')}`,
    halftone('d1', 'rgba(255,46,136,.45)', 18, 3)),
  'rooftop-run': () => svg(1200, 900,
    `<rect width="1200" height="900" fill="#00B4E6"/>
     ${Array.from({ length: 22 }, (_, i) => `<line x1="1250" y1="${i * 44}" x2="${200 + (i % 4) * 90}" y2="${i * 44 + 20}" stroke="#fff" stroke-width="${6 + (i % 3) * 4}"/>`).join('')}
     <path d="M0 640 L380 600 L380 900 L0 900 Z M420 660 L820 620 L820 900 L420 900 Z M860 590 L1200 560 L1200 900 L860 900 Z" fill="${INK}"/>
     ${word(560, 360, 'WHOOSH!', 170, '#FF2E88', -10)}`),
  'first-spark': () => svg(1200, 900,
    `<rect width="1200" height="900" fill="${INK}"/>
     <polygon points="${burstPoints(600, 450, 420, 230, 16, 0.3, 3)}" fill="#FFE14D" stroke="#fff" stroke-width="10"/>
     <polygon points="${burstPoints(600, 450, 260, 150, 12, 0.3, 7)}" fill="#FF2E88" stroke="${INK}" stroke-width="10"/>
     ${word(600, 510, 'ZAP!', 190, '#fff', -6)}`),
  'city-ink': () => svg(1200, 900,
    `<rect width="1200" height="900" fill="#FFE14D"/><rect width="1200" height="900" fill="url(#d2)"/>
     ${Array.from({ length: 40 }, (_, i) => `<line x1="${(i * 61) % 1200}" y1="${(i * 97) % 700}" x2="${(i * 61) % 1200 - 50}" y2="${(i * 97) % 700 + 120}" stroke="${INK}" stroke-width="4"/>`).join('')}
     <polygon points="560,260 760,260 1000,900 320,900" fill="rgba(255,255,255,.75)"/>
     <rect x="640" y="250" width="40" height="650" fill="${INK}"/><rect x="590" y="200" width="140" height="70" fill="${INK}"/>
     ${word(300, 260, 'DRIP', 120, '#00B4E6', -12)}`,
    halftone('d2', 'rgba(255,46,136,.5)', 16, 2.6)),
  'signal': () => svg(1200, 900,
    `<rect width="1200" height="900" fill="#FF2E88"/>
     ${[520, 420, 320, 220, 120].map((r) => `<circle cx="600" cy="330" r="${r}" fill="none" stroke="${INK}" stroke-width="10"/>`).join('')}
     <path d="M560 330 L640 330 L700 900 L500 900 Z" fill="${INK}"/><circle cx="600" cy="320" r="40" fill="#FFE14D" stroke="${INK}" stroke-width="8"/>
     ${word(900, 760, 'BZZT', 120, '#FFE14D', 8)}`),
  'sticker-drop': () => svg(1200, 900,
    `<rect width="1200" height="900" fill="#fff"/><rect width="1200" height="900" fill="url(#d3)"/>
     ${[[300, 300, 'POW', '#FFE14D', 1], [850, 260, 'BAM', '#00B4E6', 2], [600, 620, 'WHAM', '#FF2E88', 5]].map(([x, y, t, c, s]) => `<polygon points="${burstPoints(x, y, 210, 130, 13, 0.3, s)}" fill="${c}" stroke="${INK}" stroke-width="10"/>${word(x, y + 30, t, 90, '#fff', -8)}`).join('')}`,
    halftone('d3', 'rgba(0,180,230,.4)', 16, 2.6)),
};

/* ---------- Issue covers 800x1200 ---------- */
export const covers = {
  'issue-1': () => svg(800, 1200,
    `<rect width="800" height="1200" fill="#fff"/>
     ${Array.from({ length: 36 }, (_, i) => { const a = (i / 36) * Math.PI * 2; return `<polygon points="400,640 ${400 + Math.cos(a) * 1200},${640 + Math.sin(a) * 1200} ${400 + Math.cos(a + 0.09) * 1200},${640 + Math.sin(a + 0.09) * 1200}" fill="#bfe9f7"/>`; }).join('')}
     <rect x="0" y="0" width="800" height="200" fill="#FFE14D" stroke="${INK}" stroke-width="10"/>
     <text x="400" y="140" font-family="Arial Black, Impact, sans-serif" font-size="120" text-anchor="middle" fill="${INK}" stroke="#FF2E88" stroke-width="3">NOVIKO</text>
     ${word(400, 760, '#1', 340, '#FF2E88', -6)}
     <g transform="translate(-200 300) scale(1)">${skyline(900, INK, '#FFE14D')}</g>`),
  'issue-2': () => svg(800, 1200,
    `<rect width="800" height="1200" fill="#3a2f8f"/>
     <g transform="translate(-200 300)">${skyline(900, INK, '#6B5CE7')}</g>
     <text x="400" y="640" font-family="Arial Black, Impact, sans-serif" font-size="420" text-anchor="middle" fill="rgba(255,255,255,.18)">?</text>`),
};

/* ---------- Garment mockups 800x1000 ---------- */
const TEE = 'M250 150 L340 110 Q400 160 460 110 L550 150 L700 270 L620 360 L570 320 L570 880 L230 880 L230 320 L180 360 L100 270 Z';
const LONG = 'M250 150 L340 110 Q400 160 460 110 L550 150 L690 360 L740 760 L650 780 L590 420 L570 400 L570 880 L230 880 L230 400 L210 420 L150 780 L60 760 L110 360 Z';
const HOOD = 'M250 170 L330 130 Q400 180 470 130 L550 170 L690 380 L740 780 L650 800 L590 440 L570 420 L570 880 L230 880 L230 420 L210 440 L150 800 L60 780 L110 380 Z';

export function garment(kind, color, printText = '#1', bg = '#FFE14D') {
  const path = kind === 'hoodie' ? HOOD : kind === 'long' ? LONG : TEE;
  const hood = kind === 'hoodie' ? `<path d="M300 170 Q400 20 500 170 Q400 230 300 170 Z" fill="${color}" stroke="${INK}" stroke-width="10"/>` : '';
  const pocket = kind === 'hoodie' ? `<path d="M300 650 L500 650 L530 780 L270 780 Z" fill="none" stroke="${INK}" stroke-width="6"/>` : '';
  const printFill = color === INK ? '#FFE14D' : '#fff';
  if (kind === 'stickers') {
    return svg(800, 1000, `<rect width="800" height="1000" fill="${bg}"/>
      ${[[260, 360, -12, '#FF2E88', 'POW'], [540, 420, 10, '#00B4E6', 'BAM'], [400, 680, -4, '#fff', 'NOVIKO']].map(([x, y, r, c, t], i) => `<g transform="rotate(${r} ${x} ${y})"><rect x="${x - 170}" y="${y - 130}" width="340" height="260" rx="40" fill="#fff" stroke="${INK}" stroke-width="10"/><polygon points="${burstPoints(x, y, 120, 70, 12, 0.3, i + 2)}" fill="${c}" stroke="${INK}" stroke-width="8"/>${word(x, y + 20, t, t.length > 4 ? 46 : 64, '#fff', 0)}</g>`).join('')}`);
  }
  return svg(800, 1000, `<rect width="800" height="1000" fill="${bg}"/>
    ${hood}<path d="${path}" fill="${color}" stroke="${INK}" stroke-width="10" stroke-linejoin="round"/>${pocket}
    <polygon points="${burstPoints(400, 380, 110, 66, 12, 0.3, 4)}" fill="${printFill}" stroke="${INK}" stroke-width="8"/>
    ${word(400, 405, printText, 64, '#FF2E88', -6)}`);
}
