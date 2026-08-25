/* =========================================================
   色度 seedu · 配色引擎
   HEX/RGB/HSL 互转 + 感知色彩空间 + 和谐配色
   ========================================================= */
'use strict';

/* ---------- 颜色转换工具 ---------- */
function normalizeHex(input) {
  if (typeof input !== 'string') return null;
  let h = input.trim().replace(/^#/, '').toUpperCase();
  if (/^[0-9A-F]{3}$/.test(h)) {
    h = h.split('').map(c => c + c).join('');
  }
  if (/^[0-9A-F]{6}$/.test(h)) return '#' + h;
  return null;
}

/* ---------- 通用颜色解析：支持 HEX / RGB / HSL / 命名色 ---------- */
const CSS_COLOR_NAMES = {
  aliceblue: '#F0F8FF', antiquewhite: '#FAEBD7', aqua: '#00FFFF', aquamarine: '#7FFFD4',
  azure: '#F0FFFF', beige: '#F5F5DC', bisque: '#FFE4C4', black: '#000000',
  blanchedalmond: '#FFEBCD', blue: '#0000FF', blueviolet: '#8A2BE2', brown: '#A52A2A',
  burlywood: '#DEB887', cadetblue: '#5F9EA0', chartreuse: '#7FFF00', chocolate: '#D2691E',
  coral: '#FF7F50', cornflowerblue: '#6495ED', cornsilk: '#FFF8DC', crimson: '#DC143C',
  cyan: '#00FFFF', darkblue: '#00008B', darkcyan: '#008B8B', darkgoldenrod: '#B8860B',
  darkgray: '#A9A9A9', darkgreen: '#006400', darkgrey: '#A9A9A9', darkkhaki: '#BDB76B',
  darkmagenta: '#8B008B', darkolivegreen: '#556B2F', darkorange: '#FF8C00', darkorchid: '#9932CC',
  darkred: '#8B0000', darksalmon: '#E9967A', darkseagreen: '#8FBC8F', darkslateblue: '#483D8B',
  darkslategray: '#2F4F4F', darkslategrey: '#2F4F4F', darkturquoise: '#00CED1', darkviolet: '#9400D3',
  deeppink: '#FF1493', deepskyblue: '#00BFFF', dimgray: '#696969', dimgrey: '#696969',
  dodgerblue: '#1E90FF', firebrick: '#B22222', floralwhite: '#FFFAF0', forestgreen: '#228B22',
  fuchsia: '#FF00FF', gainsboro: '#DCDCDC', ghostwhite: '#F8F8FF', gold: '#FFD700',
  goldenrod: '#DAA520', gray: '#808080', green: '#008000', greenyellow: '#ADFF2F',
  grey: '#808080', honeydew: '#F0FFF0', hotpink: '#FF69B4', indianred: '#CD5C5C',
  indigo: '#4B0082', ivory: '#FFFFF0', khaki: '#F0E68C', lavender: '#E6E6FA',
  lavenderblush: '#FFF0F5', lawngreen: '#7CFC00', lemonchiffon: '#FFFACD', lightblue: '#ADD8E6',
  lightcoral: '#F08080', lightcyan: '#E0FFFF', lightgoldenrodyellow: '#FAFAD2', lightgray: '#D3D3D3',
  lightgreen: '#90EE90', lightgrey: '#D3D3D3', lightpink: '#FFB6C1', lightsalmon: '#FFA07A',
  lightseagreen: '#20B2AA', lightskyblue: '#87CEFA', lightslategray: '#778899', lightslategrey: '#778899',
  lightsteelblue: '#B0C4DE', lightyellow: '#FFFFE0', lime: '#00FF00', limegreen: '#32CD32',
  linen: '#FAF0E6', magenta: '#FF00FF', maroon: '#800000', mediumaquamarine: '#66CDAA',
  mediumblue: '#0000CD', mediumorchid: '#BA55D3', mediumpurple: '#9370DB', mediumseagreen: '#3CB371',
  mediumslateblue: '#7B68EE', mediumspringgreen: '#00FA9A', mediumturquoise: '#48D1CC',
  mediumvioletred: '#C71585', midnightblue: '#191970', mintcream: '#F5FFFA', mistyrose: '#FFE4E1',
  moccasin: '#FFE4B5', navajowhite: '#FFDEAD', navy: '#000080', oldlace: '#FDF5E6',
  olive: '#808000', olivedrab: '#6B8E23', orange: '#FFA500', orangered: '#FF4500',
  orchid: '#DA70D6', palegoldenrod: '#EEE8AA', palegreen: '#98FB98', paleturquoise: '#AFEEEE',
  palevioletred: '#DB7093', papayawhip: '#FFEFD5', peachpuff: '#FFDAB9', peru: '#CD853F',
  pink: '#FFC0CB', plum: '#DDA0DD', powderblue: '#B0E0E6', purple: '#800080',
  rebeccapurple: '#663399', red: '#FF0000', rosybrown: '#BC8F8F', royalblue: '#4169E1',
  saddlebrown: '#8B4513', salmon: '#FA8072', sandybrown: '#F4A460', seagreen: '#2E8B57',
  seashell: '#FFF5EE', sienna: '#A0522D', silver: '#C0C0C0', skyblue: '#87CEEB',
  slateblue: '#6A5ACD', slategray: '#708090', slategrey: '#708090', snow: '#FFFAFA',
  springgreen: '#00FF7F', steelblue: '#4682B4', tan: '#D2B48C', teal: '#008080',
  thistle: '#D8BFD8', tomato: '#FF6347', turquoise: '#40E0D0', violet: '#EE82EE',
  wheat: '#F5DEB3', white: '#FFFFFF', whitesmoke: '#F5F5F5', yellow: '#FFFF00',
  yellowgreen: '#9ACD32',
};

// 解析任意颜色输入 → 统一返回大写 HEX（#RRGGBB），失败返回 null
function parseColor(input) {
  if (typeof input !== 'string') return null;
  const s = input.trim();
  if (!s) return null;

  // 1) HEX（含简写 #abc / abc）
  const hex = normalizeHex(s);
  if (hex) return hex;

  // 2) CSS 命名色
  const lower = s.toLowerCase();
  if (Object.prototype.hasOwnProperty.call(CSS_COLOR_NAMES, lower)) return CSS_COLOR_NAMES[lower];

  // 3) rgb() / rgba() / 逗号或空格分隔的 R,G,B 数字（支持百分比）
  const nums = s.match(/-?\d+(\.\d+)?/g);
  if (nums && nums.length >= 3) {
    // 仅当首字符暗示 rgb 或纯数字组时走 RGB 分支
    if (/^rgba?\(/i.test(s) || !/[a-z]/i.test(s.replace(/\s*,\s*|\s+/g, ''))) {
      const pct = /%/g.test(s);
      let r = parseFloat(nums[0]), g = parseFloat(nums[1]), b = parseFloat(nums[2]);
      if (pct) { r = r / 100 * 255; g = g / 100 * 255; b = b / 100 * 255; }
      if (r >= 0 && r <= 255 && g >= 0 && g <= 255 && b >= 0 && b <= 255) {
        return rgbToHex(r, g, b);
      }
    }
  }

  // 4) hsl() / hsla()：h 角度 + 两个百分比
  if (/^hsla?\(/i.test(s)) {
    const pct = s.match(/-?\d+(\.\d+)?%/g) || [];
    const numsHsl = s.match(/-?\d+(\.\d+)?/g) || [];
    if (numsHsl.length >= 3 && pct.length >= 2) {
      const h = parseFloat(numsHsl[0]);
      const st = parseFloat(pct[0]);
      const lt = parseFloat(pct[1]);
      if (st >= 0 && st <= 100 && lt >= 0 && lt <= 100) return hslToHex(h, st, lt);
    }
  }

  return null;
}

function hexToRgb(hex) {
  const h = hex.replace('#', '');
  return {
    r: parseInt(h.slice(0, 2), 16),
    g: parseInt(h.slice(2, 4), 16),
    b: parseInt(h.slice(4, 6), 16),
  };
}

function rgbToHex(r, g, b) {
  const c = v => Math.max(0, Math.min(255, Math.round(v))).toString(16).padStart(2, '0').toUpperCase();
  return '#' + c(r) + c(g) + c(b);
}

function rgbToHsl(r, g, b) {
  r /= 255; g /= 255; b /= 255;
  const max = Math.max(r, g, b), min = Math.min(r, g, b);
  let h = 0, s = 0; const l = (max + min) / 2;
  const d = max - min;
  if (d !== 0) {
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r: h = (g - b) / d + (g < b ? 6 : 0); break;
      case g: h = (b - r) / d + 2; break;
      default: h = (r - g) / d + 4; break;
    }
    h *= 60;
  }
  return { h: Math.round(h), s: Math.round(s * 100), l: Math.round(l * 100) };
}

function hslToRgb(h, s, l) {
  h = ((h % 360) + 360) % 360; s = Math.max(0, Math.min(100, s)) / 100; l = Math.max(0, Math.min(100, l)) / 100;
  const c = (1 - Math.abs(2 * l - 1)) * s;
  const x = c * (1 - Math.abs(((h / 60) % 2) - 1));
  const m = l - c / 2;
  let r = 0, g = 0, b = 0;
  if (h < 60) { r = c; g = x; }
  else if (h < 120) { r = x; g = c; }
  else if (h < 180) { g = c; b = x; }
  else if (h < 240) { g = x; b = c; }
  else if (h < 300) { r = x; b = c; }
  else { r = c; b = x; }
  return { r: (r + m) * 255, g: (g + m) * 255, b: (b + m) * 255 };
}

function hslToHex(h, s, l) {
  const { r, g, b } = hslToRgb(h, s, l);
  return rgbToHex(r, g, b);
}

/* ---------- 感知层：sRGB → XYZ → CIELAB → CIELCh ---------- */
const D65 = { x: 95.047, y: 100.0, z: 108.883 };

function srgbToLinear(v) {
  v /= 255;
  return v <= 0.04045 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4);
}
function linearToSrgb(v) {
  return v <= 0.0031308 ? v * 12.92 : 1.055 * Math.pow(v, 1 / 2.4) - 0.055;
}

function rgbToXyz(r, g, b) {
  const R = srgbToLinear(r), G = srgbToLinear(g), B = srgbToLinear(b);
  return {
    x: (0.4124564 * R + 0.3575761 * G + 0.1804375 * B) * 100,
    y: (0.2126729 * R + 0.7151522 * G + 0.0721750 * B) * 100,
    z: (0.0193339 * R + 0.1191920 * G + 0.9503041 * B) * 100,
  };
}

function xyzToRgb(x, y, z) {
  const X = x / 100, Y = y / 100, Z = z / 100;
  const R = 3.2404542 * X - 1.5371385 * Y - 0.4985314 * Z;
  const G = -0.9692660 * X + 1.8760108 * Y + 0.0415560 * Z;
  const B = 0.0556434 * X - 0.2040259 * Y + 1.0572252 * Z;
  const c = v => Math.max(0, Math.min(255, Math.round(linearToSrgb(v) * 255)));
  return { r: c(R), g: c(G), b: c(B) };
}

function xyzToLab(x, y, z) {
  const fx = x / D65.x, fy = y / D65.y, fz = z / D65.z;
  const f = t => (t > 0.008856 ? Math.cbrt(t) : (7.787 * t + 16 / 116));
  const fx2 = f(fx), fy2 = f(fy), fz2 = f(fz);
  return { L: 116 * fy2 - 16, a: 500 * (fx2 - fy2), b: 200 * (fy2 - fz2) };
}

function labToXyz(L, a, b) {
  const fy = (L + 16) / 116;
  const fx = a / 500 + fy;
  const fz = fy - b / 200;
  const finv = t => (t > 0.206893 ? t * t * t : (t - 16 / 116) / 7.787);
  return { x: D65.x * finv(fx), y: D65.y * finv(fy), z: D65.z * finv(fz) };
}

function hexToLab(hex) {
  const { r, g, b } = hexToRgb(hex);
  const xyz = rgbToXyz(r, g, b);
  return xyzToLab(xyz.x, xyz.y, xyz.z);
}

function labToHex(L, a, b) {
  const xyz = labToXyz(L, a, b);
  const { r, g, b: bl } = xyzToRgb(xyz.x, xyz.y, xyz.z);
  return rgbToHex(r, g, bl);
}

function labToLch(L, a, b) {
  const C = Math.hypot(a, b);
  const h = (Math.atan2(b, a) * 180 / Math.PI + 360) % 360;
  return { L, C, h };
}

function lchToLab(L, C, h) {
  const hr = h * Math.PI / 180;
  return { L, a: C * Math.cos(hr), b: C * Math.sin(hr) };
}

function hexToLch(hex) {
  const { L, a, b } = hexToLab(hex);
  return labToLch(L, a, b);
}

function lchToHex(L, C, h) {
  const { a, b } = lchToLab(L, C, h);
  return labToHex(L, a, b);
}

/* ---------- CIEDE2000 感知色差（Sharma et al. 2005） ---------- */
function ciede2000(lab1, lab2) {
  const [L1, a1, b1] = [lab1.L, lab1.a, lab1.b];
  const [L2, a2, b2] = [lab2.L, lab2.a, lab2.b];

  const C1 = Math.hypot(a1, b1);
  const C2 = Math.hypot(a2, b2);
  const Cbar = (C1 + C2) / 2;
  const Cbar7 = Math.pow(Cbar, 7);
  const G = 0.5 * (1 - Math.sqrt(Cbar7 / (Cbar7 + Math.pow(25, 7))));

  const a1p = (1 + G) * a1;
  const a2p = (1 + G) * a2;

  const C1p = Math.hypot(a1p, b1);
  const C2p = Math.hypot(a2p, b2);

  const h1p = (Math.atan2(b1, a1p) * 180 / Math.PI + 360) % 360;
  const h2p = (Math.atan2(b2, a2p) * 180 / Math.PI + 360) % 360;

  const dLp = L2 - L1;
  const dCp = C2p - C1p;

  let dhp;
  if (C1p * C2p === 0) dhp = 0;
  else if (Math.abs(h2p - h1p) <= 180) dhp = h2p - h1p;
  else if (h2p - h1p > 180) dhp = h2p - h1p - 360;
  else dhp = h2p - h1p + 360;
  const dHp = 2 * Math.sqrt(C1p * C2p) * Math.sin(dhp * Math.PI / 360);

  const Lbarp = (L1 + L2) / 2;
  const Cbarp = (C1p + C2p) / 2;

  let hbarp;
  if (C1p * C2p === 0) hbarp = h1p + h2p;
  else if (Math.abs(h1p - h2p) <= 180) hbarp = (h1p + h2p) / 2;
  else if (h1p + h2p < 360) hbarp = (h1p + h2p + 360) / 2;
  else hbarp = (h1p + h2p - 360) / 2;

  const T = 1 - 0.17 * Math.cos((hbarp - 30) * Math.PI / 180)
    + 0.24 * Math.cos(2 * hbarp * Math.PI / 180)
    + 0.32 * Math.cos((3 * hbarp + 6) * Math.PI / 180)
    - 0.20 * Math.cos((4 * hbarp - 63) * Math.PI / 180);

  const dtheta = 30 * Math.exp(-Math.pow((hbarp - 275) / 25, 2));
  const RC = 2 * Math.sqrt(Cbar7 / (Cbar7 + Math.pow(25, 7)));
  const SL = 1 + 0.015 * Math.pow(Lbarp - 50, 2) / Math.sqrt(20 + Math.pow(Lbarp - 50, 2));
  const SC = 1 + 0.045 * Cbarp;
  const SH = 1 + 0.015 * Cbarp * T;
  const RT = -Math.sin(2 * dtheta * Math.PI / 180) * RC;

  const dL = dLp / SL;
  const dC = dCp / SC;
  const dH = dHp / SH;

  return Math.sqrt(dL * dL + dC * dC + dH * dH + RT * dC * dH);
}

const clamp = (v, lo, hi) => Math.max(lo, Math.min(hi, v));

/* ---------- 颜色家族描述（多语言） ---------- */
function colorFamily(h, s, l) {
  const t = (k) => (window.i18n ? window.i18n.t(k) : ({
    'color.neutral.dark': '近黑 · 中性', 'color.neutral.light': '近白 · 中性',
    'color.neutral.gray': '灰 · 中性', 'color.neutral.lightgray': '浅灰 · 中性',
    'color.temp.cool': '冷色', 'color.temp.warm': '暖色', 'color.suffix': '色',
    'color.hue.red': '红', 'color.hue.orange': '橙', 'color.hue.yellow': '黄',
    'color.hue.green': '绿', 'color.hue.cyan': '青', 'color.hue.blue': '蓝',
    'color.hue.purple': '紫', 'color.hue.magenta': '品红',
  }[k] || k));
  if (l < 12) return t('color.neutral.dark');
  if (l > 93) return t('color.neutral.light');
  if (s < 12) return l < 50 ? t('color.neutral.gray') : t('color.neutral.lightgray');
  const names = [
    [15, 'red'], [45, 'orange'], [70, 'yellow'], [160, 'green'], [200, 'cyan'], [255, 'blue'], [290, 'purple'], [330, 'magenta'], [360, 'red'],
  ];
  let en = 'red';
  for (const [max, n] of names) { if (h <= max) { en = n; break; } }
  const temp = (h >= 60 && h <= 240) ? 'color.temp.cool' : 'color.temp.warm';
  return t('color.hue.' + en) + t('color.suffix') + ' · ' + t(temp);
}

/* =========================================================
   和谐配色生成
   基于 CIELCh 感知空间 + 实证和谐角 + 明度/饱和度协同
   ========================================================= */
const PALETTES = [
  {
    key: 'mono', name: '单色系', en: 'Monochromatic',
    desc: '同一色相的有序明度渐变，感知均匀。',
    build: (hex) => {
      const base = hexToLch(hex);
      // 均匀明度梯度（暗→亮），彩度随明度微调，避免暗部发灰、亮部发白
      return [14, 30, 46, 62, 78, 92].map((L, i) => {
        const C = clamp(base.C * (0.75 + i * 0.07), 0, 110);
        return lchToHex(L, C, base.h);
      });
    },
  },
  {
    key: 'analogous', name: '邻近色', en: 'Analogous',
    desc: '实证和谐角 ±12° / ±35°，自然柔和。',
    build: (hex) => {
      const base = hexToLch(hex);
      const offsets = [-35, -12, 0, 12, 35];
      const dL = [6, 3, 0, -3, -6]; // 色相递增、明度缓降，形成流动层次
      return offsets.map((off, i) => lchToHex(clamp(base.L + dL[i], 3, 97), base.C, (base.h + off + 360) % 360));
    },
  },
  {
    key: 'triadic', name: '三分色', en: 'Triadic',
    desc: '等距三色，分支略降明度与彩度以平衡。',
    build: (hex) => {
      const base = hexToLch(hex);
      return [0, 120, 240].map((off, i) => {
        const LL = i === 0 ? base.L : clamp(base.L - 10, 10, 86);
        const CC = i === 0 ? base.C : base.C * 0.92;
        return lchToHex(LL, CC, (base.h + off + 360) % 360);
      });
    },
  },
  {
    key: 'split', name: '分裂互补', en: 'Split Complementary',
    desc: '互补色两侧 ±130°，避开 153° 不和谐区。',
    build: (hex) => {
      const base = hexToLch(hex);
      return [0, 130, 230].map((off, i) => {
        const LL = i === 0 ? base.L : clamp(base.L - 8, 10, 88);
        return lchToHex(LL, base.C, (base.h + off + 360) % 360);
      });
    },
  },
  {
    key: 'square', name: '正方形', en: 'Square',
    desc: '色环等距四色，均匀平衡。',
    build: (hex) => {
      const base = hexToLch(hex);
      return [0, 90, 180, 270].map((off, i) => {
        const LL = clamp(base.L + (i % 2 === 0 ? 0 : -12), 8, 92);
        const CC = i % 2 === 0 ? base.C : base.C * 0.94;
        return lchToHex(LL, CC, (base.h + off + 360) % 360);
      });
    },
  },
  {
    key: 'pastel', name: '柔和色', en: 'Pastel',
    desc: '低彩度高明度，温柔淡雅。',
    build: (hex) => {
      const base = hexToLch(hex);
      const C = clamp(base.C * 0.35, 8, 30);
      const L = clamp(base.L + 18, 82, 94);
      return [-35, -12, 0, 12, 35].map(off => lchToHex(L, C, (base.h + off + 360) % 360));
    },
  },
  {
    key: 'earth', name: '大地色', en: 'Earth Tones',
    desc: '暖调低彩度，自然沉稳。',
    build: (hex) => {
      const base = hexToLch(hex);
      const C = clamp(base.C * 0.4, 15, 40);
      return [-35, -12, 0, 12, 35].map((off, i) => {
        const L = clamp(base.L * 0.7 + i * 8, 25, 72);
        return lchToHex(L, C, (base.h + off + 360) % 360);
      });
    },
  },
  {
    key: 'shades', name: '暗色系', en: 'Shades',
    desc: '同一色相的暗色变化，沉稳有力。',
    build: (hex) => {
      const base = hexToLch(hex);
      return [62, 52, 42, 32, 22, 13].map(L => lchToHex(L, clamp(base.C * 0.9, 0, 90), base.h));
    },
  },
  {
    key: 'tints', name: '淡色系', en: 'Tints',
    desc: '同一色相的浅色变化，清新明亮。',
    build: (hex) => {
      const base = hexToLch(hex);
      return [88, 82, 76, 70, 64, 58].map(L => lchToHex(L, clamp(base.C * 0.75, 0, 55), base.h));
    },
  },
  {
    key: 'closeAnalog', name: '紧凑邻近', en: 'Close Analogous',
    desc: '±20° 小跨邻近，与主色高度协调。',
    build: (hex) => {
      const base = hexToLch(hex);
      const offsets = [-20, -10, 0, 10, 20];
      const dL = [4, 2, 0, -2, -4];
      return offsets.map((off, i) => lchToHex(clamp(base.L + dL[i], 6, 94), base.C, (base.h + off + 360) % 360));
    },
  },
  {
    key: 'dualAnalog', name: '双类似', en: 'Dual Analogous',
    desc: '0/25/50° 渐进三色，柔和过渡。',
    build: (hex) => {
      const base = hexToLch(hex);
      return [0, 25, 50].map((off, i) => {
        const LL = i === 0 ? base.L : clamp(base.L - i * 6, 12, 90);
        return lchToHex(LL, base.C, (base.h + off + 360) % 360);
      });
    },
  },
  {
    key: 'softRange', name: '柔光跨度', en: 'Soft Range',
    desc: '同色相明暗两端，避免极强对比。',
    build: (hex) => {
      const base = hexToLch(hex);
      return [38, 50, 62, 74].map(L => lchToHex(L, clamp(base.C * 0.95, 0, 100), base.h));
    },
  },
  {
    key: 'mutedHarmony', name: '低饱和协调', en: 'Muted Harmony',
    desc: '主色降饱和 + 邻近，温润统一。',
    build: (hex) => {
      const base = hexToLch(hex);
      const C = clamp(base.C * 0.55, 10, 45);
      return [-15, 0, 15].map((off, i) => {
        const LL = i === 1 ? clamp(base.L + 4, 10, 92) : clamp(base.L - 6, 10, 88);
        return lchToHex(LL, C, (base.h + off + 360) % 360);
      });
    },
  },
  {
    key: 'miniTriad', name: '微差三色', en: 'Mini Triad',
    desc: '0/45/90° 小跨三等分，轻快平衡。',
    build: (hex) => {
      const base = hexToLch(hex);
      return [0, 45, 90].map((off, i) => {
        const LL = i === 0 ? base.L : clamp(base.L - i * 5, 12, 90);
        const CC = i === 0 ? base.C : base.C * 0.96;
        return lchToHex(LL, CC, (base.h + off + 360) % 360);
      });
    },
  },
  {
    key: 'tempShift', name: '冷暖微调', en: 'Temp Shift',
    desc: '±15° 微调 + 明度梯度，自然层次。',
    build: (hex) => {
      const base = hexToLch(hex);
      const offsets = [-15, 0, 15];
      const dL = [-8, 0, 8];
      return offsets.map((off, i) => lchToHex(clamp(base.L + dL[i], 8, 92), base.C, (base.h + off + 360) % 360));
    },
  },
];

/* =========================================================
   灵感画廊预设池
   ========================================================= */
const GALLERY_POOL = window.SEEDU_GALLERY_POOL || [];
function shuffleArray(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function shuffleGallery(category = 'all') {
  const pool = category === 'all'
    ? GALLERY_POOL
    : GALLERY_POOL.filter(g => g.categories.includes(category));
  const last = state.galleryShown || [];
  const shuffle = shuffleArray;
  // 池子过小（≤8）直接全量展示
  if (pool.length <= 8) return shuffle(pool).slice(0, 8);
  // 尽量与当前展示的 8 条不同：优先用尚未展示过的配色
  for (let attempt = 0; attempt < 10; attempt++) {
    const pick = shuffle(pool).slice(0, 8);
    const overlap = pick.filter(p => last.includes(p.name)).length;
    if (overlap <= 2) return pick;
  }
  // 兜底：用未展示过的配色拼满 8 条，保证「换一批」真换内容
  const remaining = shuffle(pool.filter(p => !last.includes(p.name)));
  if (remaining.length >= 8) return remaining.slice(0, 8);
  const fromLast = shuffle(pool.filter(p => last.includes(p.name)));
  return [...remaining, ...fromLast].slice(0, 8);
}

/* =========================================================
   状态 & DOM
   ========================================================= */
const state = { base: '#fd4a4a', galleryCategory: 'all', galleryShown: [], lastCopied: '' };

const $ = sel => document.querySelector(sel);
/* 读取 styles.css :root 设计令牌（JS 动态颜色单点来源） */
const cssVar = n => getComputedStyle(document.documentElement).getPropertyValue(n).trim();
const els = {
  navHex: $('#navHex'), navSwatch: $('#navSwatch'),
  heroHex: $('#heroHex'), colorPicker: $('#colorPicker'), searchDot: $('#searchDot'),
  valHex: $('#valHex'), valRgb: $('#valRgb'), valHsl: $('#valHsl'), valFamily: $('#valFamily'),
  paletteGrid: $('#paletteGrid'),
  gradientGrid: $('#gradientGrid'),
  galleryGrid: $('#galleryGrid'), galleryRefresh: $('#galleryRefresh'), galleryTabs: $('#galleryTabs'),
  toast: $('#toast'),
  floatSearch: $('#floatSearch'), floatSearchDot: $('#floatSearchDot'),
  floatSearchInput: $('#floatSearchInput'), floatSearchBtn: $('#floatSearchBtn'),
};

/* ---------- Toast ---------- */
let toastTimer = null;
function toastTranslate(msg) {
  if (!window.i18n) return msg;
  // 全等匹配的固定文案
  const EXACT = {
    '已复制渐变 CSS': 'toast.cssCopied',
    '颜色格式无效，支持 HEX / RGB / HSL / 颜色名，如 #fd4a4a、rgb(253 74 74)、hsl(4 98% 64%)、tomato': 'toast.invalid',
    '已为您换一批新配色': 'toast.shuffle',
  };
  if (EXACT[msg]) return window.i18n.t(EXACT[msg]);
  // 带变量的动态文案：翻译前缀修饰词，保留变量
  const m = msg.match(/^已复制\s*(.+)$/); if (m) return window.i18n.t('toast.copied') + ' ' + m[1];
  const m2 = msg.match(/^已把\s*(.+)\s*设为基准色$/); if (m2) return window.i18n.t('toast.setBase') + ' ' + m2[1];
  const m3 = msg.match(/^已载入[「『](.+)[」』]$/); if (m3) return window.i18n.t('toast.loaded') + ' ' + m3[1];
  const m4 = msg.match(/^已为\s*(.+)\s*生成配色$/); if (m4) return window.i18n.t('toast.generated') + ' ' + m4[1];
  return msg;
}
function toast(msg) {
  msg = toastTranslate(msg);
  els.toast.textContent = msg;
  els.toast.classList.add('show');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => els.toast.classList.remove('show'), 1600);
}

/* ---------- 复制（统一由 tools.js 的全局 copyText 处理：颜色→黑色胶囊+右下角浮窗；其它→选中文本） ---------- */

/* =========================================================
   渲染
   ========================================================= */
function renderPreview(hex) {
  const { r, g, b } = hexToRgb(hex);
  const hsl = rgbToHsl(r, g, b);
  els.valHex.textContent = hex;
  els.valRgb.textContent = `rgb(${r},${g},${b})`;
  els.valHsl.textContent = `hsl(${hsl.h},${hsl.s}%,${hsl.l}%)`;
  els.valFamily.textContent = colorFamily(hsl.h, hsl.s, hsl.l);
  if (els.navSwatch) els.navSwatch.style.background = hex;
  if (els.searchDot) els.searchDot.style.background = hex;
  if (els.floatSearchDot) els.floatSearchDot.style.background = hex;
}

// 计算一组配色相对主色（base）的「接近度」：取组内每个色与 base 的
// CIEDE2000 感知色差平均值，数值越小说明整体越接近主色。
function paletteCloseness(baseLab, labList) {
  let total = 0;
  for (const lab of labList) total += ciede2000(baseLab, lab);
  return total / labList.length;
}

function renderPalettes(hex) {
  els.paletteGrid.innerHTML = '';
  const baseLab = hexToLab(hex);
  // 按与主色的接近程度排序：越接近主色越靠前，相差过大者靠后
  const scored = PALETTES
    .map((p, i) => ({ p, i, colors: p.build(hex) }))
    .map(s => {
      const lab = s.colors.map(hexToLab);
      return { ...s, lab, closeness: paletteCloseness(baseLab, lab) };
    })
    .sort((a, b) => a.closeness - b.closeness || a.i - b.i);

  scored.forEach(({ p, colors }) => {
    const baseColor = colors[0];
    const card = document.createElement('article');
    card.className = 'palette-card';
    card.innerHTML = `
      <div class="palette-preview">
        ${colors.map(c => `<span class="palette-preview-bar" style="background:${c}" data-hex="${c}"></span>`).join('')}
      </div>
      <div class="palette-info" data-base="${baseColor}">
        <h3 class="palette-name">${p.name}</h3>
        <p class="palette-meta">${colors.length} 色</p>
      </div>`;
    card.querySelectorAll('.palette-preview-bar').forEach(bar => {
      bar.addEventListener('click', async (e) => {
        e.stopPropagation();
        const c = bar.dataset.hex;
        await copyText(c);
      });
    });
    card.querySelector('.palette-info').addEventListener('click', () => {
      setBase(baseColor);
      toast(`已把 ${baseColor} 设为基准色`);
    });
    els.paletteGrid.appendChild(card);
  });
}

/* =========================================================
   渐变预览
   基于当前基准色生成一组渐变卡片，点击复制 CSS
   ========================================================= */
const PALETTE_BY_KEY = Object.fromEntries(PALETTES.map(p => [p.key, p]));

const GRADIENT_PRESETS = [
  { nameKey: 'gradient.name.warmAdjacent', type: 'offsets', v: [0, 35] },
  { nameKey: 'gradient.name.coolAdjacent', type: 'offsets', v: [-35, 0] },
  { nameKey: 'gradient.name.complementary', type: 'offsets', v: [0, 180] },
  { nameKey: 'gradient.name.triadic', type: 'offsets', v: [0, 120, 240] },
  { nameKey: 'gradient.name.splitComplementary', type: 'offsets', v: [0, 130] },
  { nameKey: 'gradient.name.diagonal', type: 'offsets', v: [-60, 60] },
  { nameKey: 'gradient.name.mono', type: 'palette', v: 'mono' },
  { nameKey: 'gradient.name.pastel', type: 'palette', v: 'pastel' },
  { nameKey: 'gradient.name.closeAnalog', type: 'palette', v: 'closeAnalog' },
  { nameKey: 'gradient.name.shades', type: 'palette', v: 'shades' },
  { nameKey: 'gradient.name.tints', type: 'palette', v: 'tints' },
  { nameKey: 'gradient.name.earth', type: 'palette', v: 'earth' },
];

function renderGradients(hex) {
  if (!els.gradientGrid) return;
  const base = hexToLch(hex);
  const byKey = PALETTE_BY_KEY;
  const cards = GRADIENT_PRESETS.map(g => {
    let colors;
    if (g.type === 'offsets') {
      colors = g.v.map(off =>
        lchToHex(clamp(base.L, 0, 100), Math.max(0, base.C), (base.h + off + 360) % 360));
    } else {
      colors = byKey[g.v].build(hex);
    }
    const nameZh = ({ 'gradient.name.warmAdjacent':'邻近暖向','gradient.name.coolAdjacent':'邻近冷向','gradient.name.complementary':'互补渐变','gradient.name.triadic':'三分渐变','gradient.name.splitComplementary':'分裂互补','gradient.name.diagonal':'对角双色','gradient.name.mono':'单色层叠','gradient.name.pastel':'柔和渐变','gradient.name.closeAnalog':'紧凑邻近','gradient.name.shades':'暗色渐变','gradient.name.tints':'淡色渐变','gradient.name.earth':'大地渐变' })[g.nameKey] || '';
    return { name: window.i18n ? window.i18n.t(g.nameKey) : nameZh, css: `linear-gradient(135deg, ${colors.join(', ')})` };
  });

  els.gradientGrid.innerHTML = '';
  const saveLabel = window.i18n ? window.i18n.t('gradient.save') : '保存';
  cards.forEach(({ name, css }) => {
    const card = document.createElement('article');
    card.className = 'gradient-card';
    card.style.background = css;
    card.title = css;
    card.innerHTML = `<span class="gradient-overlay"><span class="gradient-name">${name}</span><span class="gradient-actions">
      <button type="button" class="gradient-action-btn gradient-action-save" data-act="save"><svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg><span>${saveLabel}</span></button>
    </span></span>`;
    card.addEventListener('click', () => {
      const wasActive = card.classList.contains('is-active');
      els.gradientGrid.querySelectorAll('.gradient-card.is-active').forEach(c => { if (c !== card) c.classList.remove('is-active'); });
      card.classList.toggle('is-active', !wasActive);
    });
    card.querySelectorAll('.gradient-action-btn').forEach(btn => btn.addEventListener('click', async e => {
      e.stopPropagation();
      if (btn.dataset.act === 'save' && window.saveGradientImage) window.saveGradientImage(css);
    }));
    els.gradientGrid.appendChild(card);
  });
}
/* 渐变保存已迁移至 tools.js 的 saveGradientImage（Canvas → writeTempFile → saveImageToPhotosAlbum） */

function translateGalleryTags(tags) {
  if (!window.i18n) return tags;
  const map = {
    '自然': window.i18n.t('gallery.cat.nature'), '柔和': window.i18n.t('gallery.cat.soft'),
    '复古': window.i18n.t('gallery.cat.retro'), '霓虹': window.i18n.t('gallery.cat.neon'),
    '随机': window.i18n.t('gallery.cat.random'), '经典': window.i18n.t('gallery.cat.classic'),
    '冷色': window.i18n.t('color.temp.cool'), '暖色': window.i18n.t('color.temp.warm'),
    '邻近': window.i18n.t('palette.harmony.analogous'),
    '单色': window.i18n.t('palette.harmony.mono'), '三分': window.i18n.t('palette.harmony.triadic'),
    '分裂互补': window.i18n.t('palette.harmony.split'),
    '高饱和': window.i18n.t('gallery.tag.highsat'),
    '粉色': window.i18n.t('gallery.tag.pink'), '紫色': window.i18n.t('gallery.tag.purple'),
    '绿色': window.i18n.t('gallery.tag.green'), '橙色': window.i18n.t('gallery.tag.orange'),
    '紫粉': window.i18n.t('gallery.tag.pinkPurple'), '粉绿': window.i18n.t('gallery.tag.pinkGreen'),
  };
  return tags.split(' · ').map(w => map[w] || w).join(' · ');
}

function resolvedGalleryName(g) {
  const lang = (window.i18n && window.i18n.getLang && window.i18n.getLang()) || 'zh-CN';
  if (lang === 'zh-CN') return g.name;
  return (g.i18n && g.i18n[lang]) || g.name;
}

function renderGallery() {
  // 首页灵感库(#galleryGrid) 已由 gallery.js 统一渲染，此处不再操作，避免双写冲突
  return;
}

/* =========================================================
   核心：设置基准色 & 全流程刷新
   ========================================================= */
function setBase(hex, { fromInput = false } = {}) {
  const norm = parseColor(hex);
  if (!norm) { toast('颜色格式无效，支持 HEX / RGB / HSL / 颜色名，如 #fd4a4a、rgb(253 74 74)、hsl(4 98% 64%)、tomato'); return; }
  state.base = norm;
  if (els.navHex) els.navHex.value = norm;
  els.colorPicker.value = norm;
  const pickerDot = $('#heroPickerDot');
  if (pickerDot) pickerDot.style.background = norm;
  if (!fromInput) els.heroHex.value = norm;
  renderPreview(norm);
  renderPalettes(norm);
  renderGradients(norm);
  if (els.floatSearchInput) els.floatSearchInput.value = norm;
}
/* 暴露给 gallery.js（配色方案库色卡「设为主色」交互与首页一致） */
window.setBase = setBase;

/* 标题第二行短语循环切换（淡入上浮；aria-hidden 由切换逻辑同步维护） */
function initHeroRotate() {
  const wrap = document.getElementById('heroRotate');
  if (!wrap) return;
  const items = [...wrap.querySelectorAll('.hero-rotate-item')];
  if (items.length < 2) return;
  const reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (reduce) return; // 减少动态：保持静态第一句
  let idx = 0;
  items[0].classList.add('is-active');
  setInterval(() => {
    items[idx].classList.remove('is-active');
    items[idx].setAttribute('aria-hidden', 'true');
    idx = (idx + 1) % items.length;
    items[idx].classList.add('is-active');
    items[idx].setAttribute('aria-hidden', 'false');
  }, 2600);
}

/* =========================================================
   事件绑定
   ========================================================= */
function bindEvents() {
  // 底部 tab 栏：切换视图（单页 view 切换，非锚点滚动）
  const views = new Map();
  document.querySelectorAll('.view').forEach(v => views.set(v.id, v));
  const tabs = document.querySelectorAll('.app-tab');
  const switchView = (viewId) => {
    const target = views.get(viewId);
    if (!target) return;
    views.forEach(v => v.classList.toggle('is-active', v === target));
    tabs.forEach(t => t.classList.toggle('is-active', t.dataset.view === viewId));
    window.scrollTo({ top: 0, behavior: 'auto' });
    // 进入高级配色器时重绘色环主点 / 预览区（初始化时视图隐藏导致定位与渲染异常）
    if (viewId === 'view-tool-palette' && window.refreshAdvancedPalette) {
      requestAnimationFrame(window.refreshAdvancedPalette);
    }
  };
  tabs.forEach(tab => {
    tab.addEventListener('click', () => switchView(tab.dataset.view));
  });
  // 页面内指向 #view-xxx 的链接（返回工具库 / 关于页按钮等）也走视图切换
  document.querySelectorAll('a[href^="#view-"]').forEach(a => {
    a.addEventListener('click', e => {
      e.preventDefault();
      switchView(a.getAttribute('href').slice(1));
    });
  });

  // 首页导航：在首页点击「首页」平滑滚动回顶部，并避免锚点默认跳变
  document.querySelectorAll('.nav-link[href="#top"]').forEach(link => {
    link.addEventListener('click', e => {
      e.preventDefault();
      const reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      window.scrollTo({ top: 0, behavior: reduce ? 'auto' : 'smooth' });
    });
  });
  // 滚动时高亮当前区块对应的导航项（提升当前位置的可视反馈）
  const sectionLinks = new Map([
    ['about', document.querySelector('.nav-link[href="#about"]')],
  ]);
  const setActiveNav = (id) => {
    document.querySelectorAll('.nav-link[aria-current="page"]').forEach(l => {
      if (l.getAttribute('href') !== '#top') l.removeAttribute('aria-current');
    });
    const link = sectionLinks.get(id);
    if (link) { link.setAttribute('aria-current', 'page'); }
    else {
      const home = document.querySelector('.nav-link[href="#top"]');
      if (home) home.setAttribute('aria-current', 'page');
    }
  };
  if ('IntersectionObserver' in window && sectionLinks.size) {
    const navObserver = new IntersectionObserver((entries) => {
      entries.forEach(e => { if (e.isIntersecting) setActiveNav(e.target.id); });
    }, { rootMargin: '-45% 0px -50% 0px' });
    ['about'].forEach(id => { const el = document.getElementById(id); if (el) navObserver.observe(el); });
  }
  // 移动端：ESC 关闭折叠菜单，提升键盘可访问性
  const navToggle = $('#navToggle');
  if (navToggle) {
    document.addEventListener('keydown', e => {
      if (e.key === 'Escape' && navToggle.checked) navToggle.checked = false;
    });
  }
  // 生成配色（已改为 div + 按钮，避免表单提交跳转被容器禁用）
  const heroSubmit = $('#heroSubmitBtn') || $('#colorForm');
  if (heroSubmit) heroSubmit.addEventListener('click', () => {
    setBase(els.heroHex.value, { fromInput: true });
    document.getElementById('palettes').scrollIntoView({ behavior: 'smooth' });
  });
  // 顶部 hex 输入
  if (els.navHex) {
    els.navHex.addEventListener('change', () => setBase(els.navHex.value, { fromInput: true }));
    els.navHex.addEventListener('keydown', e => { if (e.key === 'Enter') els.navHex.blur(); });
  }
  // 预设色板取色器（替代原生 input[type=color]，避免小红书容器崩溃）
  const PRESET_SWATCHES = [
    '#e53935','#fb8c00','#fdd835','#7cb342',
    '#43a047','#00897b','#1e88e5','#3949ab',
    '#8e24aa','#d81b60','#8d6e63','#bdbdbd'
  ];

  // 首页专用面板（搜索框下方）
  const swatchPanel = $('#heroSwatchPanel');
  const swatchGrid = $('#heroSwatchGrid');
  const pickerBtn = $('#heroPickerBtn');
  const pickerDot = $('#heroPickerDot');
  if (swatchGrid) {
    swatchGrid.innerHTML = PRESET_SWATCHES.map(c => `<button type="button" class="hero-swatch" data-hex="${c}" style="background:${c}" aria-label="选择 ${c}"></button>`).join('');
    swatchGrid.addEventListener('click', e => {
      const btn = e.target.closest('.hero-swatch');
      if (!btn) return;
      const hex = btn.dataset.hex;
      els.colorPicker.value = hex;
      if (pickerDot) pickerDot.style.background = hex;
      setBase(hex);
      if (window.revealFloatSearch) window.revealFloatSearch(hex);
      if (swatchPanel) swatchPanel.hidden = true;
    });
  }
  if (pickerBtn) pickerBtn.addEventListener('click', () => { if (swatchPanel) swatchPanel.hidden = !swatchPanel.hidden; });
  const swatchClose = $('#heroSwatchClose');
  if (swatchClose) swatchClose.addEventListener('click', () => { if (swatchPanel) swatchPanel.hidden = true; });

  // 通用面板（工具页内所有 data-color-trigger 按钮）
  const appPanel = $('#appColorPanel');
  const appPanelGrid = $('#appColorPanelGrid');
  let appPanelTarget = null;
  if (appPanelGrid) {
    appPanelGrid.innerHTML = PRESET_SWATCHES.map(c => `<button type="button" class="app-color-swatch" data-hex="${c}" style="background:${c}" aria-label="选择 ${c}"></button>`).join('');
    appPanelGrid.addEventListener('click', e => {
      const btn = e.target.closest('.app-color-swatch');
      if (!btn || !appPanelTarget) return;
      const hex = btn.dataset.hex;
      const input = document.getElementById(appPanelTarget);
      const trigger = document.querySelector('[data-color-trigger="' + appPanelTarget + '"]');
      if (input) {
        input.value = hex;
        input.dispatchEvent(new Event('input', { bubbles: true }));
        input.dispatchEvent(new Event('change', { bubbles: true }));
      }
      if (trigger) trigger.style.background = hex;
      if (window.revealFloatSearch) window.revealFloatSearch(hex);
      appPanel.hidden = true;
    });
  }
  const appPanelClose = $('#appColorPanelClose');
  if (appPanelClose) appPanelClose.addEventListener('click', () => { if (appPanel) appPanel.hidden = true; });
  document.querySelectorAll('[data-color-trigger]').forEach(trigger => {
    trigger.addEventListener('click', () => {
      appPanelTarget = trigger.dataset.colorTrigger;
      if (appPanel) appPanel.hidden = false;
    });
  });

  // 预览区复制
  [['#chipHex', () => els.valHex.textContent], ['#chipRgb', () => els.valRgb.textContent], ['#chipHsl', () => els.valHsl.textContent]]
    .forEach(([sel, get]) => $(sel).addEventListener('click', async () => { await copyText(get()); }));

  // 返回顶部 + 浮动快速搜索：滚动超过阈值后同时显示
  const backToTop = $('#backToTop');
  if (backToTop) {
    const SHOW_AFTER = 400;
    // 显示/隐藏只负责可见性；输入框内容由 copyText 实时同步，避免覆盖用户手动输入
    const showFloating = (show) => {
      backToTop.classList.toggle('is-visible', show);
      if (els.floatSearch) {
        // 滚动触发仅限首页；选取颜色后（__floatSearchPinned）在任何页面保持可见
        const isHome = (document.querySelector('.view.is-active') || {}).id === 'view-home';
        els.floatSearch.classList.toggle('is-visible', (show && isHome) || !!window.__floatSearchPinned);
      }
    };
    const onScroll = () => showFloating(window.scrollY > SHOW_AFTER);
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();

    backToTop.addEventListener('click', () => {
      const reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      window.scrollTo({ top: 0, behavior: reduce ? 'auto' : 'smooth' });
    });

    if (els.floatSearchInput && els.floatSearchBtn) {
      // 点击浮动取色：以按钮上显示的当前色号生成方案并滚动到配色区（仅首页存在配色区）。
      const applyFloatPick = () => {
        const v = (els.floatSearchInput.value || state.base || '').trim();
        if (!v) return;
        setBase(v); // 内部已完成 parseColor→HEX 及全部渲染（renderPreview/renderPalettes/renderGradients）
        const pal = document.getElementById('palettes');
        if (pal) pal.scrollIntoView({ behavior: 'smooth' });
        toast(`已为 ${v} 生成配色`);
      };
      // 点击取色：以按钮上显示的当前色号生成方案并滚动到配色区（仅首页存在配色区）。
      // 长按复制交互已移除（不再弹「选中文本」窗口）
      const onPick = () => applyFloatPick();
      els.floatSearchBtn.addEventListener('click', onPick);
      els.floatSearchInput.addEventListener('click', onPick);
    }
  }
}

/* ---------- 滚动 reveal（尊重 reduced-motion） ---------- */
function initReveal() {
  const reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const items = document.querySelectorAll('.reveal');
  if (reduce || !('IntersectionObserver' in window)) {
    items.forEach(el => el.classList.add('is-in'));
    return;
  }
  const io = new IntersectionObserver((entries) => {
    entries.forEach(e => { if (e.isIntersecting) { e.target.classList.add('is-in'); io.unobserve(e.target); } });
  }, { threshold: 0.12, rootMargin: '0px 0px -8% 0px' });
  items.forEach(el => io.observe(el));
}

/* ---------- 启动 ---------- */
bindEvents();
setBase('#fd4a4a');
initReveal();
initHeroRotate();

/* 切换语言时重渲染动态内容 */
if (window.i18n) window.i18n.onChange(() => {
  if (state && state.base) setBase(state.base);
});


