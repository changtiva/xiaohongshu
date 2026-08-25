/* =========================================================
   色度 seedu · 工具库（tools.html）
   六个工具：图片取色 / 高级配色器 / 色盲检测 /
   颜色格式转换 / 对比度检查器
   自包含纯色函数，遵循 DESIGN-SPEC.md
   ========================================================= */

/* IIFE 包裹：避免与 app.js 顶层同名符号（$、clamp、parseColor 等）冲突 */
(function(){

/* =========================================================
   基础工具
   ========================================================= */
const $ = sel => document.querySelector(sel);
/* 读取 styles.css :root 设计令牌（JS 动态颜色单点来源） */
const cssVar = n => getComputedStyle(document.documentElement).getPropertyValue(n).trim();

/* .color-circle 是 div + 内部 input[type=color] 结构（早期版本是 <label>，
   HTML 标准 label 行为会触发整 40px 圆 → "点击哪儿都弹颜色选择"。
   改为 div 后需要 JS 转发 click 到内部 input） */
document.addEventListener('click', (e) => {
  const circle = e.target.closest('.color-circle');
  if (!circle) return;
  const input = circle.querySelector('input[type="color"]');
  if (input && e.target !== input) input.click();
});


function clamp(v, min, max) { return Math.max(min, Math.min(max, v)); }

function normalizeHex(input) {
  if (typeof input !== 'string') return null;
  let h = input.trim().replace(/^#/, '').toUpperCase();
  if (/^[0-9A-F]{3}$/.test(h)) h = h.split('').map(c => c + c).join('');
  if (/^[0-9A-F]{6}$/.test(h)) return '#' + h;
  return null;
}

/* ---------- 通用颜色解析：支持 HEX / RGB / HSL / 命名色（与 app.js parseColor 同逻辑） ---------- */
const CSS_COLOR_NAMES_T = {
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
  const hex = normalizeHex(s);
  if (hex) return hex;
  const lower = s.toLowerCase();
  if (Object.prototype.hasOwnProperty.call(CSS_COLOR_NAMES_T, lower)) return CSS_COLOR_NAMES_T[lower];
  const nums = s.match(/-?\d+(\.\d+)?/g);
  if (nums && nums.length >= 3) {
    if (/^rgba?\(/i.test(s) || !/[a-z]/i.test(s.replace(/\s*,\s*|\s+/g, ''))) {
      const pct = /%/g.test(s);
      let r = parseFloat(nums[0]), g = parseFloat(nums[1]), b = parseFloat(nums[2]);
      if (pct) { r = r / 100 * 255; g = g / 100 * 255; b = b / 100 * 255; }
      if (r >= 0 && r <= 255 && g >= 0 && g <= 255 && b >= 0 && b <= 255) {
        return rgbToHexBytes(r, g, b);
      }
    }
  }
  if (/^hsla?\(/i.test(s)) {
    const pct = s.match(/-?\d+(\.\d+)?%/g) || [];
    const numsHsl = s.match(/-?\d+(\.\d+)?/g) || [];
    if (numsHsl.length >= 3 && pct.length >= 2) {
      const h = parseFloat(numsHsl[0]);
      const st = parseFloat(pct[0]);
      const lt = parseFloat(pct[1]);
      if (st >= 0 && st <= 100 && lt >= 0 && lt <= 100) {
        const { r, g, b } = hslToRgb(h, st, lt);
        return rgbToHexBytes(r, g, b);
      }
    }
  }
  return null;
}

function hexToRgb(hex) {
  const h = hex.replace('#', '');
  return { r: parseInt(h.slice(0, 2), 16), g: parseInt(h.slice(2, 4), 16), b: parseInt(h.slice(4, 6), 16) };
}
function hexToRgba(hex, alpha = 1) {
  const { r, g, b } = hexToRgb(hex);
  const a = clamp(alpha, 0, 1);
  return `rgba(${r}, ${g}, ${b}, ${+a.toFixed(3)})`;
}

function rgbToHexBytes(r, g, b) {
  const c = v => clamp(Math.round(v), 0, 255).toString(16).padStart(2, '0').toUpperCase();
  return '#' + c(r) + c(g) + c(b);
}
const rgbToHex = rgbToHexBytes;

function rgbToHsl(r, g, b) {
  r /= 255; g /= 255; b /= 255;
  const max = Math.max(r, g, b), min = Math.min(r, g, b);
  let h = 0, s = 0;
  const l = (max + min) / 2;
  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r: h = (g - b) / d + (g < b ? 6 : 0); break;
      case g: h = (b - r) / d + 2; break;
      default: h = (r - g) / d + 4;
    }
    h *= 60;
  }
  return { h: Math.round(h), s: Math.round(s * 100), l: Math.round(l * 100) };
}

function hslToRgb(h, s, l) {
  h = ((h % 360) + 360) % 360;
  s = clamp(s, 0, 100) / 100; l = clamp(l, 0, 100) / 100;
  const c = (1 - Math.abs(2 * l - 1)) * s;
  const x = c * (1 - Math.abs((h / 60) % 2 - 1));
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

function rgbToHsv(r, g, b) {
  r /= 255; g /= 255; b /= 255;
  const max = Math.max(r, g, b), min = Math.min(r, g, b), d = max - min;
  let h = 0;
  if (d !== 0) {
    if (max === r) h = ((g - b) / d) % 6;
    else if (max === g) h = (b - r) / d + 2;
    else h = (r - g) / d + 4;
    h *= 60;
  }
  if (h < 0) h += 360;
  return { h: Math.round(h), s: Math.round((max === 0 ? 0 : d / max) * 100), v: Math.round(max * 100) };
}
function hsvToRgb(h, s, v) {
  h = ((h % 360) + 360) % 360; s = clamp(s, 0, 100) / 100; v = clamp(v, 0, 100) / 100;
  const c = v * s, x = c * (1 - Math.abs((h / 60) % 2 - 1)), m = v - c;
  let r = 0, g = 0, b = 0;
  if (h < 60) { r = c; g = x; }
  else if (h < 120) { r = x; g = c; }
  else if (h < 180) { g = c; b = x; }
  else if (h < 240) { g = x; b = c; }
  else if (h < 300) { r = x; b = c; }
  else { r = c; b = x; }
  return { r: (r + m) * 255, g: (g + m) * 255, b: (b + m) * 255 };
}

/* ---- 感知空间（LCh） ---- */
function srgbToLinear(v) {
  return v <= 0.04045 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4);
}
function linearToSrgb(v) {
  return v <= 0.0031308 ? v * 12.92 : 1.055 * Math.pow(v, 1 / 2.4) - 0.055;
}
function rgbToXyz(r, g, b) {
  const lr = srgbToLinear(r / 255), lg = srgbToLinear(g / 255), lb = srgbToLinear(b / 255);
  return {
    x: lr * 0.4124 + lg * 0.3576 + lb * 0.1805,
    y: lr * 0.2126 + lg * 0.7152 + lb * 0.0722,
    z: lr * 0.0193 + lg * 0.1192 + lb * 0.9505,
  };
}
function xyzToLab(x, y, z) {
  const refX = 0.95047, refY = 1.0, refZ = 1.08883;
  const f = t => (t > 0.008856 ? Math.cbrt(t) : 7.787 * t + 16 / 116);
  const fx = f(x / refX), fy = f(y / refY), fz = f(z / refZ);
  return { L: 116 * fy - 16, a: 500 * (fx - fy), b: 200 * (fy - fz) };
}
function labToLch(L, a, b) {
  const c = Math.sqrt(a * a + b * b);
  let h = Math.atan2(b, a) * 180 / Math.PI;
  if (h < 0) h += 360;
  return { L, C: c, h };
}
function hexToLch(hex) {
  const { r, g, b } = hexToRgb(hex);
  return labToLch(...Object.values(xyzToLab(...Object.values(rgbToXyz(r, g, b)))).map(v => v));
}
function lchToHex(L, C, h) {
  const hr = h * Math.PI / 180;
  const a = C * Math.cos(hr), b = C * Math.sin(hr);
  const fy = (L + 16) / 116;
  const fx = fy + a / 500, fz = fy - b / 200;
  const finv = t => {
    const t3 = t * t * t;
    return t3 > 0.008856 ? t3 : (t - 16 / 116) / 7.787;
  };
  const refX = 0.95047, refY = 1.0, refZ = 1.08883;
  const x = finv(fx) * refX, y = finv(fy) * refY, z = finv(fz) * refZ;
  const r = linearToSrgb(x * 3.2406 + y * -1.5372 + z * -0.4986);
  const g = linearToSrgb(x * -0.9689 + y * 1.8758 + z * 0.0415);
  const bb = linearToSrgb(x * 0.0557 + y * -0.204 + z * 1.057);
  return rgbToHexBytes(clamp(r, 0, 1) * 255, clamp(g, 0, 1) * 255, clamp(bb, 0, 1) * 255);
}

/* ---- 扩展色彩空间（RGBA / CMYK / HWB / OKLab·OKLCH / XYZ） ---- */
function rgbaToRgb(str) {
  const m = str.match(/^rgba?\(\s*(\d{1,3}(?:\.\d+)?)\s*,\s*(\d{1,3}(?:\.\d+)?)\s*,\s*(\d{1,3}(?:\.\d+)?)\s*(?:,\s*([\d.]+)\s*)?\)/i);
  if (!m) return null;
  return { r: clamp(+m[1], 0, 255), g: clamp(+m[2], 0, 255), b: clamp(+m[3], 0, 255), a: m[4] != null ? clamp(+m[4], 0, 1) : 1 };
}
function rgbToCmyk(r, g, b) {
  r /= 255; g /= 255; b /= 255;
  const k = 1 - Math.max(r, g, b);
  if (k === 1) return { c: 0, m: 0, y: 0, k: 100 };
  const c = (1 - r - k) / (1 - k), m = (1 - g - k) / (1 - k), y = (1 - b - k) / (1 - k);
  return { c: Math.round(c * 100), m: Math.round(m * 100), y: Math.round(y * 100), k: Math.round(k * 100) };
}
function cmykToRgb(c, m, y, k) {
  c /= 100; m /= 100; y /= 100; k /= 100;
  return { r: 255 * (1 - c) * (1 - k), g: 255 * (1 - m) * (1 - k), b: 255 * (1 - y) * (1 - k) };
}
function rgbToHwb(r, g, b) {
  r /= 255; g /= 255; b /= 255;
  const max = Math.max(r, g, b), min = Math.min(r, g, b);
  const { h } = rgbToHsl(r * 255, g * 255, b * 255);
  return { h: Math.round(h), w: Math.round(min * 100), bl: Math.round((1 - max) * 100) };
}
function hwbToRgb(h, w, bl) {
  h = ((h % 360) + 360) % 360; w = clamp(w, 0, 100) / 100; bl = clamp(bl, 0, 100) / 100;
  if (w + bl >= 1) { const g = w / (w + bl) * 255; return { r: g, g, b: g }; }
  const { r, g, b } = hslToRgb(h, 100, 50);
  return { r: (r * (1 - w - bl) + w * 255), g: (g * (1 - w - bl) + w * 255), b: (b * (1 - w - bl) + w * 255) };
}
/* OKLab / OKLCH（Björn Ottosson） */
function rgbToOklab(r, g, b) {
  r = srgbToLinear(r / 255); g = srgbToLinear(g / 255); b = srgbToLinear(b / 255);
  const l = 0.4122214708 * r + 0.5363325363 * g + 0.0514459929 * b;
  const m = 0.2119034982 * r + 0.6806995451 * g + 0.1073969566 * b;
  const s = 0.0883024619 * r + 0.2817188376 * g + 0.6299787005 * b;
  const l_ = Math.cbrt(l), m_ = Math.cbrt(m), s_ = Math.cbrt(s);
  return {
    L: 0.2104542553 * l_ + 0.7936177850 * m_ - 0.0040720468 * s_,
    a: 1.9779984951 * l_ - 2.4285922050 * m_ + 0.4505937099 * s_,
    b: 0.0259040371 * l_ + 0.7827717662 * m_ - 0.8086757660 * s_,
  };
}
function oklabToRgb(L, a, b) {
  const l_ = L + 0.3963377774 * a + 0.2158037573 * b;
  const m_ = L - 0.1055613458 * a - 0.0638541728 * b;
  const s_ = L - 0.0894841775 * a - 1.2914855480 * b;
  const l = l_ * l_ * l_, m = m_ * m_ * m_, s = s_ * s_ * s_;
  let r = 4.0767416621 * l - 3.3077115913 * m + 0.2309699292 * s;
  let g = -1.2684380046 * l + 2.6097574011 * m - 0.3413193965 * s;
  let bl = -0.0041960863 * l - 0.7034186147 * m + 1.7076147010 * s;
  return { r: 255 * linearToSrgb(r), g: 255 * linearToSrgb(g), b: 255 * linearToSrgb(bl) };
}
function oklabToOklch(L, a, b) {
  const C = Math.sqrt(a * a + b * b);
  let h = Math.atan2(b, a) * 180 / Math.PI;
  if (h < 0) h += 360;
  return { L, C, h };
}
function oklchToOklab(L, C, h) {
  const hr = h * Math.PI / 180;
  return { L, a: C * Math.cos(hr), b: C * Math.sin(hr) };
}
function rgbToOklch(r, g, b) { const c = rgbToOklab(r, g, b); return oklabToOklch(c.L, c.a, c.b); }
function oklchToRgb(L, C, h) { const c = oklchToOklab(L, C, h); return oklabToRgb(c.L, c.a, c.b); }
function rgbToXyzD65(r, g, b) {
  const lr = srgbToLinear(r / 255), lg = srgbToLinear(g / 255), lb = srgbToLinear(b / 255);
  return {
    x: lr * 0.4124564 + lg * 0.3575761 + lb * 0.1804375,
    y: lr * 0.2126729 + lg * 0.7151522 + lb * 0.0721750,
    z: lr * 0.0193339 + lg * 0.1191920 + lb * 0.9503041,
  };
}
function xyzToRgbD65(x, y, z) {
  const r = x * 3.2404542 + y * -1.5371385 + z * -0.4985314;
  const g = x * -0.9692660 + y * 1.8760108 + z * 0.0415560;
  const b = x * 0.0556434 + y * -0.2040259 + z * 1.0572252;
  return { r: 255 * linearToSrgb(r), g: 255 * linearToSrgb(g), b: 255 * linearToSrgb(b) };
}

/* ---- Toast / 复制 ---- */
let toastTimer = null;
function toastTranslateTool(msg) {
  if (!window.i18n) return msg;
  const EXACT = {
    '请选择图片文件': 'toast.pickImage',
    '图片过大，请选择 10MB 以内的图片': 'toast.imageTooLarge',
    '图片加载失败，请更换图片重试': 'toast.imageLoadFail',
    '文件读取失败，请重试': 'toast.readFail',
    '已从剪贴板粘贴图片': 'toast.pasted',
    '请先上传图片获取取色结果': 'toast.noResult',
    '导出失败，请重试': 'toast.exportFail',
    '已重置彩度与明度': 'toast.reset',
    '请先上传图片': 'toast.uploadFirst',
    '已导出 5 张模拟视图': 'toast.exportedViews',
    'CSS 代码已复制到剪贴板': 'toast.cssCopied',
    '复制失败，请手动选择复制': 'toast.copyFail',
    '渐变参数已导出为 JSON': 'toast.gradientExported',
  };
  if (EXACT[msg]) return window.i18n.t(EXACT[msg]);
  let m;
  if ((m = msg.match(/^已复制\s*(.+)$/))) return window.i18n.t('toast.copied') + ' ' + m[1];
  if ((m = msg.match(/^已载入\s*(.+)$/))) return window.i18n.t('toast.loaded') + ' ' + m[1];
  if ((m = msg.match(/^已导出\s*(\d+)\s*色色卡$/))) return window.i18n.t('toast.exported') + ' ' + m[1] + ' ' + window.i18n.t('toast.colors');
  if ((m = msg.match(/^最多支持\s*(\d+)\s*个色标$/))) return window.i18n.t('toast.maxStops') + ' ' + m[1] + ' ' + window.i18n.t('toast.stops');
  if ((m = msg.match(/^已应用预设：\s*(.+)$/))) return window.i18n.t('toast.appliedPreset') + m[1];
  return msg;
}
function toast(msg) {
  msg = toastTranslateTool(msg);
  const el = $('#toast');
  if (!el) return;
  el.textContent = msg;
  el.classList.add('show');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => el.classList.remove('show'), 1600);
}
/* 是否为颜色文本（HEX / rgb() / hsl() 及其带透明通道变体） */
function isColorText(text) {
  if (typeof text !== 'string') return false;
  const s = text.trim();
  return !!normalizeHex(s) || /^rgba?\(/i.test(s) || /^hsla?\(/i.test(s);
}

/* 黑色胶囊提示：已选取 X + 右下角长按复制 */
let pickToastTimer = null;
function showPickToast(text) {
  const el = document.getElementById('pickToast');
  if (!el) return;
  const textEl = document.getElementById('pickToastText');
  const dotEl = document.getElementById('pickToastDot');
  if (textEl) textEl.textContent = text;
  if (dotEl) dotEl.style.background = normalizeHex(text) || text;
  el.classList.add('show');
  clearTimeout(pickToastTimer);
  pickToastTimer = setTimeout(() => el.classList.remove('show'), 2000);
}
window.showPickToast = showPickToast;

/* 选中文本方案：容器禁用剪贴板，用 textarea 全选 + 用户长按系统复制 */
function copyViaSelect(text) {
  try {
    const ta = document.createElement('textarea');
    ta.value = text;
    ta.setAttribute('readonly', '');
    ta.style.cssText = 'position:fixed;left:50%;top:50%;transform:translate(-50%,-50%);width:82%;max-width:340px;font-size:15px;line-height:1.5;padding:12px 14px;color:#1a1a1a;background:#fff;border:1px solid #e3e3e8;border-radius:12px;box-shadow:0 10px 36px rgba(0,0,0,.2);z-index:99999;';
    document.body.appendChild(ta);
    ta.focus({ preventScroll: true });
    ta.select();
    try { ta.setSelectionRange(0, text.length); } catch (_) {}
    toast('已选中，长按可复制');
    setTimeout(() => { if (ta.parentNode) ta.parentNode.removeChild(ta); }, 2500);
    return true;
  } catch (e) {
    toast('复制失败，请手动长按文本复制');
    return false;
  }
}
window.copyViaSelect = copyViaSelect;

/* 唤出右下角浮窗并同步显示所选颜色（任何页面均有效） */
function revealFloatSearch(text) {
  const norm = normalizeHex(text) || text;
  if ($('#floatSearchInput')) $('#floatSearchInput').textContent = norm;
  if ($('#floatSearchDot')) $('#floatSearchDot').style.background = normalizeHex(text) || '';
  if ($('#floatSearch')) $('#floatSearch').classList.add('is-visible');
  window.__floatSearchPinned = true; // 选取后浮窗保持可见（app.js 滚动逻辑读取）
  return norm;
}
window.revealFloatSearch = revealFloatSearch;

/* 统一复制入口：
   颜色文本 → 黑色胶囊「已选取 X / 右下角长按复制」+ 唤出右下角浮窗（不再弹输入框）；
   其它文本 → 选中文本方案。 */
async function copyText(text) {
  if (isColorText(text)) {
    const norm = revealFloatSearch(text);
    showPickToast(norm);
    return true;
  }
  return copyViaSelect(text);
}
window.copyText = copyText;

/* =========================================================
   浮动快速搜索 + 返回顶部
   ========================================================= */
function initFloating() {
  const backToTop = $('#backToTop');
  const SHOW_AFTER = 400;
  // 子页面（非首页）只显示「返回顶部」，不显示右下角浮动搜索
  const showFloating = show => {
    if (backToTop) backToTop.classList.toggle('is-visible', show);
  };
  window.addEventListener('scroll', () => showFloating(window.scrollY > SHOW_AFTER), { passive: true });
  showFloating(window.scrollY > SHOW_AFTER);
  if (backToTop) {
    backToTop.addEventListener('click', () => {
      const reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      window.scrollTo({ top: 0, behavior: reduce ? 'auto' : 'smooth' });
    });
  }
}

/* =========================================================
   工具 1 · 图片取色
   ========================================================= */
function createCanvas(width, height) {
  const canvas = document.createElement('canvas');
  canvas.width = width; canvas.height = height;
  return { canvas, ctx: canvas.getContext('2d', { willReadFrequently: true }) };
}
function colorDistanceSq(a, b) {
  const dr = a.r - b.r, dg = a.g - b.g, db = a.b - b.b;
  return dr * dr + dg * dg + db * db;
}
/* 在图片上生成 n 个均匀网格采样点（归一化坐标），用于自定义模式初始化与补齐色散布 */
function gridPoints(n) {
  const cols = Math.ceil(Math.sqrt(n)), rows = Math.ceil(n / cols), pts = [];
  for (let k = 0; k < n; k++) {
    const r = Math.floor(k / cols), c = k % cols;
    pts.push({ x: (c + 0.5) / cols, y: (r + 0.5) / rows });
  }
  return pts;
}

/* 计算图片取色点：根据取色模式返回每个代表色的归一化坐标（x,y ∈ [0,1]）。
   - dominant（占比）：按颜色桶累计像素权重求重心，占比高的色靠近其分布中心
   - light（亮色）：按亮度降序取最亮的若干代表色
   - dark（暗色）：按亮度升序取最暗的若干代表色
   - custom（自定义）：保持切换前的圆点位置（prevPoints）；若数量变化则按网格初始化，
                       每个点的颜色重新采样为该位置图片实际像素色
   返回 [{ hex, x, y, count }] */
function computeImagePoints(img, maxColors, mode, prevPoints, lumaRange) {
  const maxSize = 160;
  const scale = Math.min(1, maxSize / Math.max(img.naturalWidth, img.naturalHeight));
  const w = Math.round(img.naturalWidth * scale);
  const h = Math.round(img.naturalHeight * scale);
  const lumaMin = lumaRange ? lumaRange[0] : 0;   // 0~1
  const lumaMax = lumaRange ? lumaRange[1] : 1;   // 0~1
  const { canvas, ctx } = createCanvas(w, h);
  ctx.drawImage(img, 0, 0, w, h);
  const data = ctx.getImageData(0, 0, w, h).data;
  // 缓存缩略图像素数据，供拖动时实时取色（避免每次 move 重建画布）
  imageToolState.imgData = { data, w, h };
  const sampleAt = (fx, fy) => {
    const x = Math.min(w - 1, Math.max(0, Math.floor(fx * w)));
    const y = Math.min(h - 1, Math.max(0, Math.floor(fy * h)));
    const i = (y * w + x) * 4;
    return rgbToHexBytes(data[i], data[i + 1], data[i + 2]);
  };

  if (mode === 'custom') {
    // 自定义模式：保留已有圆点位置，不打乱；
    // 增加数量时新增圆点随机定位，减少数量时按末尾顺序删除
    const prev = prevPoints || [];
    let pts;
    if (prev.length === maxColors) {
      pts = prev.slice();
    } else if (prev.length > maxColors) {
      pts = prev.slice(0, maxColors);
    } else {
      pts = prev.slice();
      while (pts.length < maxColors) pts.push({ x: Math.random(), y: Math.random() });
    }
    // 优先使用已存储颜色（主导模式切换 / 拖动实时取色写入），避免重采样导致其他圆点颜色突变；
    // 仅在颜色缺失（如全新初始化）时按位置采样
    const stored = imageToolState.colors;
    const useStored = stored && stored.length === pts.length;
    return pts.map((p, i) => ({
      hex: useStored ? stored[i] : sampleAt(p.x, p.y),
      x: p.x, y: p.y, count: 1
    }));
  }

  // 聚类：dominant 按占比，light/dark 按亮度排序后再去重
  const q = mode === 'dominant' ? 16 : 8;
  const buckets = new Map();
  const step = 3;
  for (let i = 0; i < data.length; i += 4 * step) {
    const a = data[i + 3]; if (a < 128) continue;
    const r = data[i], g = data[i + 1], b = data[i + 2];
    const key = `${Math.round(r / q) * q},${Math.round(g / q) * q},${Math.round(b / q) * q}`;
    const px = i / 4; const sx = px % w, sy = Math.floor(px / w);
    const e = buckets.get(key);
    if (e) { e.count++; e.sx += sx; e.sy += sy; }
    else buckets.set(key, { r, g, b, count: 1, sx, sy });
  }
  const lum = c => 0.2126 * c.r + 0.7152 * c.g + 0.0722 * c.b;
  let arr = Array.from(buckets.values());
  // 亮度范围过滤：剔除不在 [lumaMin, lumaMax] 内的桶（占比/亮色/暗色都生效）
  if (lumaMin > 0 || lumaMax < 1) {
    arr = arr.filter(c => { const l = lum(c) / 255; return l >= lumaMin && l <= lumaMax; });
  }
  if (mode === 'light') arr.sort((a, b) => lum(b) - lum(a));
  else if (mode === 'dark') arr.sort((a, b) => lum(a) - lum(b));
  else arr.sort((a, b) => b.count - a.count);

  const minDistSq = 45 * 45;
  const colors = [];
  for (const c of arr) {
    if (colors.length >= maxColors) break;
    const cand = { r: c.r, g: c.g, b: c.b };
    if (!colors.some(p => colorDistanceSq(p, cand) < minDistSq)) {
      colors.push({ r: c.r, g: c.g, b: c.b, count: c.count, x: (c.sx / c.count) / w, y: (c.sy / c.count) / h });
    }
  }
  // 补齐策略：组合 hue + saturation + lightness 多维变化；位置沿网格散布，避免堆在中心。
  // 补齐阶段不做去重，确保严格返回 maxColors 个（避免导出数量与选择不符）
  if (colors.length < maxColors) {
    const first = colors[0] || arr[0] || { r: 128, g: 128, b: 128, count: 1 };
    const { h: h0, s, l } = rgbToHsl(first.r, first.g, first.b);
    const baseSat = Math.max(50, s);
    const baseLig = clamp(Math.max(45, l), 30, 75);
    const grid = gridPoints(maxColors);
    let gi = 0;
    while (colors.length < maxColors) {
      const i = colors.length;
      const ligShift = ((i % 5) - 2) * 10;
      const satShift = ((Math.floor(i / 5) % 3) - 1) * 15;
      const hueShift = Math.floor(i / 15) * 60;
      const hue = (h0 + hueShift + 360) % 360;
      const sat = clamp(baseSat + satShift, 30, 90);
      const lig = clamp(baseLig + ligShift, 30, 80);
      const rgb = hslToRgb(hue, sat, lig);
      const gpos = grid[gi % grid.length]; gi++;
      colors.push({ r: Math.round(rgb.r), g: Math.round(rgb.g), b: Math.round(rgb.b), count: 1, x: gpos.x, y: gpos.y });
    }
  }
  return colors.slice(0, maxColors).map(c => ({ hex: rgbToHexBytes(c.r, c.g, c.b), x: c.x, y: c.y, count: c.count }));
}

/* 按颜色相似度排序：在 CIELAB 感知空间用「贪心最近邻路径」排列，
   使相邻两色的色差最小 → 视觉上相近的颜色排在一起，形成从相近到相近的连续渐变。
   与占比（数量）无关，仅决定展示顺序。多个起点取总路径最短者，保证渐变更自然。 */


function renderToolImageColors(img) {
  const countEl = $('#toolImageCount');
  const satEl = $('#toolImageSat');
  const lightEl = $('#toolImageLight');
  const lumaMinEl = $('#toolImageLumaMin');
  const lumaMaxEl = $('#toolImageLumaMax');
  const maxColors = countEl ? +countEl.value : 5;
  const sMul = satEl ? +satEl.value / 100 : 1;
  const lMul = lightEl ? +lightEl.value / 100 : 1;
  const lumaRange = lumaMinEl && lumaMaxEl
    ? [+lumaMinEl.value / 100, +lumaMaxEl.value / 100]
    : [0, 1];
  const mode = imageToolState.mode || 'dominant';
  const raw = computeImagePoints(img, maxColors, mode, imageToolState.points, lumaRange);
  if (!raw.length) return;
  // 应用饱和度/亮度调整
  const colors = sMul === 1 && lMul === 1
    ? raw
    : raw.map(c => ({ ...c, hex: adjustHsl(c.hex, sMul, lMul) }));
  imageToolState.lastColors = colors;
  imageToolState.rawColors = raw;
  // 写回位置与颜色（供自定义模式切换 / 拖动实时取色时保持）
  imageToolState.points = raw.map(p => ({ x: p.x, y: p.y }));
  imageToolState.colors = raw.map(p => p.hex);
  imageToolState.sMul = sMul;
  imageToolState.lMul = lMul;
  renderImageColors(colors, img, maxColors);
  renderImageDots(colors);
}

// 按归一化坐标实时采样缩略图像素颜色（拖动时调用，避免重建画布）
function sampleToolColor(fx, fy) {
  const d = imageToolState.imgData;
  if (!d) return null;
  const x = Math.min(d.w - 1, Math.max(0, Math.floor(fx * d.w)));
  const y = Math.min(d.h - 1, Math.max(0, Math.floor(fy * d.h)));
  const i = (y * d.w + x) * 4;
  return rgbToHexBytes(d.data[i], d.data[i + 1], d.data[i + 2]);
}

// 拖动时实时同步右侧色卡第 idx 块的颜色（色条 + 信息区 HEX 文本）
function updateColorCard(idx, hex) {
  const row = $('#toolImagePalRow');
  const meta = $('#toolImagePalMeta');
  if (row) {
    const bar = row.children[idx];
    if (bar) { bar.style.background = hex; bar.dataset.hex = hex; }
  }
  if (meta) {
    const item = meta.children[idx];
    if (item) {
      item.dataset.hex = hex;
      const dotEl = item.querySelector('.pal-meta-dot');
      if (dotEl) dotEl.style.background = hex;
      // 更新 HEX 文本（保留首个文本节点）
      item.lastChild && (item.lastChild.textContent = ' ' + hex);
    }
  }
  // 同步结果区上方渐变条，用有效颜色映射避免空值破坏渐变
  const stops = Array.isArray(imageToolState.colors)
    ? imageToolState.colors.map(c => c || '#000000').join(', ')
    : '';
  const gradBar = $('#toolImageGradientBar');
  if (gradBar && stops) gradBar.style.background = `linear-gradient(90deg, ${stops})`;
}

// 在预览图片（imgbox）上叠加取色圆圈：圆点百分比直接对应图片坐标，颜色与右侧色卡同步，且可拖动
function renderImageDots(points) {
  const imgbox = $('#toolImageImgbox');
  const img = $('#toolImagePreview');
  const layer = $('#toolImageDots');
  if (!imgbox || !img || !layer) return;
  img.draggable = false; // 禁止原生拖图，确保拖拽作用到圆点
  layer.innerHTML = points.map((p, i) =>
    `<span class="image-picker-dot" data-idx="${i}" style="left:${(p.x * 100).toFixed(2)}%;top:${(p.y * 100).toFixed(2)}%;color:${p.hex}" title="${p.hex}"></span>`
  ).join('');
  bindDotDrag(layer, imgbox);
}

// 圆点拖动：更新归一化坐标并重新定位；松手后自动切换为「自定义」模式并同步色卡
function bindDotDrag(layer, imgbox) {
  layer.querySelectorAll('.image-picker-dot').forEach(dot => {
    dot.addEventListener('pointerdown', e => {
      e.preventDefault();
      const idx = +dot.dataset.idx;
      dot.setPointerCapture(e.pointerId);
      dot.classList.add('is-active');
      const move = ev => {
        const r = imgbox.getBoundingClientRect();
        const x = clamp((ev.clientX - r.left) / r.width, 0, 1);
        const y = clamp((ev.clientY - r.top) / r.height, 0, 1);
        dot.style.left = (x * 100) + '%';
        dot.style.top = (y * 100) + '%';
        // 实时取色：采样当前位置颜色并同步圆点与右侧色卡（应用 S/L 调整，与最终显示一致）
        const rawHex = sampleToolColor(x, y);
        const hex = rawHex ? adjustHsl(rawHex, imageToolState.sMul, imageToolState.lMul) : null;
        if (hex) {
          dot.style.color = hex;
          dot.title = hex;
          // 确保颜色数组完整（长度与圆点数一致），避免稀疏数组使渐变条失效
          if (!Array.isArray(imageToolState.colors) ||
              imageToolState.colors.length !== (imageToolState.points ? imageToolState.points.length : 0)) {
            imageToolState.colors = (imageToolState.lastColors ||
              (imageToolState.points ? imageToolState.points.map(() => '#000000') : [])).slice();
          }
          imageToolState.colors[idx] = hex;
          updateColorCard(idx, hex);
        }
        if (imageToolState.points && imageToolState.points[idx]) {
          imageToolState.points[idx].x = x;
          imageToolState.points[idx].y = y;
        }
      };
      const up = () => {
        dot.releasePointerCapture(e.pointerId);
        dot.classList.remove('is-active');
        dot.removeEventListener('pointermove', move);
        dot.removeEventListener('pointerup', up);
        // 拖动后自动切换为自定义模式（保持当前圆点位置）
        if (imageToolState.mode !== 'custom') setImageMode('custom');
      };
      dot.addEventListener('pointermove', move);
      dot.addEventListener('pointerup', up);
    });
  });
}

const imageToolState = { img: null, mode: 'dominant', points: null, lastColors: [] };

// 切换取色模式：更新状态、高亮对应标签，并在已加载图片时重算圆点与色卡
function setImageMode(mode) {
  if (!mode) return;
  imageToolState.mode = mode;
  const modeBox = $('#toolImageMode');
  if (modeBox) modeBox.querySelectorAll('.tab-btn').forEach(b => {
    const on = b.dataset.mode === mode;
    b.classList.toggle('is-active', on);
    b.setAttribute('aria-selected', on ? 'true' : 'false');
  });
  if (imageToolState.img) renderToolImageColors(imageToolState.img);
}

// imgbox 精确贴合 contain 后的图片显示区域：按容器可用宽高与图片原始比例计算像素尺寸，
// 保证任何比例图片下取色圆点的百分比坐标都对应图片实际像素（桌面拉伸布局 / 手机布局通用）
function fitImageBox() {
  const img = $('#toolImagePreview');
  const box = $('#toolImageImgbox');
  const frame = document.querySelector('.image-picker-imgframe') || (box && box.parentElement);
  if (!img || !box || !frame || !img.naturalWidth || !img.naturalHeight) return;
  const fw = frame.clientWidth, fh = frame.clientHeight;
  if (!fw || !fh) return;
  const scale = Math.min(fw / img.naturalWidth, fh / img.naturalHeight);
  box.style.width = Math.max(1, Math.round(img.naturalWidth * scale)) + 'px';
  box.style.height = Math.max(1, Math.round(img.naturalHeight * scale)) + 'px';
}

function loadToolImage(file) {
  if (!file) return;
  if (!file.type || !file.type.startsWith('image/')) { toast('请选择图片文件'); return; }
  if (file.size > 10 * 1024 * 1024) { toast('图片过大，请选择 10MB 以内的图片'); return; }
  const reader = new FileReader();
  reader.onload = e => {
    const img = new Image();
    img.onload = () => {
      imageToolState.img = img;
      // 换图先清掉上一次 imgbox 的内联尺寸，避免新图先按旧图的盒子布局（误闪烁/误测量）
      const prevBox = $('#toolImageImgbox');
      if (prevBox) { prevBox.style.width = ''; prevBox.style.height = ''; }
      // 换图时清空上一张图的取色颜色缓存：自定义模式下 computeImagePoints
      // 会优先复用 imageToolState.colors，若不清除则新图仍显示旧图定位处的颜色。
      // 仅清颜色（保留圆点位置语义）；清空后自定义分支会按当前图位置重新采样真实像素色。
      imageToolState.colors = null;
      renderToolImageColors(img);
    };
    img.onerror = () => toast('图片加载失败，请更换图片重试');
    img.src = e.target.result;
  };
  reader.onerror = () => toast('文件读取失败，请重试');
  reader.readAsDataURL(file);
}

function initImageTool() {
  const drop = $('#toolImageDrop'), input = $('#toolImageInput');
  if (!drop || !input) return;
  // 视口/断点变化时重算 imgbox 尺寸（左右列等高布局依赖容器实际宽高）
  window.addEventListener('resize', fitImageBox);
  // resize 事件不覆盖所有布局变化（断点切换、滚动条出现/消失、内嵌视口改尺寸等都可能不触发 resize），
  // 用 ResizeObserver 盯住 imgframe 实际尺寸，变化即重算，避免残留旧图片的盒子尺寸。
  // frame 尺寸始终来自容器而非内容，观察不会形成回路
  if (window.ResizeObserver) {
    const frameEl = document.querySelector('.image-picker-imgframe');
    if (frameEl) new ResizeObserver(() => fitImageBox()).observe(frameEl);
  }
  // 重新上传：直接触发文件选择
  const reupload = $('#toolImageReupload');
  if (reupload) reupload.addEventListener('click', () => input.click());
  input.addEventListener('change', e => { const f = e.target.files[0]; if (f) loadToolImage(f); });
  // 保存色卡到相册
  const exportBtn = $('#toolImageExport');
  if (exportBtn) exportBtn.addEventListener('click', () => saveImageColorCard());
  // 取色模式切换：更新状态并重新计算取色点与圆圈位置
  const modeBox = $('#toolImageMode');
  if (modeBox) {
    modeBox.querySelectorAll('.tab-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        if (btn.classList.contains('is-active')) return;
        setImageMode(btn.dataset.mode);
      });
    });
  }
  // 3 项滑块 + number 输入双向同步：数量 / 饱和度 / 亮度
  const sliders = [
    { el: $('#toolImageCount'),  val: $('#toolImageCountValue'),  min: 3,   max: 12,  step: 1,  after: () => { if (imageToolState.img) renderToolImageColors(imageToolState.img); } },
    { el: $('#toolImageSat'),    val: $('#toolImageSatValue'),    min: 0,   max: 200, step: 5,  after: () => { if (imageToolState.img) renderToolImageColors(imageToolState.img); } },
    { el: $('#toolImageLight'),  val: $('#toolImageLightValue'),  min: 0,   max: 200, step: 5,  after: () => { if (imageToolState.img) renderToolImageColors(imageToolState.img); } },
  ];
  sliders.forEach(s => {
    if (!s.el) return;
    const sync = (src) => {
      const v = clamp(Math.round(+src.value), s.min, s.max);
      s.el.value = v;
      if (s.val) s.val.value = v;
      s.after();
    };
    s.el.addEventListener('input', () => sync(s.el));
    if (s.val) {
      s.val.addEventListener('input', () => sync(s.val));
      s.val.addEventListener('change', () => sync(s.val));
    }
  });
  // 亮度范围双 thumb 滑块：min/max 互不越过 + 实时更新 fill 区域 + 触发重算
  // 拖动 thumb 或键入数值都能精确调整，二者双向同步
  const lumaMinEl = $('#toolImageLumaMin');
  const lumaMaxEl = $('#toolImageLumaMax');
  const lumaMinVal = $('#toolImageLumaMinValue');
  const lumaMaxVal = $('#toolImageLumaMaxValue');
  const lumaFill = $('#toolImageLumaFill');
  if (lumaMinEl && lumaMaxEl) {
    const renderFill = (minV, maxV) => {
      if (lumaFill) {
        lumaFill.style.left = minV + '%';
        lumaFill.style.width = (maxV - minV) + '%';
      }
    };
    // 统一写入：clamp + 互不越过后，同步两个 range 与两个 number 框
    const commit = (minV, maxV, changed) => {
      minV = clamp(Math.round(minV), 0, 100);
      maxV = clamp(Math.round(maxV), 0, 100);
      if (changed === 'min' && minV > maxV - 1) minV = maxV - 1;
      if (changed === 'max' && maxV < minV + 1) maxV = minV + 1;
      lumaMinEl.value = minV; lumaMaxEl.value = maxV;
      if (lumaMinVal) lumaMinVal.value = minV;
      if (lumaMaxVal) lumaMaxVal.value = maxV;
      lumaMinEl.style.zIndex = minV > 90 ? 5 : 4;
      lumaMaxEl.style.zIndex = 4;
      renderFill(minV, maxV);
      if (imageToolState.img) renderToolImageColors(imageToolState.img);
    };
    // 拖动 thumb
    lumaMinEl.addEventListener('input', () => commit(+lumaMinEl.value, +lumaMaxEl.value, 'min'));
    lumaMaxEl.addEventListener('input', () => commit(+lumaMinEl.value, +lumaMaxEl.value, 'max'));
    // 键入数值（input 实时 + change 兜底 clamp）
    if (lumaMinVal) {
      lumaMinVal.addEventListener('input', () => commit(+lumaMinVal.value, +lumaMaxEl.value, 'min'));
      lumaMinVal.addEventListener('change', () => commit(+lumaMinVal.value, +lumaMaxEl.value, 'min'));
    }
    if (lumaMaxVal) {
      lumaMaxVal.addEventListener('input', () => commit(+lumaMinEl.value, +lumaMaxVal.value, 'max'));
      lumaMaxVal.addEventListener('change', () => commit(+lumaMinEl.value, +lumaMaxVal.value, 'max'));
    }
    // 初始化 fill
    renderFill(+lumaMinEl.value, +lumaMaxEl.value);
  }
  // 重置按钮：数量 5 / 饱和度 100 / 亮度 100 / 亮度范围 0-100
  const resetBtn = $('#toolImageResetBtn');
  if (resetBtn) {
    resetBtn.addEventListener('click', () => {
      const sets = [
        { el: $('#toolImageCount'),  val: $('#toolImageCountValue'),  v: 5   },
        { el: $('#toolImageSat'),    val: $('#toolImageSatValue'),    v: 100 },
        { el: $('#toolImageLight'),  val: $('#toolImageLightValue'),  v: 100 },
        { el: $('#toolImageLumaMin'),val: $('#toolImageLumaMinValue'),v: 0   },
        { el: $('#toolImageLumaMax'),val: $('#toolImageLumaMaxValue'),v: 100 },
      ];
      sets.forEach(s => { if (s.el) s.el.value = s.v; if (s.val) s.val.value = s.v; });
      // 同步 luma fill 区域并触发重算
      const lumaFill = $('#toolImageLumaFill');
      const lumaMinEl2 = $('#toolImageLumaMin');
      const lumaMaxEl2 = $('#toolImageLumaMax');
      const minV = lumaMinEl2 ? +lumaMinEl2.value : 0;
      const maxV = lumaMaxEl2 ? +lumaMaxEl2.value : 100;
      if (lumaFill) { lumaFill.style.left = minV + '%'; lumaFill.style.width = (maxV - minV) + '%'; }
      if (imageToolState.img) renderToolImageColors(imageToolState.img);
    });
  }
  // 拖放
  ['dragenter', 'dragover'].forEach(evt => drop.addEventListener(evt, e => {
    e.preventDefault(); e.stopPropagation(); drop.classList.add('is-dragover');
  }));
  ['dragleave', 'drop'].forEach(evt => drop.addEventListener(evt, e => {
    e.preventDefault(); e.stopPropagation(); drop.classList.remove('is-dragover');
  }));
  drop.addEventListener('drop', e => { const f = e.dataTransfer.files[0]; if (f) loadToolImage(f); });
  // 粘贴：Ctrl+V
  document.addEventListener('paste', e => {
    const items = e.clipboardData && e.clipboardData.items;
    if (!items) return;
    for (const item of items) {
      if (item.type && item.type.startsWith('image/')) {
        const file = item.getAsFile();
        if (file) { loadToolImage(file); toast('已从剪贴板粘贴图片'); return; }
      }
    }
  });
}

// HSL 调整：把 hex 转为 HSL，按倍率调整 S/L，再转回 hex
function adjustHsl(hex, sMul, lMul) {
  const c = hex.replace('#','');
  const r = parseInt(c.slice(0,2),16) / 255;
  const g = parseInt(c.slice(2,4),16) / 255;
  const b = parseInt(c.slice(4,6),16) / 255;
  const max = Math.max(r,g,b), min = Math.min(r,g,b);
  let h = 0, s = 0, l = (max + min) / 2;
  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r: h = (g - b) / d + (g < b ? 6 : 0); break;
      case g: h = (b - r) / d + 2; break;
      case b: h = (r - g) / d + 4; break;
    }
    h /= 6;
  }
  s = Math.max(0, Math.min(1, s * sMul));
  l = Math.max(0, Math.min(1, l * lMul));
  // HSL → RGB
  function hue2rgb(p, q, t) {
    if (t < 0) t += 1;
    if (t > 1) t -= 1;
    if (t < 1/6) return p + (q - p) * 6 * t;
    if (t < 1/2) return q;
    if (t < 2/3) return p + (q - p) * (2/3 - t) * 6;
    return p;
  }
  let rr, gg, bb;
  if (s === 0) { rr = gg = bb = l; }
  else {
    const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
    const p = 2 * l - q;
    rr = hue2rgb(p, q, h + 1/3);
    gg = hue2rgb(p, q, h);
    bb = hue2rgb(p, q, h - 1/3);
  }
  const toHex = n => Math.round(n * 255).toString(16).padStart(2, '0');
  return '#' + toHex(rr) + toHex(gg) + toHex(bb);
}

// 图片取色渲染：提取 → 按颜色相似度（CIELAB 最近邻渐变）排序 → 色块行 + 信息区
function renderImageColors(colors, img, countVal) {
  // 使用提取顺序（按占比降序，稳定不变），滑块调整不改变排序
  const sorted = colors;
  const previewEl = $('#toolImagePreview');
  if (previewEl) previewEl.src = img.src;
  // 等布局稳定后把 imgbox 适配到 contain 后的精确尺寸（resize 时也会重算）
  requestAnimationFrame(() => requestAnimationFrame(fitImageBox));
  const results = $('#toolImageResults');
  const previewWrap = $('#toolImagePreviewWrap');
  const empty = $('#toolImageEmpty');
  const panel = $('#toolImagePanel');
  const reupload = $('#toolImageReupload');
  if (results) results.hidden = false;
  if (previewWrap) previewWrap.hidden = false;
  if (empty) empty.hidden = true;
  if (reupload) reupload.hidden = false;
  if (panel) panel.classList.add('is-loaded');
  // 保存色卡到相册
  imageToolState.lastColors = sorted.map(c => c.hex);
  const exportBtn = $('#toolImageExport');
  if (exportBtn) exportBtn.hidden = false;
  // 布局切换为"上传后工作区"（tools.css .image-picker-layout.is-loaded 两列布局依赖此状态）
  const layout = document.querySelector('.image-picker-layout');
  if (layout) layout.classList.add('is-loaded');

  const row = $('#toolImagePalRow');
  const meta = $('#toolImagePalMeta');
  if (!row || !meta) return;

  row.innerHTML = sorted.map(c =>
    `<span class="palette-preview-bar" style="background:${c.hex}" data-hex="${c.hex}"></span>`).join('');

  // 渐变条：由当前色卡按序构成横向渐变
  const stops = sorted.map(c => c.hex).join(', ');
  const gradBar = $('#toolImageGradientBar');
  if (gradBar) gradBar.style.background = `linear-gradient(90deg, ${stops})`;

  meta.innerHTML = sorted.map(c => `
    <span class="pal-meta-item" data-hex="${c.hex}" title="复制 ${c.hex}">
      <span class="pal-meta-dot" style="background:${c.hex}"></span>
      ${c.hex}
    </span>`).join('');

  row.querySelectorAll('.palette-preview-bar').forEach(el => {
    el.addEventListener('click', async () => {
      await copyText(el.dataset.hex);
    });
  });
  meta.querySelectorAll('.pal-meta-item').forEach(el => {
    el.addEventListener('click', async () => {
      await copyText(el.dataset.hex);
    });
  });
}

// 导出色卡：把当前取色结果绘制成 PNG 色卡并下载（展示顺序与结果区一致）
const CHROMA_LOGO_URI = "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTQyIiBoZWlnaHQ9IjY0IiB2aWV3Qm94PSIwIDAgMTQyIDY0IiBmaWxsPSJub25lIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciPjxwYXRoIGQ9Ik0zMiAwQzM4LjE5NzUgNC42NTQwOGUtMDUgNDQuMTg5MSAwLjg4MTY5OSA0OS44NTY2IDIuNTI1NjdDNTUuNDU5OSA0LjE1MTAzIDU5Ljg0ODEgOC41MzkxMiA2MS40NzM3IDE0LjE0MjNDNjMuMTE4MSAxOS44MTA0IDY0IDI1LjgwMjYgNjQgMzIuMDAxQzY0IDM4LjE5ODQgNjMuMTE3OSA0NC4xODk0IDYxLjQ3MzcgNDkuODU2NUM1OS44NDggNTUuNDU5OCA1NS40NTk4IDU5Ljg0OCA0OS44NTY1IDYxLjQ3MzdDNDQuMTg4OCA2My4xMTggMzguMTk3IDY0IDMxLjk5OSA2NEMyNS44MDEzIDY0IDE5LjgwOTggNjMuMTE4NCAxNC4xNDIzIDYxLjQ3NDRDOC41MzkxIDU5Ljg0OSA0LjE1MDk5IDU1LjQ2MDkgMi41MjU2MiA0OS44NTc3QzAuODgxNjIxIDQ0LjE5MDIgMCAzOC4xOTg2IDAgMzIuMDAxQzAgMjUuODAyNyAwLjg4MTU0MyAxOS44MTA0IDIuNTI1NjcgMTQuMTQyM0M0LjE1MDk3IDguNTM5MDggOC41MzkwOSA0LjE1MSAxNC4xNDIzIDIuNTI1NjhDMTkuODEwMSAwLjg4MTYyNSAyNS44MDIyIC0yLjcwOTE2ZS0wNyAzMiAwWiIgZmlsbD0idXJsKCNwYWludDBfbGluZWFyXzE1Ml8xMykiLz48cGF0aCBkPSJNMzIgMTJDMzcuMzA0MyAxMiA0Mi4zOTE0IDE0LjEwNzEgNDYuMTQyMSAxNy44NTc5QzQ5Ljg5MjkgMjEuNjA4NiA1MiAyNi42OTU3IDUyIDMyQzUyIDM3LjMwNDMgNDkuODkyOSA0Mi4zOTE0IDQ2LjE0MjEgNDYuMTQyMUM0Mi4zOTE0IDQ5Ljg5MjkgMzcuMzA0MyA1MiAzMiA1MkMyOC43MzUgNTIgMzAuNzE1IDQ5LjY4MjUgMjcuMDgyNSA0NS45NUMyMy41NzI1IDQyLjM1IDEyIDQ0LjQ4NzUgMTIgMzJDMTIgMjYuNjk1NyAxNC4xMDcxIDIxLjYwODYgMTcuODU3OSAxNy44NTc5QzIxLjYwODYgMTQuMTA3MSAyNi42OTU3IDEyIDMyIDEyWk0zNi4zNzUgMzYuMjVDMzUuMzgwNCAzNi4yNSAzNC40MjY2IDM2LjY0NTEgMzMuNzIzMyAzNy4zNDgzQzMzLjAyMDEgMzguMDUxNiAzMi42MjUgMzkuMDA1NCAzMi42MjUgNDBDMzIuNjI1IDQwLjk5NDYgMzMuMDIwMSA0MS45NDg0IDMzLjcyMzMgNDIuNjUxNkMzNC40MjY2IDQzLjM1NDkgMzUuMzgwNCA0My43NSAzNi4zNzUgNDMuNzVDMzcuMzY5NiA0My43NSAzOC4zMjM0IDQzLjM1NDkgMzkuMDI2NiA0Mi42NTE2QzM5LjcyOTkgNDEuOTQ4NCA0MC4xMjUgNDAuOTk0NiA0MC4xMjUgNDBDNDAuMTI1IDM5LjAwNTQgMzkuNzI5OSAzOC4wNTE2IDM5LjAyNjYgMzcuMzQ4M0MzOC4zMjM0IDM2LjY0NTEgMzcuMzY5NiAzNi4yNSAzNi4zNzUgMzYuMjVaTTQzLjI1IDI4LjI1QzQyLjkyMTcgMjguMjQ5OSA0Mi41OTY1IDI4LjMxNDYgNDIuMjkzMiAyOC40NDAyQzQxLjk4OTggMjguNTY1OCA0MS43MTQyIDI4Ljc0OTkgNDEuNDgyIDI4Ljk4MjFDNDEuMjQ5OCAyOS4yMTQzIDQxLjA2NTYgMjkuNDg5OSA0MC45NCAyOS43OTMyQzQwLjgxNDMgMzAuMDk2NSA0MC43NDk2IDMwLjQyMTcgNDAuNzQ5NiAzMC43NUM0MC43NDk2IDMxLjA3ODMgNDAuODE0MyAzMS40MDM1IDQwLjk0IDMxLjcwNjhDNDEuMDY1NiAzMi4wMTAxIDQxLjI0OTggMzIuMjg1NyA0MS40ODIgMzIuNTE3OUM0MS43MTQyIDMyLjc1MDEgNDEuOTg5OCAzMi45MzQyIDQyLjI5MzIgMzMuMDU5OEM0Mi41OTY1IDMzLjE4NTQgNDIuOTIxNyAzMy4yNSA0My4yNSAzMy4yNUM0My45MTMgMzMuMjQ5OSA0NC41NDg4IDMyLjk4NjUgNDUuMDE3NSAzMi41MTc2QzQ1LjQ4NjMgMzIuMDQ4OCA0NS43NDk2IDMxLjQxMyA0NS43NDk2IDMwLjc1QzQ1Ljc0OTYgMzAuMDg3IDQ1LjQ4NjMgMjkuNDUxMiA0NS4wMTc1IDI4Ljk4MjRDNDQuNTQ4OCAyOC41MTM1IDQzLjkxMyAyOC4yNTAxIDQzLjI1IDI4LjI1Wk0zOS41IDIyQzM4LjgzNyAyMiAzOC4yMDExIDIyLjI2MzQgMzcuNzMyMiAyMi43MzIyQzM3LjI2MzQgMjMuMjAxMSAzNyAyMy44MzcgMzcgMjQuNUMzNyAyNS4xNjMgMzcuMjYzNCAyNS43OTg5IDM3LjczMjIgMjYuMjY3OEMzOC4yMDExIDI2LjczNjYgMzguODM3IDI3IDM5LjUgMjdDNDAuMTYzIDI3IDQwLjc5ODkgMjYuNzM2NiA0MS4yNjc4IDI2LjI2NzhDNDEuNzM2NiAyNS43OTg5IDQyIDI1LjE2MyA0MiAyNC41QzQyIDIzLjgzNyA0MS43MzY2IDIzLjIwMTEgNDEuMjY3OCAyMi43MzIyQzQwLjc5ODkgMjIuMjYzNCA0MC4xNjMgMjIgMzkuNSAyMlpNMjUuMTI1IDIxLjI1QzI0LjQ2MiAyMS4yNSAyMy44MjYxIDIxLjUxMzQgMjMuMzU3MiAyMS45ODIyQzIyLjg4ODQgMjIuNDUxMSAyMi42MjUgMjMuMDg3IDIyLjYyNSAyMy43NUMyMi42MjUgMjQuNDEzIDIyLjg4ODQgMjUuMDQ4OSAyMy4zNTcyIDI1LjUxNzhDMjMuODI2MSAyNS45ODY2IDI0LjQ2MiAyNi4yNSAyNS4xMjUgMjYuMjVDMjUuNzg4IDI2LjI1IDI2LjQyMzkgMjUuOTg2NiAyNi44OTI4IDI1LjUxNzhDMjcuMzYxNiAyNS4wNDg5IDI3LjYyNSAyNC40MTMgMjcuNjI1IDIzLjc1QzI3LjYyNSAyMy4wODcgMjcuMzYxNiAyMi40NTExIDI2Ljg5MjggMjEuOTgyMkMyNi40MjM5IDIxLjUxMzQgMjUuNzg4IDIxLjI1IDI1LjEyNSAyMS4yNVpNMzIuNjI1IDE4Ljg3NUMzMi4yOTY3IDE4Ljg3NDkgMzEuOTcxNSAxOC45Mzk2IDMxLjY2ODIgMTkuMDY1MkMzMS4zNjQ4IDE5LjE5MDggMzEuMDg5MiAxOS4zNzQ5IDMwLjg1NyAxOS42MDcxQzMwLjYyNDggMTkuODM5MiAzMC40NDA2IDIwLjExNDkgMzAuMzE1IDIwLjQxODJDMzAuMTg5MyAyMC43MjE1IDMwLjEyNDYgMjEuMDQ2NyAzMC4xMjQ2IDIxLjM3NUMzMC4xMjQ2IDIxLjcwMzMgMzAuMTg5MyAyMi4wMjg1IDMwLjMxNSAyMi4zMzE4QzMwLjQ0MDYgMjIuNjM1MSAzMC42MjQ4IDIyLjkxMDggMzAuODU3IDIzLjE0MjlDMzEuMDg5MiAyMy4zNzUxIDMxLjM2NDggMjMuNTU5MiAzMS42NjgyIDIzLjY4NDhDMzEuOTcxNSAyMy44MTA0IDMyLjI5NjcgMjMuODc1MSAzMi42MjUgMjMuODc1QzMzLjI4OCAyMy44NzQ5IDMzLjkyMzggMjMuNjExNSAzNC4zOTI1IDIzLjE0MjZDMzQuODYxMyAyMi42NzM4IDM1LjEyNDYgMjIuMDM4IDM1LjEyNDYgMjEuMzc1QzM1LjEyNDYgMjAuNzEyIDM0Ljg2MTMgMjAuMDc2MiAzNC4zOTI1IDE5LjYwNzRDMzMuOTIzOCAxOS4xMzg1IDMzLjI4OCAxOC44NzUxIDMyLjYyNSAxOC44NzVaIiBmaWxsPSJ3aGl0ZSIvPjxwYXRoIGQ9Ik0xMzIuNDA5IDU3LjQxNTlMMTMxLjI1MSA1Ni40NTJDMTMwLjc4MiA1Ni4wNjI2IDEzMC41NDggNTUuNTg1NiAxMzAuNTQ4IDU1LjAyMDlWNDQuNzM5OEMxMzAuNTQ4IDQzLjk2MSAxMzEuMDE2IDQzLjU3MTUgMTMxLjk1MyA0My41NzE1SDEzMi4zMzlDMTMzLjI3NSA0My41NzE1IDEzMy43NDMgNDMuOTYxIDEzMy43NDMgNDQuNzM5OFY1NC4xNzM5QzEzMy43NDMgNTQuOTUyNyAxMzQuMjExIDU1LjM0MjIgMTM1LjE0OCA1NS4zNDIySDEzNy4zOTVDMTM4LjMzMSA1NS4zNDIyIDEzOC43OTkgNTQuOTUyNyAxMzguNzk5IDU0LjE3MzlWNDQuNzM5OEMxMzguNzk5IDQzLjk2MSAxMzkuMjY3IDQzLjU3MTUgMTQwLjIwNCA0My41NzE1SDE0MC41OUMxNDEuNTI2IDQzLjU3MTUgMTQxLjk5NCA0My45NjEgMTQxLjk5NCA0NC43Mzk4VjU1LjAyMDlDMTQyLjA0MSA1NS41NjYxIDE0MS44MDcgNTYuMDUyOSAxNDEuMjkyIDU2LjQ4MTJMMTQwLjE2OCA1Ny40MTU5QzEzOS43IDU3LjgwNTMgMTM5LjEyNyA1OCAxMzguNDQ4IDU4SDEzNC4xM0MxMzMuNDUxIDU4IDEzMi44NzcgNTcuODA1MyAxMzIuNDA5IDU3LjQxNTlaIiBmaWxsPSIjMTExMTExIi8+PHBhdGggZD0iTTExNy4xNDMgNTcuNDE1OEwxMTUuOTg1IDU2LjQ1MkMxMTUuNTE3IDU2LjA2MjUgMTE1LjI4MiA1NS41ODU1IDExNS4yODIgNTUuMDIwOFY0Ni41MjE0QzExNS4yODIgNDUuOTU2NyAxMTUuNTE3IDQ1LjQ3OTcgMTE1Ljk4NSA0NS4wOTAyTDExNy4xMDggNDQuMTU1NkMxMTcuNTc2IDQzLjc2NjIgMTE4LjE2MSA0My41NzE0IDExOC44NjQgNDMuNTcxNEgxMjIuMDk0QzEyMy4wMyA0My41NzE0IDEyMy40OTggNDMuMTgyIDEyMy40OTggNDIuNDAzMVYzOC4xNjgxQzEyMy40OTggMzcuMzg5MiAxMjMuOTY2IDM2Ljk5OTggMTI0LjkwMyAzNi45OTk4SDEyNS4yODlDMTI2LjIyNSAzNi45OTk4IDEyNi42OTMgMzcuMzg5MiAxMjYuNjkzIDM4LjE2ODFWNTYuODMxN0MxMjYuNjkzIDU3LjYxMDUgMTI2LjIyNSA1OCAxMjUuMjg5IDU4SDExOC44NjRDMTE4LjE4NSA1OCAxMTcuNjExIDU3LjgwNTIgMTE3LjE0MyA1Ny40MTU4Wk0xMTguNDc3IDU0LjE3MzhDMTE4LjQ3NyA1NC45NTI2IDExOC45NDYgNTUuMzQyMSAxMTkuODgyIDU1LjM0MjFIMTIyLjA5NEMxMjMuMDMgNTUuMzQyMSAxMjMuNDk4IDU0Ljk1MjYgMTIzLjQ5OCA1NC4xNzM4VjQ3LjM5NzZDMTIzLjQ5OCA0Ni42MTg4IDEyMy4wMyA0Ni4yMjkzIDEyMi4wOTQgNDYuMjI5M0gxMTkuODgyQzExOC45NDYgNDYuMjI5MyAxMTguNDc3IDQ2LjYxODggMTE4LjQ3NyA0Ny4zOTc2VjU0LjE3MzhaIiBmaWxsPSIjMTExMTExIi8+PHBhdGggZD0iTTEwMi4xOTMgNTcuMzU3NUwxMDEuMDcgNTYuNDIyOEMxMDAuNjAyIDU2LjAzMzQgMTAwLjM2OCA1NS41NTYzIDEwMC4zNjggNTQuOTkxN1Y0Ni41MjE1QzEwMC4zNjggNDUuOTU2OCAxMDAuNjAyIDQ1LjQ3OTggMTAxLjA3IDQ1LjA5MDNMMTAyLjE5MyA0NC4xNTU3QzEwMi42NjIgNDMuNzY2MiAxMDMuMjM1IDQzLjU3MTUgMTAzLjkxNCA0My41NzE1SDEwOC4yMzJDMTA4LjkxMSA0My41NzE1IDEwOS40ODUgNDMuNzY2MiAxMDkuOTUzIDQ0LjE1NTdMMTExLjA3NiA0NS4wOTAzQzExMS41NDQgNDUuNDc5OCAxMTEuNzc4IDQ1Ljk1NjggMTExLjc3OCA0Ni41MjE1VjUxLjM5OTFDMTExLjc3OCA1Mi4xNzggMTExLjMxIDUyLjU2NzQgMTEwLjM3NCA1Mi41Njc0SDEwNC45NjdDMTA0LjAzMSA1Mi41Njc0IDEwMy41NjMgNTIuOTU2OSAxMDMuNTYzIDUzLjczNTdWNTQuMTQ0NkMxMDMuNTYzIDU0LjkyMzUgMTA0LjAzMSA1NS4zMTMgMTA0Ljk2NyA1NS4zMTNIMTEwLjM3NEMxMTEuMzEgNTUuMzEzIDExMS43NzggNTUuNzAyNCAxMTEuNzc4IDU2LjQ4MTJWNTYuODAyNUMxMTEuNzc4IDU3LjU4MTQgMTExLjMxIDU3Ljk3MDggMTEwLjM3NCA1Ny45NzA4SDEwMy45MTRDMTAzLjI1OCA1Ny45NzA4IDEwMi42ODUgNTcuNzY2NCAxMDIuMTkzIDU3LjM1NzVaTTEwMy41NjMgNDkuMDYyNUMxMDMuNTYzIDQ5Ljg0MTQgMTA0LjAzMSA1MC4yMzA4IDEwNC45NjcgNTAuMjMwOEgxMDcuMTc5QzEwOC4xMTUgNTAuMjMwOCAxMDguNTgzIDQ5Ljg0MTQgMTA4LjU4MyA0OS4wNjI1VjQ3LjM2ODVDMTA4LjU4MyA0Ni41ODk2IDEwOC4xMTUgNDYuMjAwMiAxMDcuMTc5IDQ2LjIwMDJIMTA0Ljk2N0MxMDQuMDMxIDQ2LjIwMDIgMTAzLjU2MyA0Ni41ODk2IDEwMy41NjMgNDcuMzY4NVY0OS4wNjI1WiIgZmlsbD0iIzExMTExMSIvPjxwYXRoIGQ9Ik04Ny4yNzg2IDU3LjM1NzVMODYuMTU1MSA1Ni40MjI4Qzg1LjY4NjkgNTYuMDMzNCA4NS40NTI5IDU1LjU1NjMgODUuNDUyOSA1NC45OTE3VjQ2LjUyMTVDODUuNDUyOSA0NS45NTY4IDg1LjY4NjkgNDUuNDc5OCA4Ni4xNTUxIDQ1LjA5MDNMODcuMjc4NiA0NC4xNTU3Qzg3Ljc0NjcgNDMuNzY2MiA4OC4zMjAyIDQzLjU3MTUgODguOTk5IDQzLjU3MTVIOTMuMzE3NUM5My45OTYzIDQzLjU3MTUgOTQuNTY5NyA0My43NjYyIDk1LjAzNzkgNDQuMTU1N0w5Ni4xNjE0IDQ1LjA5MDNDOTYuNjI5NSA0NS40Nzk4IDk2Ljg2MzYgNDUuOTU2OCA5Ni44NjM2IDQ2LjUyMTVWNTEuMzk5MUM5Ni44NjM2IDUyLjE3OCA5Ni4zOTU0IDUyLjU2NzQgOTUuNDU5MiA1Mi41Njc0SDkwLjA1MjNDODkuMTE2IDUyLjU2NzQgODguNjQ3OSA1Mi45NTY5IDg4LjY0NzkgNTMuNzM1N1Y1NC4xNDQ2Qzg4LjY0NzkgNTQuOTIzNSA4OS4xMTYgNTUuMzEzIDkwLjA1MjMgNTUuMzEzSDk1LjQ1OTJDOTYuMzk1NCA1NS4zMTMgOTYuODYzNiA1NS43MDI0IDk2Ljg2MzYgNTYuNDgxMlY1Ni44MDI1Qzk2Ljg2MzYgNTcuNTgxNCA5Ni4zOTU0IDU3Ljk3MDggOTUuNDU5MiA1Ny45NzA4SDg4Ljk5OUM4OC4zNDM2IDU3Ljk3MDggODcuNzcwMSA1Ny43NjY0IDg3LjI3ODYgNTcuMzU3NVpNODguNjQ3OSA0OS4wNjI1Qzg4LjY0NzkgNDkuODQxNCA4OS4xMTYgNTAuMjMwOCA5MC4wNTIzIDUwLjIzMDhIOTIuMjY0MkM5My4yMDA0IDUwLjIzMDggOTMuNjY4NiA0OS44NDE0IDkzLjY2ODYgNDkuMDYyNVY0Ny4zNjg1QzkzLjY2ODYgNDYuNTg5NiA5My4yMDA0IDQ2LjIwMDIgOTIuMjY0MiA0Ni4yMDAySDkwLjA1MjNDODkuMTE2IDQ2LjIwMDIgODguNjQ3OSA0Ni41ODk2IDg4LjY0NzkgNDcuMzY4NVY0OS4wNjI1WiIgZmlsbD0iIzExMTExMSIvPjxwYXRoIGQ9Ik02OC43MzcyIDU2LjQ1MThDNjguMjY5MSA1Ni4wNjI0IDY4LjAzNSA1NS41ODU0IDY4LjAzNSA1NS4wMjA3VjUyLjI3NTJDNjguMDM1IDUxLjQ5NjMgNjguNTAzMiA1MS4xMDY5IDY5LjQzOTQgNTEuMTA2OUg2OS44MjU2QzcwLjc2MTkgNTEuMTA2OSA3MS4yMyA1MS40OTYzIDcxLjIzIDUyLjI3NTJWNTQuMTczN0M3MS4yMyA1NC45NTI1IDcxLjY5ODIgNTUuMzQyIDcyLjYzNDQgNTUuMzQySDc3LjMzOTFDNzguMjc1NCA1NS4zNDIgNzguNzQzNSA1NC45NTI1IDc4Ljc0MzUgNTQuMTczN1Y0OS45MDk0Qzc4Ljc0MzUgNDkuMTMwNSA3OC4yNzU0IDQ4Ljc0MTEgNzcuMzM5MSA0OC43NDExSDcxLjYxNjJDNzAuOTE0IDQ4Ljc0MTEgNzAuMzI4OSA0OC41NDYzIDY5Ljg2MDggNDguMTU2OUw2OC43MzcyIDQ3LjIyMjNDNjguMjY5MSA0Ni44MzI4IDY4LjAzNSA0Ni4zNTU4IDY4LjAzNSA0NS43OTExVjM5Ljg2MkM2OC4wMTE2IDM5LjI5NzMgNjguMjQ1NyAzOC44MTA1IDY4LjczNzIgMzguNDAxNkw2OS44NjA4IDM3LjQ2N0M3MC4zMjg5IDM3LjA3NzUgNzAuOTAyMyAzNi44ODI4IDcxLjU4MTEgMzYuODgyOEg3OC4zOTI0Qzc5LjA0NzggMzYuODgyOCA3OS42MjEzIDM3LjA4NzMgODAuMTEyOCAzNy40OTYyTDgxLjIzNjMgMzguNDMwOEM4MS43MDQ1IDM4LjgyMDIgODEuOTM4NSAzOS4yOTczIDgxLjkzODUgMzkuODYyVjQyLjYwNzVDODEuOTM4NSA0My4zODY0IDgxLjQ3MDQgNDMuNzc1OCA4MC41MzQxIDQzLjc3NThIODAuMTQ3OUM3OS4yMTE3IDQzLjc3NTggNzguNzQzNSA0My4zODY0IDc4Ljc0MzUgNDIuNjA3NVY0MC43MDlDNzguNzQzNSAzOS45MzAxIDc4LjI3NTQgMzkuNTQwNyA3Ny4zMzkxIDM5LjU0MDdINzIuNjM0NEM3MS42OTgyIDM5LjU0MDcgNzEuMjMgMzkuOTMwMSA3MS4yMyA0MC43MDlWNDQuOTQ0MUM3MS4yMyA0NS43MjMgNzEuNjk4MiA0Ni4xMTI0IDcyLjYzNDQgNDYuMTEyNEg3OC4zOTI0Qzc5LjA3MTIgNDYuMTEyNCA3OS42NDQ3IDQ2LjMwNzEgODAuMTEyOCA0Ni42OTY1TDgxLjIzNjMgNDcuNjMxMkM4MS43MDQ1IDQ4LjAyMDYgODEuOTM4NSA0OC40OTc3IDgxLjkzODUgNDkuMDYyM1Y1NS4wMjA3QzgxLjk4NTMgNTUuNTY1OSA4MS43NTEzIDU2LjA1MjcgODEuMjM2MyA1Ni40ODExTDgwLjExMjggNTcuNDE1N0M3OS42NDQ3IDU3LjgwNTEgNzkuMDcxMiA1Ny45OTk4IDc4LjM5MjQgNTcuOTk5OEg3MS42MTYyQzcwLjkzNzUgNTcuOTk5OCA3MC4zNjQgNTcuODA1MSA2OS44OTU5IDU3LjQxNTdMNjguNzM3MiA1Ni40NTE4WiIgZmlsbD0iIzExMTExMSIvPjxwYXRoIGQ9Ik05Ny4yMzQxIDkuNDE3MjhDOTYuOTA2NSA5LjQxNzI4IDk2LjYxMzkgOS4zMTk5MiA5Ni4zNTY0IDkuMTI1MkM5Ni4xMjIzIDguOTMwNDkgOTYuMDA1MyA4LjY4NzA5IDk2LjAwNTMgOC4zOTUwMVY4LjAxNTMyQzk2LjAwNTMgNy43NDI3MSA5Ni4xMjIzIDcuNTA5MDUgOTYuMzU2NCA3LjMxNDM0Qzk2LjYxMzkgNy4xMDAxNSA5Ni45MDY1IDYuOTkzMDUgOTcuMjM0MSA2Ljk5MzA1SDExMy44NDFDMTE0LjE5MiA2Ljk5MzA1IDExNC40ODUgNi45NDQzOCAxMTQuNzE5IDYuODQ3MDJDMTE0Ljk1MyA2Ljc0OTY2IDExNS4wNyA2LjYzMjgzIDExNS4wNyA2LjQ5NjUzQzExNS4wNyA2LjM2MDIzIDExNS4xODcgNi4yNDM0IDExNS40MjEgNi4xNDYwNEMxMTUuNjU1IDYuMDQ4NjggMTE1Ljk0OCA2IDExNi4yOTkgNkgxMTcuMDM2QzExNy4zODcgNiAxMTcuNjggNi4wNjgxNSAxMTcuOTE0IDYuMjA0NDVDMTE4LjE0OCA2LjM0MDc1IDExOC4yNjUgNi41MzU0NyAxMTguMjY1IDYuNzg4NkMxMTguMjY1IDcuMjk0ODcgMTE3Ljk3MiA3Ljc3MTkyIDExNy4zODcgOC4yMTk3N0wxMTYuNzIgOC43MTYzQzExNi4xMTIgOS4xODM2MiAxMTUuMzk4IDkuNDE3MjggMTE0LjU3OCA5LjQxNzI4SDk3LjIzNDFaTTk1LjkzNTEgMzIuODEyNUM5NS42MzA4IDMyLjgxMjUgOTUuMzczMyAzMi43MDU0IDk1LjE2MjcgMzIuNDkxMkM5NC45NTIgMzIuMjk2NSA5NC44NDY3IDMyLjA2MjggOTQuODQ2NyAzMS43OTAyVjMxLjE0NzdDOTQuODQ2NyAzMC44NTU2IDk0Ljg5MzUgMzAuNjEyMiA5NC45ODcxIDMwLjQxNzVDOTUuMTA0MiAzMC4yMjI4IDk1LjI0NDYgMzAuMTI1NCA5NS40MDg0IDMwLjEyNTRDOTUuNTQ4OSAzMC4xMjU0IDk1LjY3NzYgMzAuMDI4IDk1Ljc5NDYgMjkuODMzM0M5NS45MTE3IDI5LjYzODYgOTUuOTcwMiAyOS4zOTUyIDk1Ljk3MDIgMjkuMTAzMVYxMS4zMTU4Qzk1Ljk3MDIgMTEuMDQzMiA5Ni4wODcyIDEwLjgwOTUgOTYuMzIxMyAxMC42MTQ4Qzk2LjU3ODggMTAuNDIwMSA5Ni44NzEzIDEwLjMyMjcgOTcuMTk5IDEwLjMyMjdIMTE3LjAzNkMxMTcuMzg3IDEwLjMyMjcgMTE3LjY4IDEwLjQyMDEgMTE3LjkxNCAxMC42MTQ4QzExOC4xNDggMTAuODA5NSAxMTguMjY1IDExLjA0MzIgMTE4LjI2NSAxMS4zMTU4VjExLjk4NzVDMTE4LjI2NSAxMi4yNjAxIDExOC4xNDggMTIuNDkzOCAxMTcuOTE0IDEyLjY4ODVDMTE3LjY4IDEyLjg4MzIgMTE3LjM4NyAxMi45ODA2IDExNy4wMzYgMTIuOTgwNkgxMDAuNTM0QzEwMC4yMDcgMTIuOTgwNiA5OS45MTQyIDEzLjA4NzcgOTkuNjU2NyAxMy4zMDE5Qzk5LjQyMjcgMTMuNDk2NiA5OS4zMDU2IDEzLjczMDMgOTkuMzA1NiAxNC4wMDI5VjI5LjcxNjVDOTkuMzA1NiAzMC4zOTggOTkuMDEzIDMwLjk4MjIgOTguNDI3OSAzMS40Njg5TDk3LjcyNTcgMzIuMDgyM0M5Ny4xNDA1IDMyLjU2OTEgOTYuNTQzNyAzMi44MTI1IDk1LjkzNTEgMzIuODEyNVpNMTAyLjA3OSAyMC4xMDcyVjE4LjE1MDNDMTAyLjA3OSAxNy44Nzc3IDEwMS45ODYgMTcuNjQ0MSAxMDEuNzk4IDE3LjQ0OTNDMTAxLjYzNSAxNy4yMzUyIDEwMS40MjQgMTcuMTI4MSAxMDEuMTY2IDE3LjEyODFDMTAwLjkwOSAxNy4xMjgxIDEwMC42ODcgMTcuMDMwNyAxMDAuNDk5IDE2LjgzNkMxMDAuMzM2IDE2LjYyMTggMTAwLjI1NCAxNi4zNzg0IDEwMC4yNTQgMTYuMTA1OFYxNS43MjYxQzEwMC4yNTQgMTUuNDUzNSAxMDAuMzM2IDE1LjIxOTggMTAwLjQ5OSAxNS4wMjUxQzEwMC42ODcgMTQuODMwNCAxMDAuOTA5IDE0LjczMyAxMDEuMTY2IDE0LjczM0MxMDEuNDI0IDE0LjczMyAxMDEuNjM1IDE0LjY4NDQgMTAxLjc5OCAxNC41ODdDMTAxLjk4NiAxNC40NzAyIDEwMi4wNzkgMTQuMzMzOSAxMDIuMDc5IDE0LjE3ODFDMTAyLjA3OSAxNC4wNDE4IDEwMi4xOTYgMTMuOTM0NyAxMDIuNDMgMTMuODU2OEMxMDIuNjY0IDEzLjc1OTUgMTAyLjk0NSAxMy43MTA4IDEwMy4yNzMgMTMuNzEwOEgxMDQuMDgxQzEwNC40MDggMTMuNzEwOCAxMDQuNjg5IDEzLjc1OTUgMTA0LjkyMyAxMy44NTY4QzEwNS4xNTcgMTMuOTM0NyAxMDUuMjc0IDE0LjA0MTggMTA1LjI3NCAxNC4xNzgxQzEwNS4yNzQgMTQuMzMzOSAxMDUuMzkxIDE0LjQ3MDIgMTA1LjYyNSAxNC41ODdDMTA1Ljg4MyAxNC42ODQ0IDEwNi4xNzUgMTQuNzMzIDEwNi41MDMgMTQuNzMzSDExMi4wMTVDMTEyLjM2NiAxNC43MzMgMTEyLjY1OSAxNC42ODQ0IDExMi44OTMgMTQuNTg3QzExMy4xNTEgMTQuNDcwMiAxMTMuMjc5IDE0LjMzMzkgMTEzLjI3OSAxNC4xNzgxQzExMy4yNzkgMTQuMDQxOCAxMTMuMzk2IDEzLjkzNDcgMTEzLjYzIDEzLjg1NjhDMTEzLjg2NCAxMy43NTk1IDExNC4xNTcgMTMuNzEwOCAxMTQuNTA4IDEzLjcxMDhIMTE1LjI0NUMxMTUuNTk3IDEzLjcxMDggMTE1Ljg4OSAxMy43NTk1IDExNi4xMjMgMTMuODU2OEMxMTYuMzgxIDEzLjkzNDcgMTE2LjUwOSAxNC4wNDE4IDExNi41MDkgMTQuMTc4MUMxMTYuNTA5IDE0LjU0ODEgMTE2LjgwMiAxNC43MzMgMTE3LjM4NyAxNC43MzNDMTE3LjY0NSAxNC43MzMgMTE3Ljg1NSAxNC44MzA0IDExOC4wMTkgMTUuMDI1MUMxMTguMTgzIDE1LjIwMDQgMTE4LjI2NSAxNS40MzQgMTE4LjI2NSAxNS43MjYxVjE2LjEwNThDMTE4LjI2NSAxNi4zOTc5IDExOC4xODMgMTYuNjQxMyAxMTguMDE5IDE2LjgzNkMxMTcuODU1IDE3LjAzMDcgMTE3LjY0NSAxNy4xMjgxIDExNy4zODcgMTcuMTI4MUMxMTcuMTMgMTcuMTI4MSAxMTYuOTE5IDE3LjIyNTQgMTE2Ljc1NSAxNy40MjAxQzExNi41OTEgMTcuNjE0OSAxMTYuNTA5IDE3Ljg1ODIgMTE2LjUwOSAxOC4xNTAzQzExNi41MDkgMTguNDYxOSAxMTYuNDE2IDE4Ljc3MzQgMTE2LjIyOSAxOS4wODVDMTE2LjA2NSAxOS4zOTY1IDExNS44NTQgMTkuNjU5NCAxMTUuNTk3IDE5Ljg3MzZMMTE0LjkyOSAyMC40NTc3QzExNC42NzIgMjAuNjcxOSAxMTQuMzQ0IDIwLjg0NzEgMTEzLjk0NiAyMC45ODM1QzExMy41NDggMjEuMTAwMyAxMTMuMTYyIDIxLjE1ODcgMTEyLjc4OCAyMS4xNTg3SDEwMy4yNzNDMTAyLjk0NSAyMS4xNTg3IDEwMi42NjQgMjEuMDYxMyAxMDIuNDMgMjAuODY2NkMxMDIuMTk2IDIwLjY1MjQgMTAyLjA3OSAyMC4zOTkzIDEwMi4wNzkgMjAuMTA3MlpNMTA1LjI3NCAxNy45MTY3QzEwNS4yNzQgMTguMTUwMyAxMDUuMzkxIDE4LjM1NDggMTA1LjYyNSAxOC41M0MxMDUuODgzIDE4LjY4NTggMTA2LjE3NSAxOC43NjM3IDEwNi41MDMgMTguNzYzN0gxMTIuMDE1QzExMi4zNjYgMTguNzYzNyAxMTIuNjU5IDE4LjY4NTggMTEyLjg5MyAxOC41M0MxMTMuMTUxIDE4LjM1NDggMTEzLjI3OSAxOC4xNTAzIDExMy4yNzkgMTcuOTE2N0MxMTMuMjc5IDE3LjY4MyAxMTMuMTUxIDE3LjQ5OCAxMTIuODkzIDE3LjM2MTdDMTEyLjY1OSAxNy4yMDU5IDExMi4zNjYgMTcuMTI4MSAxMTIuMDE1IDE3LjEyODFIMTA2LjUwM0MxMDYuMTUyIDE3LjEyODEgMTA1Ljg1OSAxNy4yMDU5IDEwNS42MjUgMTcuMzYxN0MxMDUuMzkxIDE3LjQ5OCAxMDUuMjc0IDE3LjY4MyAxMDUuMjc0IDE3LjkxNjdaTTExMi42ODIgMzIuMzc0NEwxMTAuMjYgMzEuNDY4OUMxMDkuNTM0IDMxLjIxNTggMTA4LjgwOSAzMS4yMTU4IDEwOC4wODMgMzEuNDY4OUwxMDUuODAxIDMyLjM3NDRDMTA1LjUyIDMyLjUxMDcgMTA1LjE0NiAzMi42MTc4IDEwNC42NzcgMzIuNjk1N0MxMDQuMjMzIDMyLjc3MzUgMTAzLjgzNSAzMi44MTI1IDEwMy40ODQgMzIuODEyNUgxMDEuNDgyQzEwMS4xMzEgMzIuODEyNSAxMDAuODM5IDMyLjcwNTQgMTAwLjYwNSAzMi40OTEyQzEwMC4zNzEgMzIuMjk2NSAxMDAuMjU0IDMyLjA2MjggMTAwLjI1NCAzMS43OTAyVjMxLjE0NzdDMTAwLjI1NCAzMC44NTU2IDEwMC4zNzEgMzAuNjEyMiAxMDAuNjA1IDMwLjQxNzVDMTAwLjgzOSAzMC4yMjI4IDEwMS4xMzEgMzAuMTI1NCAxMDEuNDgyIDMwLjEyNTRIMTAyLjU3MUMxMDMuNTA3IDMwLjEyNTQgMTA0LjIwOSAzMC4wMjggMTA0LjY3NyAyOS44MzMzQzEwNC44NjUgMjkuNzc0OSAxMDQuOTU4IDI5LjY4NzMgMTA0Ljk1OCAyOS41NzA1QzEwNC45NTggMjkuMzc1NyAxMDQuNzcxIDI5LjIxMDIgMTA0LjM5NyAyOS4wNzM5TDEwMi40MyAyOC4yODUzQzEwMi4xMjYgMjguMTQ5IDEwMS44NTcgMjcuOTQ0NiAxMDEuNjIzIDI3LjY3MkMxMDEuNDEyIDI3LjM3OTkgMTAxLjMwNyAyNy4wOTc2IDEwMS4zMDcgMjYuODI1VjI2LjUzMjlDMTAxLjMwNyAyNi4yNDA4IDEwMS40MjQgMjUuOTk3NCAxMDEuNjU4IDI1LjgwMjdDMTAxLjkxNSAyNS41ODg1IDEwMi4yMDggMjUuNDgxNCAxMDIuNTM2IDI1LjQ4MTRIMTAzLjMwOEMxMDMuNjU5IDI1LjQ4MTQgMTAzLjk1MiAyNS41MzAxIDEwNC4xODYgMjUuNjI3NEMxMDQuNDIgMjUuNzI0OCAxMDQuNTM3IDI1Ljg0MTYgMTA0LjUzNyAyNS45Nzc5QzEwNC41MzcgMjYuMTE0MiAxMDQuNjQyIDI2LjI3OTcgMTA0Ljg1MyAyNi40NzQ1QzEwNS4wODcgMjYuNjQ5NyAxMDUuMzY4IDI2Ljc4NiAxMDUuNjk2IDI2Ljg4MzRMMTA4LjA4MyAyNy43NTk2QzEwOC4zODcgMjcuODk1OSAxMDguNzc0IDI3Ljk2NCAxMDkuMjQyIDI3Ljk2NEMxMDkuNjg2IDI3Ljk2NCAxMTAuMDYxIDI3LjkwNTYgMTEwLjM2NSAyNy43ODg4TDExMi45NjMgMjYuODU0MkMxMTMuMjY4IDI2Ljc1NjggMTEzLjUyNSAyNi41ODE2IDExMy43MzYgMjYuMzI4NEMxMTMuOTcgMjYuMDc1MyAxMTQuMDg3IDI1LjgzMTkgMTE0LjA4NyAyNS41OTgyQzExNC4wODcgMjUuMzI1NiAxMTMuOTcgMjUuMTAxNyAxMTMuNzM2IDI0LjkyNjVDMTEzLjUwMiAyNC43NTEyIDExMy4yMDkgMjQuNjYzNiAxMTIuODU4IDI0LjY2MzZIMTAyLjUwMUMxMDIuMTczIDI0LjY2MzYgMTAxLjg4IDI0LjU2NjIgMTAxLjYyMyAyNC4zNzE1QzEwMS4zODkgMjQuMTc2OCAxMDEuMjcyIDIzLjk0MzEgMTAxLjI3MiAyMy42NzA1VjIzLjI5MDhDMTAxLjI3MiAyMy4wMTgyIDEwMS4zODkgMjIuNzc0OCAxMDEuNjIzIDIyLjU2MDdDMTAxLjg4IDIyLjM0NjUgMTAyLjE3MyAyMi4yMzk0IDEwMi41MDEgMjIuMjM5NEgxMTYuMDg4QzExNi40MTYgMjIuMjM5NCAxMTYuNjk3IDIyLjM0NjUgMTE2LjkzMSAyMi41NjA3QzExNy4xODggMjIuNzc0OCAxMTcuMzE3IDIzLjAxODIgMTE3LjMxNyAyMy4yOTA4VjI2LjgyNUMxMTcuMzE3IDI3LjA5NzYgMTE3LjIgMjcuMzc5OSAxMTYuOTY2IDI3LjY3MkMxMTYuNzU1IDI3Ljk0NDYgMTE2LjQ4NiAyOC4xNDkgMTE2LjE1OCAyOC4yODUzTDExNC4xNTcgMjkuMDczOUMxMTMuNzgzIDI5LjIxMDIgMTEzLjU5NSAyOS4zNzU3IDExMy41OTUgMjkuNTcwNUMxMTMuNTk1IDI5LjY4NzMgMTEzLjcwMSAyOS43NzQ5IDExMy45MTEgMjkuODMzM0MxMTQuMjg2IDMwLjAyOCAxMTQuOTY1IDMwLjEyNTQgMTE1Ljk0OCAzMC4xMjU0SDExNy4wMzZDMTE3LjM4NyAzMC4xMjU0IDExNy42OCAzMC4yMjI4IDExNy45MTQgMzAuNDE3NUMxMTguMTQ4IDMwLjYxMjIgMTE4LjI2NSAzMC44NTU2IDExOC4yNjUgMzEuMTQ3N1YzMS43OTAyQzExOC4yNjUgMzIuMDYyOCAxMTguMTQ4IDMyLjI5NjUgMTE3LjkxNCAzMi40OTEyQzExNy42OCAzMi43MDU0IDExNy4zODcgMzIuODEyNSAxMTcuMDM2IDMyLjgxMjVIMTE1QzExNC42NDkgMzIuODEyNSAxMTQuMjM5IDMyLjc3MzUgMTEzLjc3MSAzMi42OTU3QzExMy4zMjYgMzIuNjE3OCAxMTIuOTYzIDMyLjUxMDcgMTEyLjY4MiAzMi4zNzQ0WiIgZmlsbD0iIzExMTExMSIvPjxwYXRoIGQ9Ik02OS43MjA0IDMyLjA4MjNMNjguODQyNiAzMS4zNTIxQzY4LjYwODYgMzEuMTc2OSA2OC40MDk2IDMwLjkxNCA2OC4yNDU4IDMwLjU2MzVDNjguMDgxOSAzMC4yMzI1IDY4IDI5LjkzMDcgNjggMjkuNjU4MVYxNC40NDFDNjggMTQuMTY4NCA2OC4xMTcgMTMuOTM0NyA2OC4zNTExIDEzLjc0QzY4LjU4NTIgMTMuNTQ1MyA2OC44NjYgMTMuNDQ3OSA2OS4xOTM3IDEzLjQ0NzlIODQuNzEyM0M4NS4wNCAxMy40NDc5IDg1LjMyMDggMTMuMzUwNiA4NS41NTQ5IDEzLjE1NThDODUuNzg5IDEyLjk0MTYgODUuOTA2IDEyLjY5ODMgODUuOTA2IDEyLjQyNTdWMTAuOTY1M0M4NS45MDYgMTAuNjkyNyA4NS43ODkgMTAuNDU5IDg1LjU1NDkgMTAuMjY0M0M4NS4zMjA4IDEwLjA2OTYgODUuMDQgOS45NzIyMiA4NC43MTIzIDkuOTcyMjJINzEuNzkxOUM3MS40NjQyIDkuOTcyMjIgNzEuMDg5NyA5LjkwNDA3IDcwLjY2ODMgOS43Njc3N0M3MC4yNzA0IDkuNjExOTkgNjkuOTU0NCA5LjQzNjc1IDY5LjcyMDQgOS4yNDIwM0w2OC44NDI2IDguNTExODRDNjguNjA4NiA4LjI5NzY2IDY4LjQwOTYgOC4wMzQ3OSA2OC4yNDU4IDcuNzIzMjRDNjguMDgxOSA3LjQxMTcgNjggNy4xMzkwOSA2OCA2LjkwNTQzQzY4IDYuNjUyMyA2OC4xMTcgNi40MzgxMSA2OC4zNTExIDYuMjYyODdDNjguNTg1MiA2LjA4NzYyIDY4Ljg2NiA2IDY5LjE5MzcgNkg3MC4wMzY0QzcwLjM4NzUgNiA3MC42OCA2LjA2ODE1IDcwLjkxNDEgNi4yMDQ0NUM3MS4xNDgyIDYuMzIxMjggNzEuMjY1MiA2LjQ2NzMyIDcxLjI2NTIgNi42NDI1NkM3MS4yNjUyIDYuNzk4MzQgNzEuMzgyMiA2LjkzNDY0IDcxLjYxNjMgNy4wNTE0N0M3MS44NTA0IDcuMTY4MyA3Mi4xNDMgNy4yMjY3MiA3Mi40OTQxIDcuMjI2NzJIODcuOTQyNEM4OC4yOTM1IDcuMjI2NzIgODguNTg2IDcuMzMzODEgODguODIwMSA3LjU0OEM4OS4wNTQyIDcuNzQyNzEgODkuMTcxMiA3Ljk4NjExIDg5LjE3MTIgOC4yNzgxOFYxMi40MjU3Qzg5LjE3MTIgMTIuNjk4MyA4OS4yNzY1IDEyLjk0MTYgODkuNDg3MiAxMy4xNTU4Qzg5LjcyMTMgMTMuMzUwNiA4OS45OTA0IDEzLjQ0NzkgOTAuMjk0NyAxMy40NDc5QzkwLjU5OSAxMy40NDc5IDkwLjg1NjUgMTMuNTQ1MyA5MS4wNjcxIDEzLjc0QzkxLjMwMTIgMTMuOTM0NyA5MS40MTgyIDE0LjE2ODQgOTEuNDE4MiAxNC40NDFWMjIuMDkzM0M5MS40MTgyIDIyLjM4NTQgOTEuMzM2MyAyMi42OTcgOTEuMTcyNSAyMy4wMjhDOTEuMDA4NiAyMy4zNTkgOTAuNzk4IDIzLjYzMTYgOTAuNTQwNSAyMy44NDU4TDg5LjczMyAyNC41NzZDODkuNDUyMSAyNC43NzA3IDg5LjExMjcgMjQuOTQ1OSA4OC43MTQ4IDI1LjEwMTdDODguMzE2OSAyNS4yMzggODcuOTU0MSAyNS4zMDYyIDg3LjYyNjQgMjUuMzA2Mkg3Mi40OTQxQzcyLjE0MyAyNS4zMDYyIDcxLjg1MDQgMjUuNDAzNSA3MS42MTYzIDI1LjU5ODJDNzEuMzgyMiAyNS43OTMgNzEuMjY1MiAyNi4wMjY2IDcxLjI2NTIgMjYuMjk5MlYyOS4wNzM5QzcxLjI2NTIgMjkuMzY2IDcxLjM4MjIgMjkuNjA5NCA3MS42MTYzIDI5LjgwNDFDNzEuODUwNCAyOS45OTg4IDcyLjE0MyAzMC4wOTYyIDcyLjQ5NDEgMzAuMDk2Mkg5MC4xODk0QzkwLjU0MDUgMzAuMDk2MiA5MC44MzMxIDMwLjE5MzYgOTEuMDY3MSAzMC4zODgzQzkxLjMwMTIgMzAuNTgzIDkxLjQxODIgMzAuODI2NCA5MS40MTgyIDMxLjExODVWMzEuNzkwMkM5MS40MTgyIDMyLjA2MjggOTEuMzAxMiAzMi4yOTY1IDkxLjA2NzEgMzIuNDkxMkM5MC44MzMxIDMyLjcwNTQgOTAuNTQwNSAzMi44MTI1IDkwLjE4OTQgMzIuODEyNUg3MS43OTE5QzcxLjQ0MDggMzIuODEyNSA3MS4wNTQ2IDMyLjc0NDMgNzAuNjMzMiAzMi42MDhDNzAuMjM1MyAzMi40NzE3IDY5LjkzMSAzMi4yOTY1IDY5LjcyMDQgMzIuMDgyM1pNNzEuMjY1MiAyMS41Njc2QzcxLjI2NTIgMjEuODQwMiA3MS4zODIyIDIyLjA3MzkgNzEuNjE2MyAyMi4yNjg2QzcxLjg1MDQgMjIuNDYzMyA3Mi4xNDMgMjIuNTYwNyA3Mi40OTQxIDIyLjU2MDdINzcuMDkzNEM3Ny40MjExIDIyLjU2MDcgNzcuNzAyIDIyLjQ2MzMgNzcuOTM2MSAyMi4yNjg2Qzc4LjE5MzUgMjIuMDczOSA3OC4zMjIzIDIxLjg0MDIgNzguMzIyMyAyMS41Njc2VjE3LjE1NzNDNzguMzIyMyAxNi44ODQ3IDc4LjE5MzUgMTYuNjUxIDc3LjkzNjEgMTYuNDU2M0M3Ny43MDIgMTYuMjQyMSA3Ny40MjExIDE2LjEzNSA3Ny4wOTM0IDE2LjEzNUg3Mi40OTQxQzcyLjE0MyAxNi4xMzUgNzEuODUwNCAxNi4yNDIxIDcxLjYxNjMgMTYuNDU2M0M3MS4zODIyIDE2LjY1MSA3MS4yNjUyIDE2Ljg4NDcgNzEuMjY1MiAxNy4xNTczVjIxLjU2NzZaTTgxLjU1MjQgMjEuNTY3NkM4MS41NTI0IDIxLjg0MDIgODEuNjY5NCAyMi4wNzM5IDgxLjkwMzUgMjIuMjY4NkM4Mi4xMzc1IDIyLjQ2MzMgODIuNDMwMSAyMi41NjA3IDgyLjc4MTIgMjIuNTYwN0g4Ni45MjQyQzg3LjI3NTMgMjIuNTYwNyA4Ny41Njc5IDIyLjQ2MzMgODcuODAxOSAyMi4yNjg2Qzg4LjAzNiAyMi4wNzM5IDg4LjE1MyAyMS44NDAyIDg4LjE1MyAyMS41Njc2VjE3LjE1NzNDODguMTUzIDE2Ljg4NDcgODguMDM2IDE2LjY1MSA4Ny44MDE5IDE2LjQ1NjNDODcuNTY3OSAxNi4yNDIxIDg3LjI3NTMgMTYuMTM1IDg2LjkyNDIgMTYuMTM1SDgyLjc4MTJDODIuNDMwMSAxNi4xMzUgODIuMTM3NSAxNi4yNDIxIDgxLjkwMzUgMTYuNDU2M0M4MS42Njk0IDE2LjY1MSA4MS41NTI0IDE2Ljg4NDcgODEuNTUyNCAxNy4xNTczVjIxLjU2NzZaIiBmaWxsPSIjMTExMTExIi8+PGRlZnM+PGxpbmVhckdyYWRpZW50IGlkPSJwYWludDBfbGluZWFyXzE1Ml8xMyIgeDE9IjMyIiB5MT0iMCIgeDI9IjMyIiB5Mj0iNjQiIGdyYWRpZW50VW5pdHM9InVzZXJTcGFjZU9uVXNlIj48c3RvcCBzdG9wLWNvbG9yPSIjRkY0QjRCIi8+PHN0b3Agb2Zmc2V0PSIxIiBzdG9wLWNvbG9yPSIjRkY4MTc3Ii8+PC9saW5lYXJHcmFkaWVudD48L2RlZnM+PC9zdmc+";
const logoImg = new Image();
logoImg.src = CHROMA_LOGO_URI;

// 把当前取色结果绘制成 PNG 色卡，返回 canvas（供下载 / 保存到相册复用）
function buildColorCardCanvas(colors) {
  const px = Math.floor;
  const W = 1080, pad = 64, top = 150, gap = 24;
  const barH = 360, metaH = 150;
  const cols = colors.length;
  const cellW = (W - pad * 2);
  const H = top + barH + gap + metaH + pad;
  const { canvas, ctx } = createCanvas(W, H);
  // 背景
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(0, 0, W, H);
  // 顶栏：Logo + 标题
  if (logoImg && logoImg.complete && logoImg.naturalWidth) {
    const lw = 150, lh = Math.round(lw * logoImg.naturalHeight / logoImg.naturalWidth);
    ctx.drawImage(logoImg, pad, pad - 10, lw, lh);
  }
  ctx.fillStyle = '#111111';
  ctx.font = '600 52px -apple-system, "PingFang SC", "Microsoft YaHei", sans-serif';
  ctx.textBaseline = 'middle';
  ctx.fillText('图片取色 · 色卡', pad + 168, pad + 26);
  ctx.fillStyle = '#8a8a8a';
  ctx.font = '400 30px -apple-system, "PingFang SC", "Microsoft YaHei", sans-serif';
  ctx.fillText(new Date().toLocaleDateString(), pad + 168, pad + 78);
  // 色块条
  const totalGap = gap * (cols - 1);
  const bw = (cellW - totalGap) / cols;
  let x = pad;
  colors.forEach(hex => {
    ctx.fillStyle = hex;
    roundRect(ctx, x, top, bw, barH, 16);
    ctx.fill();
    x += bw + gap;
  });
  // 信息区：HEX 文本
  let mx = pad;
  ctx.font = '600 38px -apple-system, "PingFang SC", "Microsoft YaHei", monospace';
  ctx.textBaseline = 'middle';
  colors.forEach(hex => {
    ctx.fillStyle = '#111111';
    ctx.textAlign = 'center';
    ctx.fillText(hex.toUpperCase(), mx + bw / 2, top + barH + gap + metaH / 2);
    mx += bw + gap;
  });
  ctx.textAlign = 'left';
  return canvas;
}
function roundRect(ctx, x, y, w, h, r) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}

// 保存色卡到相册：Canvas 导出 → writeTempFile 落本地 → saveImageToPhotosAlbum 存相册
// （容器规范：filePath 须为本地路径，base64 先 writeTempFile 换 filePath，禁用 a[download]）
async function saveImageColorCard() {
  const colors = imageToolState.lastColors;
  if (!Array.isArray(colors) || !colors.length) { toast('请先取色再保存'); return; }
  toast('正在生成色卡…');
  try {
    const miniTool = window.xhs && window.xhs.miniTool;
    if (!miniTool || typeof miniTool.saveImageToPhotosAlbum !== 'function') {
      toast('当前环境不支持保存到相册');
      return;
    }
    // logo 可能未加载完，等一下
    if (logoImg && !logoImg.complete) {
      await new Promise(res => { logoImg.onload = res; logoImg.onerror = res; setTimeout(res, 800); });
    }
    const canvas = buildColorCardCanvas(colors);
    const dataUrl = canvas.toDataURL('image/png');
    // 大图先用 writeTempFile 落本地临时文件，再传 filePath，避免直接传超长 base64
    let filePath = dataUrl;
    if (typeof miniTool.writeTempFile === 'function') {
      try {
        const tmp = await miniTool.writeTempFile({ data: dataUrl });
        if (tmp && tmp.filePath) filePath = tmp.filePath;
      } catch (e) { /* 失败则退回直接传 dataUrl */ }
    }
    await miniTool.saveImageToPhotosAlbum({ filePath });
    toast('已保存到相册');
  } catch (err) {
    console.error(err);
    toast('保存失败：' + (err && err.errMsg ? err.errMsg : (err && err.message ? err.message : err)));
  }
}

// 渐变色卡保存：Canvas 渲染渐变 → writeTempFile 落本地 → saveImageToPhotosAlbum 存相册（官方允许方法）
async function saveGradientImage(css) {
  try {
    const miniTool = window.xhs && window.xhs.miniTool;
    if (!miniTool || typeof miniTool.saveImageToPhotosAlbum !== 'function') {
      toast('当前环境不支持保存到相册');
      return;
    }
    const W = 1080, H = 1350;
    const canvas = document.createElement('canvas');
    canvas.width = W; canvas.height = H;
    const ctx = canvas.getContext('2d');
    const m = String(css).match(/linear-gradient\((\d+)deg,\s*(.+)\)/);
    let angle = 135, stops = ['#ccc', '#999'];
    if (m) { angle = parseInt(m[1], 10); stops = m[2].split(',').map(s => s.trim().split(/\s+/)[0]); }
    const rad = (angle - 90) * Math.PI / 180;
    const x = Math.cos(rad), y = Math.sin(rad);
    const x0 = W / 2 - x * W / 2, y0 = H / 2 - y * H / 2, x1 = W / 2 + x * W / 2, y1 = H / 2 + y * H / 2;
    const grad = ctx.createLinearGradient(x0, y0, x1, y1);
    stops.forEach((c, i) => grad.addColorStop(stops.length === 1 ? 0 : i / (stops.length - 1), c));
    ctx.fillStyle = grad; ctx.fillRect(0, 0, W, H);
    const dataUrl = canvas.toDataURL('image/png');
    let filePath = dataUrl;
    if (typeof miniTool.writeTempFile === 'function') {
      try {
        const tmp = await miniTool.writeTempFile({ data: dataUrl });
        if (tmp && tmp.filePath) filePath = tmp.filePath;
      } catch (e) { /* 失败则退回直接传 dataUrl */ }
    }
    await miniTool.saveImageToPhotosAlbum({ filePath });
    toast('已保存到相册');
  } catch (err) {
    console.error(err);
    toast('保存失败：' + (err && err.errMsg ? err.errMsg : (err && err.message ? err.message : err)));
  }
}
window.saveGradientImage = saveGradientImage;

/* =========================================================
   工具 2 · 高级配色器
   ========================================================= */
// 核心色相定义：每种和谐有几组核心色相
// 角度严格按配色文献（Itten 色轮 / HSL 和谐计算）：
//   mono: 0°（同色相，仅变明度/彩度）
//   analogous: ±30°（邻近色）
//   complementary: 180°（对比色）
//   triadic: 120°（三分均布）
//   tetradic: 90°（四分均布）
const HARMONY_HUES = {
  mono: [0],
  analogous: [0, -30, 30],
  complementary: [0, 180],
  triadic: [0, 120, 240],
  tetradic: [0, 90, 180, 270]
};

// 高级配色器：12 个颜色按"核心色相 × 每组固定数量"精确分组
// mono:      1 组 × 12 = 12（全 base 色相，L 阶梯）
// analogous: 3 组 × 4  = 12（-45°/0°/+45°，各 4 个）
// complementary: 2 组 × 6 = 12（0°/180°，各 6 个）
// triadic:   3 组 × 4  = 12（0°/120°/240°，各 4 个）
// tetradic:  4 组 × 3  = 12（0°/90°/180°/270°，各 3 个）
// 第一块 = base 本身（组 0 的第 0 个），后续每组严格 perGroup 个
// 配色生成：每个和谐色相 1 个锚点（主要颜色）+ 12 个派生色（生成颜色，均分到每个色相）
// - mono:  1 锚点 + 12×1 生成 = 13 色
// - comp:  2 锚点 + 12/2 = 6×2 生成 = 14 色
// - ana:   3 锚点 + 12/3 = 4×3 生成 = 15 色
// - tri:   3 锚点 + 12/3 = 4×3 生成 = 15 色
// - tet:   4 锚点 + 12/4 = 3×4 生成 = 16 色
const GEN_COUNT = 12; // 派生色（生成色）固定 12 个，平均分配到每个色相
function buildAdvancedPalette(baseHex, harmony, chromaScale, lightShift) {
  // 色轮、取色、圆点定位统一使用 HSL 色相；
  // 若使用 CIELCh 色相，蓝色区域会与 HSL 色轮出现明显错位。
  const baseHsl = hexToHsl(baseHex);
  const hues = HARMONY_HUES[harmony] || [0];
  const groups = hues.length;
  const perGen = Math.floor(GEN_COUNT / groups); // 精确整除
  const colors = [];
  const anchors = []; // 记录主要颜色（锚点）的全局索引
  const lRange = 25;
  for (let g = 0; g < groups; g++) {
    const h = (baseHsl.h + hues[g] + 360) % 360;
    const s = clamp(baseHsl.s * chromaScale, 0, 100);
    // 1) 主要颜色（锚点）：基准色相 + 基准明度 + 全局调节
    const anchorL = clamp(baseHsl.l + lightShift, 5, 95);
    const anchorHex = (g === 0) ? baseHex : hslToHex(h, s, anchorL);
    colors.push(anchorHex);
    anchors.push(colors.length - 1);
    // 2) 生成颜色：同色相同饱和度，明度在 base.l ± 25 均匀分布
    for (let i = 0; i < perGen; i++) {
      const l = perGen > 1
        ? clamp(baseHsl.l - lRange + (lRange * 2 * i / (perGen - 1)) + lightShift, 5, 95)
        : clamp(baseHsl.l + lightShift, 5, 95);
      colors.push(hslToHex(h, s, l));
    }
  }
  return { colors, anchors };
}

const palState = { colors: [], anchors: [], harmony: 'mono', base: '#fd4a4a', wheel: { h: 0, norm: 0.85 } };

// ===== 基础工具：HEX ↔ HSL =====
function hexToHsl(hex) {
  const c = hex.replace('#','');
  const r = parseInt(c.slice(0,2),16) / 255;
  const g = parseInt(c.slice(2,4),16) / 255;
  const b = parseInt(c.slice(4,6),16) / 255;
  const max = Math.max(r,g,b), min = Math.min(r,g,b);
  let h = 0, s = 0, l = (max + min) / 2;
  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r: h = (g - b) / d + (g < b ? 6 : 0); break;
      case g: h = (b - r) / d + 2; break;
      case b: h = (r - g) / d + 4; break;
    }
    h *= 60;
  }
  return { h: Math.round(h), s: Math.round(s * 100), l: Math.round(l * 100) };
}
function hslToHex(h, s, l) {
  h = ((h % 360) + 360) % 360;
  s = clamp(s, 0, 100) / 100;
  l = clamp(l, 0, 100) / 100;
  function hue2rgb(p, q, t) {
    if (t < 0) t += 1; if (t > 1) t -= 1;
    if (t < 1/6) return p + (q - p) * 6 * t;
    if (t < 1/2) return q;
    if (t < 2/3) return p + (q - p) * (2/3 - t) * 6;
    return p;
  }
  let r, g, b;
  if (s === 0) { r = g = b = l; }
  else {
    const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
    const p = 2 * l - q;
    r = hue2rgb(p, q, h / 360 + 1/3);
    g = hue2rgb(p, q, h / 360);
    b = hue2rgb(p, q, h / 360 - 1/3);
  }
  const toHex = n => Math.round(n * 255).toString(16).padStart(2, '0');
  return '#' + toHex(r) + toHex(g) + toHex(b);
}
function syncRgbFromHex(hex) {
  const c = hex.replace('#','');
  return { r: parseInt(c.slice(0,2),16), g: parseInt(c.slice(2,4),16), b: parseInt(c.slice(4,6),16) };
}
function palRgbToHex(r, g, b) {
  const toHex = n => clamp(Math.round(n), 0, 255).toString(16).padStart(2, '0');
  return '#' + toHex(r) + toHex(g) + toHex(b);
}

// ===== 状态同步：从基准色更新所有输入控件 =====
function syncBaseInputs(hex, keepWheel) {
  const norm = parseColor(hex) || '#fd4a4a';
  const rgb = syncRgbFromHex(norm);
  const hexEl = $('#palHex');
  if (hexEl) hexEl.value = norm;
  const colorEl = $('#palColorInput');
  if (colorEl) colorEl.value = norm.toLowerCase();
  const rEl = $('#palR'), gEl = $('#palG'), bEl = $('#palB');
  if (rEl) rEl.value = rgb.r;
  if (gEl) gEl.value = rgb.g;
  if (bEl) bEl.value = rgb.b;
  const rNum = $('#palRNum'), gNum = $('#palGNum'), bNum = $('#palBNum');
  if (rNum) rNum.value = rgb.r;
  if (gNum) gNum.value = rgb.g;
  if (bNum) bNum.value = rgb.b;
  palState.base = norm;
  // 圆点位置跟随 base：角度 = base 色相，远近 = 反推白色混合比例（RGB/HEX 输入时圆点远近也变）
  // keepWheel=true 表示色环拖动路径（wheel 已是鼠标精确位置，不覆盖）
  if (!keepWheel) syncWheelFromBase();
  // 基准色变化 → 指针圆点 + 基础色卡同步
  renderWheelDot();
  renderBaseCard();
}

// 从 base 反推圆点位置：h = 色相；norm = 反推白色混合 alpha（base = conic*(1-a) + white*a）
function syncWheelFromBase() {
  const hsl = hexToHsl(palState.base);
  const h = hsl.h;
  // conic 颜色 = hsl(h, 100%, 50%)
  const conic = hslToRgb(h, 100, 50);
  // 每通道解 a = (conic - base) / (conic - 255)
  const rgb = hexToRgb(palState.base);
  const alphas = [0, 1, 2].map(i => {
    const c = i === 0 ? conic.r : (i === 1 ? conic.g : conic.b);
    const b = i === 0 ? rgb.r : (i === 1 ? rgb.g : rgb.b);
    const a = (c - b) / (c - 255);
    return (isFinite(a) && a >= 0 && a <= 1) ? a : null;
  }).filter(a => a !== null);
  const alpha = alphas.length ? alphas.reduce((s, x) => s + x, 0) / alphas.length : 0;
  // norm = 0.95 - alpha（alpha=0.95 中心 → norm=0；alpha=0 边缘 → norm=0.95）
  const norm = clamp(0.95 - alpha, 0, 0.95);
  palState.wheel = { h, norm };
}



// 基准色输入同步：色圆背景 / HEX / 隐藏取色器
function renderBaseCard() {
  const hex = (palState.base || '#fd4a4a').toLowerCase();
  const circle = $('#palBaseChip');
  if (circle) circle.style.background = hex;
  const colorInput = $('#palColorInput');
  if (colorInput && colorInput.value.toLowerCase() !== hex) colorInput.value = hex;
  const hexText = $('#palHex');
  if (hexText && document.activeElement !== hexText) hexText.value = hex.toUpperCase();
}

// 指针圆点：跟随 palState.wheel（h=角度, norm=0中心~1边缘）定位到色环上
function renderWheelDot() {
  const dot = $('#palWheelDot');
  if (!dot) return;
  const { h, norm } = palState.wheel || { h: 0, norm: 0.85 };
  const wrap = $('#palWheel');
  const size = wrap ? wrap.clientWidth : 300;
  const radius = (size / 2) - WHEEL_MARGIN; // 与取色边界保持一致
  const angle = (h - 90) * Math.PI / 180; // 0° 在顶部
  const dist = norm * radius;
  const x = size / 2 + dist * Math.cos(angle);
  const y = size / 2 + dist * Math.sin(angle);
  dot.style.left = x + 'px';
  dot.style.top = y + 'px';
  dot.style.background = palState.base || '#fd4a4a';
}

// 色环某位置 (h, norm) 的视觉颜色 = conic(100%饱和) 与 radial 白色 0-95% 的 sRGB 混合
function wheelVisualColor(h, norm) {
  const conic = hslToRgb(h, 100, 50);
  const alpha = norm < 0.95 ? 0.95 * (1 - norm / 0.95) : 0;
  const r = conic.r * (1 - alpha) + 255 * alpha;
  const g = conic.g * (1 - alpha) + 255 * alpha;
  const b = conic.b * (1 - alpha) + 255 * alpha;
  const hsl = rgbToHsl(r, g, b);
  return hslToHex(hsl.h, hsl.s, hsl.l);
}

// ===== 核心：生成配色方案 =====
function generatePalette() {
  const baseHex = palState.base || '#fd4a4a';
  const harmony = palState.harmony || 'analogous';
  // 用 Number.parseInt 安全转换；空串 / NaN 走默认值（彩度 100%、明度 0）；
  // 关键修复：原代码 `(+$val || 100)` 在 val="0" 时被错误当成 100，导致彩度 0 时反弹。
  const chromaRaw = Number.parseInt($('#palChroma').value, 10);
  const chromaScale = (Number.isFinite(chromaRaw) ? clamp(chromaRaw, 0, 200) : 100) / 100;
  const lightRaw = Number.parseInt($('#palLight').value, 10);
  const lightShift = Number.isFinite(lightRaw) ? clamp(lightRaw, -50, 50) : 0;
  const next = buildAdvancedPalette(baseHex, harmony, chromaScale, lightShift);
  palState.colors = next.colors;
  palState.anchors = next.anchors;
  renderPalResult();
  renderCurrentTab();
}



// ===== 渲染：主要色 / 生成色（复用首页 palette-preview-bar 体系）=====
// 用 .palette-preview-bar 替代自定义 .pal-swatch：
// - 首页同款卡片表面（.palette-card） + 同款色块行（.palette-preview）
// - 悬停时色块从 flex:1 展开到 flex:2 + HEX 浮层（首页 .palette-preview-bar::after 规则）
// - 复制逻辑：点色块即可复制 HEX
function palBarHTML(c) {
  return '<span class="palette-preview-bar" style="background:' + c + '" data-hex="' + c + '" title="' + c + '"></span>';
}
function bindPreviewBarEvents(wrap) {
  wrap.querySelectorAll('.palette-preview-bar').forEach(el => {
    el.addEventListener('click', async e => {
      e.stopPropagation();
      const hex = el.dataset.hex || el.style.background;
      await copyText(hex);
    });
  });
}
function renderPalResult() {
  const mainWrap = $('#palPrimary');
  const genWrap = $('#palGen');
  if (!mainWrap || !genWrap) return;
  const colors = palState.colors;
  const anchors = palState.anchors || [];
  const isMain = i => anchors.indexOf(i) !== -1;
  mainWrap.innerHTML = colors.map((c, i) => isMain(i) ? palBarHTML(c) : '').join('');
  genWrap.innerHTML = colors.map((c, i) => isMain(i) ? '' : palBarHTML(c)).join('');
  bindPreviewBarEvents(mainWrap);
  bindPreviewBarEvents(genWrap);
  // 主要颜色副标题：和谐锚点数（带安全回退，避免 i18n 未加载时抛错导致预览空白）
  const t = (key, fallback) => (window.i18n && typeof window.i18n.t === 'function') ? window.i18n.t(key, fallback) : fallback;
  const sub = $('#palPrimaryMeta');
  if (sub) sub.textContent = t('palette.harmony.anchor', '主要色') + ' · ' + anchors.length + ' ' + t('palette.primary.count', '色');
  // 生成颜色副标题：实际生成数（= 12 固定，均匀分配）
  const genCount = colors.length - anchors.length;
  const genCountEl = $('#palGenCount');
  if (genCountEl) genCountEl.textContent = genCount;
}

// ===== 渲染：色环背景 + 指针 + 和谐锚点 =====
// 色环背景用 Canvas createConicGradient + radialGradient 绘制，与 CSS 解耦，
// 确保 pickColorFromWheel 读取的像素与视觉完全一致。
// 指针圆点（#palWheelDot）跟随基准色定位；
// 和谐锚点（#palWheelAnchors）按当前和谐类型画出其余核心色相位置（主点除外）。
function renderColorWheel() {
  drawWheelBackground();
  renderWheelDot();
  renderWheelAnchors();
}

// 在 Canvas 上绘制色环背景（conic 色相 + radial 白色中心）
function drawWheelBackground() {
  const canvas = $('#palWheel');
  if (!canvas) return;
  const ctx = canvas.getContext('2d', { willReadFrequently: true });
  if (!ctx || !ctx.createConicGradient) return; // 不支持时回退到 CSS 背景
  const size = canvas.width;
  const center = size / 2;
  ctx.clearRect(0, 0, size, size);
  // conic 色相环：0° 在顶部，顺时针
  const conic = ctx.createConicGradient(-Math.PI / 2, center, center);
  for (let d = 0; d <= 360; d += 10) {
    conic.addColorStop(d / 360, 'hsl(' + d + ', 100%, 50%)');
  }
  ctx.fillStyle = conic;
  ctx.beginPath();
  ctx.arc(center, center, center, 0, Math.PI * 2);
  ctx.fill();
  // radial 白色中心（中心 95% 白 → 边缘透明）
  const radial = ctx.createRadialGradient(center, center, 0, center, center, center);
  radial.addColorStop(0, 'rgba(255,255,255,0.95)');
  radial.addColorStop(0.95, 'rgba(255,255,255,0)');
  radial.addColorStop(1, 'rgba(255,255,255,0)');
  ctx.fillStyle = radial;
  ctx.beginPath();
  ctx.arc(center, center, center, 0, Math.PI * 2);
  ctx.fill();
}

// 在色环上画出当前和谐类型的锚点（不含主定位点）：
// mono 无额外锚点；complementary +1；analogous +2；triadic +2；tetradic +3。
// 位置：色相 = base.h + HARMONY_HUES[harmony][g]，半径 = 与主点相同的 norm。
function renderWheelAnchors() {
  const box = $('#palWheelAnchors');
  if (!box) return;
  const wrap = $('#palWheel');
  const size = wrap ? wrap.clientWidth : 300;
  const radius = (size / 2) - WHEEL_MARGIN;
  // 锚点角度必须与色轮（HSL）保持一致
  const base = hexToHsl(palState.base);
  const hues = HARMONY_HUES[palState.harmony] || [0];
  const norm = (palState.wheel && palState.wheel.norm != null) ? palState.wheel.norm : 0.85;
  // 主点已在 #palWheelDot，跳过索引 0
  // 小圆（锚点）只标记和谐位置，不实时显示颜色——统一中性白底 + 灰边，
  // 让主圆点是唯一随基准色变化的彩色点，视觉焦点清晰。
  let html = '';
  for (let g = 1; g < hues.length; g++) {
    const h = (base.h + hues[g] + 360) % 360;
    const angle = (h - 90) * Math.PI / 180;
    const dist = norm * radius;
    const x = size / 2 + dist * Math.cos(angle);
    const y = size / 2 + dist * Math.sin(angle);
    html += '<span class="pal-wheel-anchor" style="left:' + x + 'px;top:' + y + 'px"></span>';
  }
  box.innerHTML = html;
}

// 色环取色：读取 Canvas 像素，保证与视觉完全一致
// - 主圆点永远画在鼠标位置
// - base = 该位置画布像素颜色
const WHEEL_MARGIN = 8; // 圆点/取色边界与画布边缘的留白（px）
function pickColorFromWheel(e) {
  const canvas = $('#palWheel');
  if (!canvas) return; // 仅在高级配色器页面存在色轮时生效
  const rect = canvas.getBoundingClientRect();
  const scaleX = canvas.width / rect.width;
  const scaleY = canvas.height / rect.height;
  const cx = (e.clientX - rect.left) * scaleX;
  const cy = (e.clientY - rect.top) * scaleY;
  const x = cx - canvas.width / 2;
  const y = cy - canvas.height / 2;
  const dist = Math.sqrt(x * x + y * y);
  const outerR = canvas.width / 2 - WHEEL_MARGIN;
  if (dist <= outerR) {
    const angle = Math.atan2(y, x) * 180 / Math.PI + 90;
    const h = ((angle % 360) + 360) % 360;
    const norm = clamp(dist / outerR, 0, 1);
    // 记录主圆点位置（解耦：圆点永远 = 鼠标位置）
    palState.wheel = { h, norm };
    // base = 画布像素颜色（优先），fallback 到 wheelVisualColor
    let hex = wheelVisualColor(h, norm);
    const ctx = canvas.getContext('2d', { willReadFrequently: true });
    if (ctx && ctx.createConicGradient) {
      const px = clamp(Math.round(cx), 0, canvas.width - 1);
      const py = clamp(Math.round(cy), 0, canvas.height - 1);
      const pixel = ctx.getImageData(px, py, 1, 1).data;
      hex = rgbToHexBytes(pixel[0], pixel[1], pixel[2]);
    }
    // keepWheel=true：wheel 是鼠标精确位置，不被 syncWheelFromBase 覆盖
    syncBaseInputs(hex, true);
    generatePalette();
    renderColorWheel();
  }
}

// ===== 标签页 =====
let currentTab = 'preview';
function renderCurrentTab() {
  const el = $('#palTabContent');
  if (!el) return;
  if (currentTab === 'list') renderTabList(el);
  else if (currentTab === 'preview') renderTabPreview(el);
}
function renderTabList(el) {
  const colors = palState.colors;
  const rows = colors.map((c, i) => {
    const rgb = syncRgbFromHex(c);
    const hsl = hexToHsl(c);
    const lch = hexToLch(c);
    return '<tr><td><span class="pal-list-dot" style="background:' + c + '"></span></td>' +
      '<td class="pal-list-hex" data-hex="' + c + '">' + c + '</td>' +
      '<td>' + rgb.r + ', ' + rgb.g + ', ' + rgb.b + '</td>' +
      '<td>' + Math.round(hsl.h) + '°, ' + Math.round(hsl.s) + '%, ' + Math.round(hsl.l) + '%</td>' +
      '<td>' + Math.round(lch.L) + ', ' + Math.round(lch.C) + ', ' + Math.round(lch.h) + '°</td>' +
    '</tr>';
  }).join('');
  el.innerHTML = '<table class="pal-table"><thead><tr><th></th><th>HEX</th><th>RGB</th><th>HSL</th><th>LCh</th></tr></thead><tbody>' + rows + '</tbody></table>';
  el.querySelectorAll('.pal-list-hex').forEach(el2 => {
    el2.addEventListener('click', async () => { await copyText(el2.dataset.hex); });
  });
}
function renderTabPreview(el) {
  const base = palState.base;
  const colors = palState.colors;
  const c0 = colors[0] || base;
  const c1 = colors[1] || base;
  const chipHtml = colors.map(c => '<div class="pal-preview-chip" style="background:' + c + '">' + c + '</div>').join('');
  const t = (k, f) => (window.i18n ? window.i18n.t(k) : f);
  el.innerHTML =
    '<div class="pal-preview-card" style="border-left:4px solid ' + c0 + '">' +
      '<h4 style="color:' + c0 + '">' + t('palette.preview.title', '用主色作为标题强调色') + '</h4>' +
      '<p>' + t('palette.preview.desc', '主色') + ' ' + c0 + ' · ' + t('palette.preview.accent', '辅色') + ' ' + c1 + ' · ' + t('palette.preview.neutral', '文本保持中性色以确保可读性。') + '</p>' +
    '</div>' +
    '<div class="pal-preview-mock">' +
      '<button class="btn btn-primary" style="background:' + c0 + ';border-color:' + c0 + '">' + t('palette.preview.primaryBtn', '主要按钮') + '</button>' +
      '<button class="btn btn-outline" style="color:' + c0 + ';border-color:' + c0 + '">' + t('palette.preview.secondaryBtn', '次要按钮') + '</button>' +
    '</div>' +
    '<div class="pal-preview-mock">' +
      '<div class="pal-preview-chip" style="background:' + c0 + '">' + c0 + '</div>' +
      chipHtml +
    '</div>';
}

// ===== 初始化 =====
// 和谐类型图标（按用户设计稿重绘）：
// 24 个圆角刻度（15° 一档）围成圆环，锚点角度的刻度用对应颜色点亮，
// 中心到每个锚点画同色虚线，中心一枚红点。锚点角度与 HARMONY_HUES 语义一致。
const HARMONY_ICON_ANCHORS = {
  mono:          [[0, '#FF0102']],
  complementary: [[0, '#FF0102'], [180, '#00FFFF']],
  analogous:     [[0, '#FF0102'], [315, '#FF079C'], [45, '#FFC009']],
  triadic:       [[0, '#FF0102'], [120, '#1AFF02'], [240, '#0525FF']],
  tetradic:      [[0, '#FF0102'], [90, '#80FF00'], [180, '#00FFFF'], [270, '#7F00FF']],
};
function renderHarmonyIcons() {
  const root = $('#palHarmony');
  if (!root) return;
  root.querySelectorAll('.pal-harmony-item').forEach(btn => {
    const svg = btn.querySelector('svg');
    if (!svg) return;
    const anchors = HARMONY_ICON_ANCHORS[btn.dataset.harmony] || [];
    let s = '';
    for (let deg = 0; deg < 360; deg += 15) {
      const hit = anchors.find(a => a[0] === deg);
      s += `<rect x="59" y="0" width="10" height="20" rx="5" fill="${hit ? hit[1] : '#E4E4E4'}" transform="rotate(${deg} 64 64)"/>`;
    }
    anchors.forEach(([deg, color]) => {
      const rad = (deg - 90) * Math.PI / 180; // 顶部 = -90°
      const cos = Math.cos(rad), sin = Math.sin(rad);
      s += `<line x1="${(64 + 12 * cos).toFixed(1)}" y1="${(64 + 12 * sin).toFixed(1)}" ` +
           `x2="${(64 + 44 * cos).toFixed(1)}" y2="${(64 + 44 * sin).toFixed(1)}" ` +
           `stroke="${color}" stroke-width="2.5" stroke-dasharray="4 3" stroke-linecap="round"/>`;
    });
    s += '<circle cx="64" cy="64" r="2.5" fill="#FF0102"/>';
    svg.innerHTML = s;
  });
}

function initPaletteTool() {
  if (!$('#palWheel')) return;
  // 和谐类型按钮
  $('#palHarmony').querySelectorAll('.pal-harmony-item').forEach(btn => {
    btn.addEventListener('click', () => {
      $('#palHarmony').querySelectorAll('.pal-harmony-item').forEach(b => {
        b.classList.remove('is-active');
        b.setAttribute('aria-checked', 'false');
      });
      btn.classList.add('is-active');
      btn.setAttribute('aria-checked', 'true');
      palState.harmony = btn.dataset.harmony;
      generatePalette();
      renderColorWheel();
      renderBaseCard();
    });
  });
  // 标签页
  $('#palTabs').querySelectorAll('.pal-tab').forEach(btn => {
    btn.addEventListener('click', () => {
      $('#palTabs').querySelectorAll('.pal-tab').forEach(b => {
        b.classList.remove('is-active');
        b.setAttribute('aria-selected', 'false');
      });
      btn.classList.add('is-active');
      btn.setAttribute('aria-selected', 'true');
      currentTab = btn.dataset.tab;
      renderCurrentTab();
    });
  });
  // 去掉生成配色按钮，实时联动
  const syncChroma = src => { const v = clamp(+src.value, 0, 200); document.getElementById('palChroma').value = v; document.getElementById('palChromaNum').value = v; generatePalette(); renderColorWheel(); };
  const syncLight = src => { const v = clamp(+src.value, -50, 50); document.getElementById('palLight').value = v; document.getElementById('palLightNum').value = v; generatePalette(); renderColorWheel(); };
  document.getElementById('palChroma').addEventListener('input', () => syncChroma(document.getElementById('palChroma')));
  document.getElementById('palChromaNum').addEventListener('input', () => syncChroma(document.getElementById('palChromaNum')));
  document.getElementById('palChromaNum').addEventListener('change', () => syncChroma(document.getElementById('palChromaNum')));
  document.getElementById('palLight').addEventListener('input', () => syncLight(document.getElementById('palLight')));
  document.getElementById('palLightNum').addEventListener('input', () => syncLight(document.getElementById('palLightNum')));
  document.getElementById('palLightNum').addEventListener('change', () => syncLight(document.getElementById('palLightNum')));
  // 基准色 HEX 同步（input 实时联动 + change 兜底规范化）
  const hexEl = $('#palHex');
  const applyHex = () => {
    const n = parseColor(hexEl.value);
    if (n) { syncBaseInputs(n); generatePalette(); renderColorWheel(); }
    else { hexEl.value = palState.base; }
  };
  hexEl.addEventListener('input', () => {
    const n = parseColor(hexEl.value);
    if (n) { syncBaseInputs(n); generatePalette(); renderColorWheel(); }
  });
  hexEl.addEventListener('change', applyHex);
  // 隐藏 color input 同步（HEX 行旁色圆内 input）
  $('#palColorInput').addEventListener('input', () => {
    syncBaseInputs($('#palColorInput').value);
    generatePalette();
    renderColorWheel();
  });
  // RGB 滑块 + number 输入：双向同步，实时联动
  ['R', 'G', 'B'].forEach(ch => {
    const slider = $('#pal' + ch);
    const num = $('#pal' + ch + 'Num');
    const syncFrom = (src) => {
      const v = clamp(+src.value, 0, 255);
      slider.value = v;
      num.value = v;
      const r = +$('#palR').value, g = +$('#palG').value, b = +$('#palB').value;
      syncBaseInputs(palRgbToHex(r, g, b));
      generatePalette();
      renderColorWheel();
    };
    slider.addEventListener('input', () => syncFrom(slider));
    num.addEventListener('input', () => syncFrom(num));
    num.addEventListener('change', () => syncFrom(num));
  });
  // 色环 Canvas 点击/拖拽
  const wheel = $('#palWheel');
  const wheelDot = $('#palWheelDot');
  let dragging = false;
  const onDragEnd = () => {
    if (!dragging) return;
    dragging = false;
    palState._dragging = false;
    if (wheelDot) wheelDot.classList.remove('is-dragging');
    // 松手后重画色环（清空 canvas，背景由 CSS 渐变绘制），避免拖动期间重画产生残影
    renderColorWheel();
  };
  wheel.addEventListener('mousedown', e => { dragging = true; palState._dragging = true; if (wheelDot) wheelDot.classList.add('is-dragging'); pickColorFromWheel(e); });
  wheel.addEventListener('mousemove', e => { if (dragging) pickColorFromWheel(e); });
  window.addEventListener('mouseup', onDragEnd);
  wheel.addEventListener('touchstart', e => { dragging = true; palState._dragging = true; if (wheelDot) wheelDot.classList.add('is-dragging'); pickColorFromWheel(e.touches[0]); }, {passive: true});
  wheel.addEventListener('touchmove', e => { if (dragging) pickColorFromWheel(e.touches[0]); }, {passive: true});
  window.addEventListener('touchend', onDragEnd);
  // 重置按钮：只重置彩度 100、明度 0（RGB 跟随基准色，不受重置影响）
  const resetBtn = document.getElementById('palResetBtn');
  if (resetBtn) resetBtn.addEventListener('click', () => {
    setSlider('palChroma', 'palChromaNum', 100);
    setSlider('palLight', 'palLightNum', 0);
    generatePalette();
    renderColorWheel();
    toast('已重置彩度与明度');
  });
  // 初始同步
  renderHarmonyIcons();
  syncBaseInputs(palState.base);
  // 视图可见时（首次进入 / 从其他工具切回）重新渲染：
  // 初始化时工具视图为隐藏态，clientWidth=0 会导致色环主点定位到画布外、预览区不渲染，
  // 故必须在视图真正可见后再渲染。用 IntersectionObserver 探测首次可见即重绘一次。
  window.refreshAdvancedPalette = function () {
    renderColorWheel();
    generatePalette();
  };
  const view = document.getElementById('view-tool-palette');
  if (view) {
    // 如果当前已经是活动视图，立即渲染，保证首次进入就能看到预览和正确主点
    if (view.classList.contains('is-active')) {
      window.refreshAdvancedPalette();
    }
    if ('IntersectionObserver' in window) {
      const io = new IntersectionObserver((entries) => {
        entries.forEach(e => {
          if (e.isIntersecting && e.target.classList.contains('is-active')) {
            window.refreshAdvancedPalette();
            io.disconnect();
          }
        });
      }, { threshold: 0.01 });
      io.observe(view);
    }
  }
  window.addEventListener('resize', () => {
    if (view && view.classList.contains('is-active')) renderWheelDot();
  });

  // 滑块：只有拖动把手或输入数值时才改变值，点击轨道不跳变
  document.querySelectorAll('.pal-slider input[type="range"]').forEach(range => {
    range.addEventListener('pointerdown', e => {
      const rect = range.getBoundingClientRect();
      const min = +range.min || 0;
      const max = +range.max || 100;
      const val = +range.value;
      const ratio = max === min ? 0 : (val - min) / (max - min);
      const thumbX = rect.left + ratio * rect.width;
      const clientX = e.clientX || (e.touches && e.touches[0] ? e.touches[0].clientX : 0);
      // 容错半径约 18px；点击不在把手附近时阻止浏览器跳变
      if (Math.abs(clientX - thumbX) > 18) {
        e.preventDefault();
        e.stopPropagation();
      }
    }, { passive: false });
    range.addEventListener('touchstart', e => {
      const rect = range.getBoundingClientRect();
      const min = +range.min || 0;
      const max = +range.max || 100;
      const val = +range.value;
      const ratio = max === min ? 0 : (val - min) / (max - min);
      const thumbX = rect.left + ratio * rect.width;
      const clientX = e.touches[0] ? e.touches[0].clientX : 0;
      if (Math.abs(clientX - thumbX) > 22) {
        e.preventDefault();
        e.stopPropagation();
      }
    }, { passive: false });
  });
}

// 工具函数：同时设置 range + number input 的值
function setSlider(rangeId, numId, v) {
  const r = document.getElementById(rangeId);
  const n = document.getElementById(numId);
  if (r) r.value = v;
  if (n) n.value = v;
}



/* =========================================================
   工具 3 · 色盲检测（Machado 2009 模拟矩阵）
   ========================================================= */
const CVD_MATRICES = {
  normal: [[1, 0, 0], [0, 1, 0], [0, 0, 1]],
  protanopia: [[0.152286, 1.052583, -0.204868], [0.114503, 0.786281, 0.099216], [-0.003882, -0.048116, 1.051998]],
  deuteranopia: [[0.367322, 0.860646, -0.227968], [0.280085, 0.672501, 0.047413], [-0.011820, 0.042940, 0.968881]],
  tritanopia: [[1.255528, -0.076749, -0.178779], [-0.078411, 0.930809, 0.147602], [0.004733, 0.691367, 0.303900]],
};
const CVD_TYPES = [
  ['normal', 'cvd.type.normal', null],
  ['protanopia', 'cvd.type.protanopia', 'protanopia'],
  ['protanomaly', 'cvd.type.protanomaly', 'protanopia'],
  ['deuteranopia', 'cvd.type.deuteranopia', 'deuteranopia'],
  ['deuteranomaly', 'cvd.type.deuteranomaly', 'deuteranopia'],
  ['tritanopia', 'cvd.type.tritanopia', 'tritanopia'],
  ['monochromacy', 'cvd.type.monochromacy', 'mono'],
];
const CVD_LABEL_ZH = {
  'cvd.type.normal': '正常视觉', 'cvd.type.protanopia': '红色盲', 'cvd.type.protanomaly': '红色弱',
  'cvd.type.deuteranopia': '绿色盲', 'cvd.type.deuteranomaly': '绿色弱', 'cvd.type.tritanopia': '蓝色盲',
  'cvd.type.monochromacy': '全色盲',
};
const cvdLabel = (key) => (window.i18n ? window.i18n.t(key) : (CVD_LABEL_ZH[key] || key));
function simulateCVD(hex, matrix) {
  if (matrix === 'mono') {
    // 全色盲：按感知亮度映射为灰度
    const { r, g, b } = hexToRgb(hex);
    const y = Math.round(0.299 * r + 0.587 * g + 0.114 * b);
    return rgbToHexBytes(y, y, y);
  }
  const { r, g, b } = hexToRgb(hex);
  const lr = srgbToLinear(r / 255), lg = srgbToLinear(g / 255), lb = srgbToLinear(b / 255);
  const [m0, m1, m2] = matrix;
  const nr = clamp(m0[0] * lr + m0[1] * lg + m0[2] * lb, 0, 1);
  const ng = clamp(m1[0] * lr + m1[1] * lg + m1[2] * lb, 0, 1);
  const nb = clamp(m2[0] * lr + m2[1] * lg + m2[2] * lb, 0, 1);
  return rgbToHexBytes(linearToSrgb(nr) * 255, linearToSrgb(ng) * 255, linearToSrgb(nb) * 255);
}
// 异常三色视矩阵：正常 I 与二分色矩阵按严重程度插值（0=正常，1=完全二分色）
function cvdMatrix(type, severity) {
  if (type === 'normal') return CVD_MATRICES.normal;
  if (type === 'monochromacy') return 'mono';
  if (type === 'protanomaly' || type === 'deuteranomaly') {
    const sev = clamp(severity, 0, 100) / 100;
    const base = CVD_MATRICES[type === 'protanomaly' ? 'protanopia' : 'deuteranopia'];
    const m = CVD_MATRICES.normal.map((row, i) => row.map((v, j) => v + sev * (base[i][j] - v)));
    return m;
  }
  return CVD_MATRICES[type];
}
function renderCvd() {
  const hex = parseColor($('#toolCvdHex').value) || '#fd4a4a';
  const sev = +($('#toolCvdSeverity') && $('#toolCvdSeverity').value || 100);
  $('#toolCvdGrid').innerHTML = CVD_TYPES.map(([key, labelKey]) => {
    const c = key === 'normal' ? hex : simulateCVD(hex, cvdMatrix(key, sev));
    const label = cvdLabel(labelKey);
    return `
      <div class="cvd-cell">
        <div class="cvd-swatch" style="background:${c}"></div>
        <div class="cvd-info">
          <p class="cvd-name">${label}</p>
          <p class="cvd-hex">${c}</p>
        </div>
      </div>`;
  }).join('');
  $('#toolCvdGrid').querySelectorAll('.cvd-swatch').forEach((sw, i) => {
    const c = i === 0 ? hex : simulateCVD(hex, cvdMatrix(CVD_TYPES[i][0], sev));
    sw.addEventListener('click', async () => { await copyText(c); });
  });
}
// 图片模拟：把 ImageData 逐像素应用矩阵
function simulateImageData(imgData, matrix) {
  const d = imgData.data;
  if (matrix === 'mono') {
    for (let i = 0; i < d.length; i += 4) {
      const y = Math.round(0.299 * d[i] + 0.587 * d[i + 1] + 0.114 * d[i + 2]);
      d[i] = y; d[i + 1] = y; d[i + 2] = y;
    }
    return imgData;
  }
  for (let i = 0; i < d.length; i += 4) {
    const lr = srgbToLinear(d[i] / 255), lg = srgbToLinear(d[i + 1] / 255), lb = srgbToLinear(d[i + 2] / 255);
    const [m0, m1, m2] = matrix;
    d[i]     = Math.round(linearToSrgb(clamp(m0[0] * lr + m0[1] * lg + m0[2] * lb, 0, 1)) * 255);
    d[i + 1] = Math.round(linearToSrgb(clamp(m1[0] * lr + m1[1] * lg + m1[2] * lb, 0, 1)) * 255);
    d[i + 2] = Math.round(linearToSrgb(clamp(m2[0] * lr + m2[1] * lg + m2[2] * lb, 0, 1)) * 255);
  }
  return imgData;
}
function renderCvdImage(img) {
  const wrap = $('#toolCvdImageGrid');
  if (!wrap) return;
  wrap.innerHTML = '';
  const types = [['normal', 'cvd.type.normal'], ['protanopia', 'cvd.type.protanopia'], ['deuteranopia', 'cvd.type.deuteranopia'], ['tritanopia', 'cvd.type.tritanopia'], ['monochromacy', 'cvd.type.monochromacy']];
  types.forEach(([key, labelKey]) => {
    const label = cvdLabel(labelKey);
    const canvas = document.createElement('canvas');
    canvas.width = img.naturalWidth; canvas.height = img.naturalHeight;
    const ctx = canvas.getContext('2d');
    ctx.drawImage(img, 0, 0);
    if (key !== 'normal') {
      const id = ctx.getImageData(0, 0, canvas.width, canvas.height);
      ctx.putImageData(simulateImageData(id, cvdMatrix(key, 100)), 0, 0);
    }
    const cell = document.createElement('div');
    cell.className = 'cvd-img-cell';
    const name = document.createElement('p');
    name.className = 'cvd-img-name'; name.textContent = label;
    cell.appendChild(canvas); cell.appendChild(name);
    wrap.appendChild(cell);
  });
}
function initCvdTool() {
  if (!$('#toolCvdGrid')) return;
  const colorEl = $('#toolCvdColor'), hexEl = $('#toolCvdHex');
  colorEl.addEventListener('input', () => { hexEl.value = colorEl.value; renderCvd(); });
  hexEl.addEventListener('change', () => {
    const n = parseColor(hexEl.value);
    if (n) { hexEl.value = n; colorEl.value = n.toLowerCase(); renderCvd(); }
    else hexEl.value = colorEl.value;
  });
  $('#toolCvdPresets').querySelectorAll('.preset-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const n = btn.dataset.hex;
      hexEl.value = n; colorEl.value = n.toLowerCase();
      renderCvd();
      toast(`已载入 ${n}`);
    });
  });
  // 严重程度滑块
  const sevEl = $('#toolCvdSeverity');
  if (sevEl) {
    const sevVal = $('#toolCvdSeverityValue');
    const updateSev = () => { if (sevVal) sevVal.value = sevEl.value; renderCvd(); };
    sevEl.addEventListener('input', updateSev);
    if (sevVal) {
      sevVal.addEventListener('input', () => { const v = clamp(Math.round(+sevVal.value), 0, 100); sevEl.value = v; sevVal.value = v; renderCvd(); });
      sevVal.addEventListener('change', () => { const v = clamp(Math.round(+sevVal.value), 0, 100); sevEl.value = v; sevVal.value = v; renderCvd(); });
    }
  }
  // 图片模拟
  const imgInput = $('#toolCvdImageInput');
  const imgDrop = $('#toolCvdImageDrop');
  if (imgInput && imgDrop) {
    const loadImg = (f) => {
      if (!f || !f.type.startsWith('image/')) return;
      const img = new Image();
      const url = URL.createObjectURL(f);
      img.onload = () => { renderCvdImage(img); URL.revokeObjectURL(url); };
      img.src = url;
    };
    imgInput.addEventListener('change', e => loadImg(e.target.files[0]));
    ['dragenter', 'dragover'].forEach(ev => imgDrop.addEventListener(ev, e => { e.preventDefault(); e.stopPropagation(); imgDrop.classList.add('is-dragover'); }));
    ['dragleave', 'drop'].forEach(ev => imgDrop.addEventListener(ev, e => { e.preventDefault(); e.stopPropagation(); imgDrop.classList.remove('is-dragover'); }));
    imgDrop.addEventListener('drop', e => loadImg(e.dataTransfer.files[0]));
  }
  renderCvd();
}

/* =========================================================
   工具 4 · 颜色格式转换（14 种格式双向实时转换）
   ========================================================= */

/* 将任意格式字符串解析为 {r,g,b,a}（a 默认 1） */
function parseColorInput(str) {
  str = (str || '').trim();
  if (!str) return null;
  let m;
  // HEX（#RGB / #RRGGBB / #RRGGBBAA）
  if (/^#?([0-9a-f]{3}|[0-9a-f]{4}|[0-9a-f]{6}|[0-9a-f]{8})$/i.test(str)) {
    const h = str.replace('#', '');
    let r, g, b, a = 1;
    if (h.length === 3) { r = h[0] + h[0]; g = h[1] + h[1]; b = h[2] + h[2]; }
    else if (h.length === 4) { r = h[0] + h[0]; g = h[1] + h[1]; b = h[2] + h[2]; a = parseInt(h[3] + h[3], 16) / 255; }
    else if (h.length === 6) { r = h.slice(0, 2); g = h.slice(2, 4); b = h.slice(4, 6); }
    else { r = h.slice(0, 2); g = h.slice(2, 4); b = h.slice(4, 6); a = parseInt(h.slice(6, 8), 16) / 255; }
    return { r: parseInt(r, 16), g: parseInt(g, 16), b: parseInt(b, 16), a: +a.toFixed(3) };
  }
  // 命名颜色
  const named = CSS_COLOR_NAMES_T[str.toLowerCase()];
  if (named) return { ...hexToRgb(named), a: 1 };
  // RGB / RGBA
  m = str.match(/^rgba?\(\s*(\d{1,3}(?:\.\d+)?)\s*,\s*(\d{1,3}(?:\.\d+)?)\s*,\s*(\d{1,3}(?:\.\d+)?)\s*(?:,\s*([\d.]+)\s*)?\)/i);
  if (m) return { r: clamp(+m[1], 0, 255), g: clamp(+m[2], 0, 255), b: clamp(+m[3], 0, 255), a: m[4] != null ? clamp(+m[4], 0, 1) : 1 };
  // RGB 百分比
  if (/^rgba?\(/i.test(str) && /%/.test(str)) {
    m = str.match(/^rgba?\(\s*(\d{1,3}(?:\.\d+)?)%\s*,\s*(\d{1,3}(?:\.\d+)?)%\s*,\s*(\d{1,3}(?:\.\d+)?)%/i);
    if (m) return { r: clamp(+m[1] / 100 * 255, 0, 255), g: clamp(+m[2] / 100 * 255, 0, 255), b: clamp(+m[3] / 100 * 255, 0, 255), a: 1 };
  }
  // HSL / HSLA
  m = str.match(/^hsla?\(\s*(\d{1,3}(?:\.\d+)?)\s*,\s*(\d{1,3}(?:\.\d+)?)%\s*,\s*(\d{1,3}(?:\.\d+)?)%(?:\s*,\s*([\d.]+)\s*)?\)/i);
  if (m) { const rgb = hslToRgb(+m[1], +m[2], +m[3]); return { r: Math.round(rgb.r), g: Math.round(rgb.g), b: Math.round(rgb.b), a: m[4] != null ? clamp(+m[4], 0, 1) : 1 }; }
  // HSV / HSVA
  m = str.match(/^hsva?\(\s*(\d{1,3}(?:\.\d+)?)\s*,\s*(\d{1,3}(?:\.\d+)?)%\s*,\s*(\d{1,3}(?:\.\d+)?)%(?:\s*,\s*([\d.]+)\s*)?\)/i);
  if (m) { const rgb = hsvToRgb(+m[1], +m[2], +m[3]); return { r: Math.round(rgb.r), g: Math.round(rgb.g), b: Math.round(rgb.b), a: m[4] != null ? clamp(+m[4], 0, 1) : 1 }; }
  // CMYK
  m = str.match(/^cmyk\(\s*(\d{1,3}(?:\.\d+)?)%\s*,\s*(\d{1,3}(?:\.\d+)?)%\s*,\s*(\d{1,3}(?:\.\d+)?)%\s*,\s*(\d{1,3}(?:\.\d+)?)%/i);
  if (m) { const rgb = cmykToRgb(+m[1], +m[2], +m[3], +m[4]); return { r: Math.round(rgb.r), g: Math.round(rgb.g), b: Math.round(rgb.b), a: 1 }; }
  // HWB
  m = str.match(/^hwb\(\s*(\d{1,3}(?:\.\d+)?)\s*,\s*(\d{1,3}(?:\.\d+)?)%\s*,\s*(\d{1,3}(?:\.\d+)?)%(?:\s*,\s*([\d.]+)\s*)?\)/i);
  if (m) { const rgb = hwbToRgb(+m[1], +m[2], +m[3]); return { r: Math.round(rgb.r), g: Math.round(rgb.g), b: Math.round(rgb.b), a: m[4] != null ? clamp(+m[4], 0, 1) : 1 }; }
  // LAB
  m = str.match(/^lab\(\s*(-?[\d.]+)(?:%?)\s*,\s*(-?[\d.]+)\s*,\s*(-?[\d.]+)\s*\)/i);
  if (m) { const hex = lchToHex(...Object.values(labToLch(+m[1], +m[2], +m[3]))); const rgb = hexToRgb(hex); return { ...rgb, a: 1 }; }
  // LCH
  m = str.match(/^lch\(\s*([\d.]+)(?:%?)\s*,\s*([\d.]+)\s*,\s*([\d.]+)(?:\s*,\s*([\d.]+)\s*)?\)/i);
  if (m) { const hex = lchToHex(+m[1], +m[2], +m[3]); const rgb = hexToRgb(hex); return { ...rgb, a: m[4] != null ? clamp(+m[4], 0, 1) : 1 }; }
  // OKLCH（L 为 0–1，C、h 不带单位）
  m = str.match(/^oklch\(\s*([\d.]+)(?:%?)\s*,\s*([\d.]+)\s*,\s*([\d.]+)(?:\s*,\s*([\d.]+)\s*)?\)/i);
  if (m) { const rgb = oklchToRgb(+m[1] / 100, +m[2], +m[3]); return { r: Math.round(rgb.r), g: Math.round(rgb.g), b: Math.round(rgb.b), a: m[4] != null ? clamp(+m[4], 0, 1) : 1 }; }
  // OKLAB（L 为 0–1，a、b 不带单位）
  m = str.match(/^oklab\(\s*([\d.]+)(?:%?)\s*,\s*(-?[\d.]+)\s*,\s*(-?[\d.]+)\s*\)/i);
  if (m) { const rgb = oklabToRgb(+m[1] / 100, +m[2], +m[3]); return { r: Math.round(rgb.r), g: Math.round(rgb.g), b: Math.round(rgb.b), a: 1 }; }
  // XYZ（D65，0–1 范围；兼容 0–100 输入）
  m = str.match(/^xyz\(\s*([\d.]+)\s*,\s*([\d.]+)\s*,\s*([\d.]+)\s*\)/i);
  if (m) {
    let x = +m[1], y = +m[2], z = +m[3];
    const scale = Math.max(x, y, z) > 1.5 ? 100 : 1;
    const rgb = xyzToRgbD65(x / scale, y / scale, z / scale);
    return { r: Math.round(rgb.r), g: Math.round(rgb.g), b: Math.round(rgb.b), a: 1 };
  }
  return null;
}

/* 由 {r,g,b,a} 生成全部 14 种格式字符串 */
function buildFormatValues(r, g, b, a) {
  const r1 = clamp(Math.round(r), 0, 255), g1 = clamp(Math.round(g), 0, 255), b1 = clamp(Math.round(b), 0, 255);
  const round2 = v => Math.round(v * 100) / 100;
  const hexN = rgbToHexBytes(r1, g1, b1);
  const hexA = `#${hexN.slice(1)}${clamp(Math.round(a * 255), 0, 255).toString(16).padStart(2, '0').toUpperCase()}`;
  const hsl = rgbToHsl(r1, g1, b1);
  const hsv = rgbToHsv(r1, g1, b1);
  const cmyk = rgbToCmyk(r1, g1, b1);
  const hwb = rgbToHwb(r1, g1, b1);
  const xyz = rgbToXyzD65(r1, g1, b1);
  const lch = hexToLch(hexN);
  const oklch = rgbToOklch(r1, g1, b1);
  // RGBA / HSLA 始终带 alpha（与占位符 rgba(..., 1) 格式一致）
  const alphaAlways = `, ${round2(a)}`;
  // 反查命名色（精确匹配时展示）
  let named = '';
  for (const [name, hx] of Object.entries(CSS_COLOR_NAMES_T)) {
    if (hx.toUpperCase() === hexN) { named = name; break; }
  }
  return [
    ['HEX', hexN],
    ['HEX (Alpha)', hexA],
    ['RGB', `rgb(${r1}, ${g1}, ${b1})`],
    ['RGBA', `rgba(${r1}, ${g1}, ${b1}${alphaAlways})`],
    ['HSL', `hsl(${hsl.h}, ${hsl.s}%, ${hsl.l}%)`],
    ['HSLA', `hsla(${hsl.h}, ${hsl.s}%, ${hsl.l}%${alphaAlways})`],
    ['HSV', `hsv(${hsv.h}, ${hsv.s}%, ${hsv.v}%)`],
    ['HWB', `hwb(${hwb.h}, ${hwb.w}%, ${hwb.bl}%)`],
    ['CMYK', `cmyk(${cmyk.c}%, ${cmyk.m}%, ${cmyk.y}%, ${cmyk.k}%)`],
    ['LAB', `lab(${round2(lch.L)}%, ${round2(labFromLch(lch).a)}, ${round2(labFromLch(lch).b)})`],
    ['LCH', `lch(${round2(lch.L)}%, ${round2(lch.C)}, ${round2(lch.h)})`],
    ['XYZ', `xyz(${round2(xyz.x)}, ${round2(xyz.y)}, ${round2(xyz.z)})`],
    ['OKLCH', `oklch(${round2(oklch.L * 100)}%, ${round2(oklch.C)}, ${round2(oklch.h)})`],
    (() => { const lab = oklchToOklab(oklch.L, oklch.C, oklch.h); return ['OKLAB', `oklab(${round2(oklch.L * 100)}%, ${round2(lab.a)}, ${round2(lab.b)})`]; })(),
    named ? ['named', named] : null,
  ].filter(Boolean);
}
function labFromLch(lch) {
  const hr = lch.h * Math.PI / 180;
  return { L: lch.L, a: lch.C * Math.cos(hr), b: lch.C * Math.sin(hr) };
}

/* 渲染：根据当前某个输入框的值为源，刷新所有框 */
function renderFormat(srcId) {
  const inputs = document.querySelectorAll('.format-input-field');
  let src = null;
  if (srcId) src = document.getElementById(srcId);
  if (!src) src = inputs[0];
  const rgb = parseColorInput(src.value);
  const swatch = $('#toolFormatSwatch');
  if (!rgb) {
    if (swatch) swatch.style.background = cssVar('--swatch-empty') || '#d0d0d0';
    inputs.forEach(inp => { if (inp !== src) inp.value = ''; });
    return;
  }
  const { r, g, b, a } = rgb;
  const hex = rgbToHexBytes(clamp(Math.round(r), 0, 255), clamp(Math.round(g), 0, 255), clamp(Math.round(b), 0, 255));
  if (swatch) swatch.style.background = hex;
  const values = buildFormatValues(r, g, b, a);
  // 同步所有输入框（源框不动，其余填充其对应格式）
  const map = {
    'fi-hex': values.find(v => v[0] === 'HEX')[1],
    'fi-hexa': values.find(v => v[0] === 'HEX (Alpha)')[1],
    'fi-rgb': values.find(v => v[0] === 'RGB')[1],
    'fi-rgba': values.find(v => v[0] === 'RGBA')[1],
    'fi-hsl': values.find(v => v[0] === 'HSL')[1],
    'fi-hsla': values.find(v => v[0] === 'HSLA')[1],
    'fi-hsv': values.find(v => v[0] === 'HSV')[1],
    'fi-hwb': values.find(v => v[0] === 'HWB')[1],
    'fi-cmyk': values.find(v => v[0] === 'CMYK')[1],
    'fi-lab': values.find(v => v[0] === 'LAB')[1],
    'fi-lch': values.find(v => v[0] === 'LCH')[1],
    'fi-oklch': values.find(v => v[0] === 'OKLCH')[1],
    'fi-oklab': values.find(v => v[0] === 'OKLAB')[1],
    'fi-xyz': values.find(v => v[0] === 'XYZ')[1],
    'fi-named': values.find(v => v[0] === 'named') ? values.find(v => v[0] === 'named')[1] : '',
  };
  inputs.forEach(inp => {
    if (inp === src) return;
    const key = inp.id;
    if (map[key] !== undefined) inp.value = map[key];
  });
  // 字段小色板 + Hero 文本
  // 小色板统一用 HEX 作为背景：HSV/HWB/CMYK/LAB/LCH/OKLAB/OKLCH/XYZ 等
  // 浏览器原生 CSS 并不全部支持或实现不一致，直接用作 background 会显示空白。
  document.querySelectorAll('.format-field-swatch').forEach(sw => {
    sw.style.background = hex;
  });
  const heroName = $('#toolFormatHeroName'), heroHex = $('#toolFormatHeroHex');
  if (heroHex) heroHex.textContent = hex;
  if (heroName) {
    const nm = values.find(v => v[0] === 'named');
    heroName.textContent = nm ? nm[1] : (window.i18n ? window.i18n.t('format.livePreview') : '实时预览');
  }
}
function initFormatTool() {
  if (!$('#toolFormatSwatch')) return;
  const inputs = document.querySelectorAll('.format-input-field');
  if (!inputs.length) return;
  inputs.forEach(inp => {
    inp.addEventListener('input', () => renderFormat(inp.id));
    inp.addEventListener('focus', () => inp.select());
  });
  // 默认显示颜色设为主题色（品牌强调色 --accent）
  const themeHex = cssVar('--accent') || '#FF4B4B';
  const hexInput = $('#fi-hex');
  if (hexInput && !hexInput.value.trim()) hexInput.value = themeHex;
  renderFormat('fi-hex');
}

/* =========================================================
   工具 5 · 对比度检查器（WCAG 2.1）
   ========================================================= */
function luminance(hex) {
  const { r, g, b } = hexToRgb(hex);
  return 0.2126 * srgbToLinear(r / 255) + 0.7152 * srgbToLinear(g / 255) + 0.0722 * srgbToLinear(b / 255);
}
function contrastRatio(a, b) {
  const la = luminance(a), lb = luminance(b);
  const hi = Math.max(la, lb), lo = Math.min(la, lb);
  return (hi + 0.05) / (lo + 0.05);
}

/* 在 L 轴上搜索使对比度达到 target 的最接近前景色（保持 h/s 不变） */
function adjustFgForContrast(bgHex, baseFgHex, target) {
  let { h, s, l } = rgbToHsl(...Object.values(hexToRgb(baseFgHex)));
  const bgL = rgbToHsl(...Object.values(hexToRgb(bgHex))).l;
  const dir = l >= bgL ? 1 : -1; // 朝远离背景明度的方向调整
  let best = baseFgHex, bestDiff = Infinity;
  for (let step = 0; step <= 100; step++) {
    let L = clamp(l + dir * step, 0, 100);
    const cand = rgbToHexBytes(...Object.values(hslToRgb(h, s, L)));
    const r = contrastRatio(cand, bgHex);
    if (r >= target) return cand;
    const diff = Math.abs(r - target);
    if (diff < bestDiff) { bestDiff = diff; best = cand; }
  }
  return best;
}

/* 镜像：调整背景色使对比度达到 target */
function adjustBgForContrast(fgHex, baseBgHex, target) {
  let { h, s, l } = rgbToHsl(...Object.values(hexToRgb(baseBgHex)));
  const fgL = rgbToHsl(...Object.values(hexToRgb(fgHex))).l;
  const dir = l >= fgL ? 1 : -1;
  let best = baseBgHex, bestDiff = Infinity;
  for (let step = 0; step <= 100; step++) {
    let L = clamp(l + dir * step, 0, 100);
    const cand = rgbToHexBytes(...Object.values(hslToRgb(h, s, L)));
    const r = contrastRatio(fgHex, cand);
    if (r >= target) return cand;
    const diff = Math.abs(r - target);
    if (diff < bestDiff) { bestDiff = diff; best = cand; }
  }
  return best;
}

function renderContrast() {
  const cfg = getContrastConfig();
  const fgRaw = $('#toolContrastFgHex').value;
  const bgRaw = $('#toolContrastBgHex').value;
  const fg = parseColor(fgRaw);
  const bg = parseColor(bgRaw);
  // 解析失败使用回退色，保证页面不崩
  const fgSafe = fg || '#111111';
  const bgSafe = bg || '#ffffff';
  $('#toolContrastFg').value = fgSafe.toLowerCase();
  $('#toolContrastBg').value = bgSafe.toLowerCase();
  if (fg) $('#toolContrastFgHex').value = fg;
  if (bg) $('#toolContrastBgHex').value = bg;
  if ($('#toolContrastFgCircle')) $('#toolContrastFgCircle').style.background = fgSafe;
  if ($('#toolContrastBgCircle')) $('#toolContrastBgCircle').style.background = bgSafe;

  const ratio = contrastRatio(fgSafe, bgSafe);

  // 阈值明细判定（使用 WCAG 2.1 默认阈值）
  const set = (sel, pass) => {
    const el = document.querySelector(`.threshold-state[data-level="${sel}"]`);
    if (!el) return;
    el.textContent = pass ? (window.i18n ? window.i18n.t('contrast.state.pass') : '通过') : (window.i18n ? window.i18n.t('contrast.state.fail') : '失败');
    el.className = 'threshold-state ' + (pass ? 'pass' : 'fail');
  };
  set('aa', ratio >= cfg.thresholds['normal-aa']);
  set('aaa', ratio >= cfg.thresholds['normal-aaa']);
  set('aa-lg', ratio >= cfg.thresholds['large-aa']);
  set('aaa-lg', ratio >= cfg.thresholds['large-aaa']);
  set('ui', ratio >= cfg.thresholds['ui']);

  // 主徽章：基于核心 AA 4.5 判定（统一标准，不再有自定义目标）
  const pass = ratio >= cfg.thresholds['normal-aa'];
  const valEl = $('#toolContrastValue');
  if (valEl) valEl.textContent = `${ratio.toFixed(2)}:1`;

  const badge = $('#toolContrastBadge');
  badge.className = 'contrast-badge ' + (pass ? 'level-aa' : 'level-fail');
  badge.textContent = pass ? (window.i18n ? window.i18n.t('contrast.badge.pass') : '已达标') : (window.i18n ? window.i18n.t('contrast.badge.fail') : '未达标');

  // 刻度条：1:1 → 21:1 线性映射，颜色跟随达标档位（AAA/AA 绿、AA Large 黄、其余红）
  const scaleFill = $('#toolContrastScaleFill');
  if (scaleFill) {
    const pct = Math.max(0, Math.min(1, (ratio - 1) / 20)) * 100;
    scaleFill.style.width = pct.toFixed(2) + '%';
    scaleFill.className = 'contrast-scale-fill ' +
      (ratio >= cfg.thresholds['normal-aa'] ? 'lv-good' : ratio >= cfg.thresholds['large-aa'] ? 'lv-warn' : 'lv-bad');
  }

  // 色板预览：合并容器内的三段文本同时上色
  const fgCss = hexToRgba(fgSafe, 1);
  const bgCss = hexToRgba(bgSafe, 1);
  ['toolContrastSampleSm', 'toolContrastSampleLg', 'toolContrastSampleBold'].forEach(id => {
    const el = $('#' + id);
    if (el) { el.style.color = fgCss; el.style.background = bgCss; }
  });

  // 对比建议：根据当前对比度给出使用建议（同步语气与状态色）
  const sug = $('#toolContrastSuggestion');
  if (sug) {
    const r = ratio;
    const rt = window.i18n ? window.i18n.t.bind(window.i18n) : (k) => k;
    const fill = (k) => rt(k).replace('{ratio}', r.toFixed(2));
    let html = '';
    let cls = 'is-bad';
    if (r >= cfg.thresholds['normal-aaa']) {
      cls = 'is-good';
      html = fill('contrast.suggest.aaa');
    } else if (r >= cfg.thresholds['normal-aa']) {
      cls = 'is-good';
      html = fill('contrast.suggest.aa');
    } else if (r >= cfg.thresholds['large-aa']) {
      cls = 'is-warn';
      html = fill('contrast.suggest.large');
    } else {
      cls = 'is-bad';
      html = fill('contrast.suggest.fail');
    }
    sug.className = 'contrast-suggestion ' + cls;
    sug.innerHTML = html;
  }
}

/* 读取顶部“目标对比度”输入值（已废弃，统一基于 WCAG AA 4.5 判定） */

/* 读取对比度配置：当前目标 + 自定义阈值（小工具容器环境，直接使用默认值） */
function getContrastConfig() {
  const DEFAULTS = {
    target: 'normal-aa',
    thresholds: { 'normal-aa': 4.5, 'normal-aaa': 7, 'large-aa': 3, 'large-aaa': 4.5, 'ui': 3 }
  };
  return {
    target: DEFAULTS.target,
    thresholds: Object.assign({}, DEFAULTS.thresholds)
  };
}
function saveContrastConfig(cfg) {
  /* 小工具容器环境跳过持久化 */
}

function initContrastTool() {
  if (!$('#toolContrastFg')) return;
  const fgColor = $('#toolContrastFg'), fgHex = $('#toolContrastFgHex');
  const bgColor = $('#toolContrastBg'), bgHex = $('#toolContrastBgHex');
  fgColor.addEventListener('input', () => { fgHex.value = fgColor.value; renderContrast(); });
  fgHex.addEventListener('input', () => { const n = parseColor(fgHex.value); if (n) renderContrast(); });
  fgHex.addEventListener('change', () => { const n = parseColor(fgHex.value); if (n) fgHex.value = n; renderContrast(); });
  bgColor.addEventListener('input', () => { bgHex.value = bgColor.value; renderContrast(); });
  bgHex.addEventListener('input', () => { const n = parseColor(bgHex.value); if (n) renderContrast(); });
  bgHex.addEventListener('change', () => { const n = parseColor(bgHex.value); if (n) bgHex.value = n; renderContrast(); });
  $('#toolContrastSwap').addEventListener('click', () => {
    const t = fgHex.value; fgHex.value = bgHex.value; bgHex.value = t;
    renderContrast();
  });

  renderContrast();
}

/* =========================================================
   跨工具同步：浮动搜索一键应用到所有取色工具
   ========================================================= */
function applyColorToTools(hex) {
  const norm = parseColor(hex);
  if (!norm) return;
  if ($('#palHex')) { $('#palHex').value = norm; $('#palColorInput').value = norm.toLowerCase(); generatePalette(); }
  if ($('#toolCvdHex')) { $('#toolCvdHex').value = norm; $('#toolCvdColor').value = norm.toLowerCase(); renderCvd(); }
}

/* =========================================================
   启动
   ========================================================= */
initFloating();
initImageTool();
initPaletteTool();
initCvdTool();
initFormatTool();
initContrastTool();
initGradientTool();

/* 切换语言时重渲染各工具动态文本 */
if (window.i18n) window.i18n.onChange(() => {
  try { renderCvd(); } catch (e) {}
  try { generatePalette(); } catch (e) {}
  try { renderFormat(); } catch (e) {}
  try { renderContrast(); } catch (e) {}
});

/* =========================================================
   渐变色调试（gradient）· ColorFlow 风格可视化渐变编辑器
   - 线性 / 径向 / 角度 / 多色 四种渐变类型
   - Canvas 实时预览 + 方向手柄拖拽
   - 色标增删改 / 位置拖拽 / 颜色选择
   - CSS 代码实时生成、复制、导出
   - 渐变上文字对比度检查 + 无障碍提示
   - 历史方案管理
   ========================================================= */
function initGradientTool() {
  /* 渐变工具已由 gradient.js 独立接管（新版 ID：#gradTrack / #typeRow 等）。
     此处旧实现仅在"旧版渐变页"（含 #gradTypeTabs）存在时初始化，
     避免与 gradient.js 新版结构冲突导致 null 报错。 */
  if (!$('#gradTypeTabs')) return;
  const canvas = $('#gradCanvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  const typeTabs = $('#gradTypeTabs');
  const stopsEl = $('#gradStops');
  const handle = $('#gradHandle');
  const fields = $('#gradFields');
  const cssEl = $('#gradCss');

  // 渐变状态
  let type = 'linear';
  let angle = 90;          // 线性/角度渐变角度（度）
  let cx = 50, cy = 50;    // 径向/角度中心（%）
  let stops = [
    { pos: 0,  color: '#ff5f6d' },
    { pos: 100, color: '#ffc371' }
  ];
  const MAX_STOPS = 12;
  // 菱形专用状态
  let dRadius = 40;   // 半径点距中心的距离（% of max(宽,高)）
  let dWidth = 0.55;  // 宽窄比（短轴/长轴，0.15~1.5）

  function normalizeHex(h) { return (h || '').trim().toUpperCase(); }

  /* ---------- 颜色工具（菱形逐像素渲染用） ---------- */
  function hexToRgb(hex) {
    const s = (hex || '#000').replace('#', '');
    const n = parseInt(s.length === 3 ? s[0]+s[0]+s[1]+s[1]+s[2]+s[2] : s, 16);
    return { r: (n >> 16) & 255, g: (n >> 8) & 255, b: n & 255 };
  }
  function rgbToHex(r, g, b) {
    return '#' + [r, g, b].map(v => Math.max(0, Math.min(255, Math.round(v))).toString(16).padStart(2, '0')).join('');
  }
  function lerpColor(c1, c2, t) {
    t = clamp(t, 0, 1);
    return {
      r: c1.r + (c2.r - c1.r) * t,
      g: c1.g + (c2.g - c1.g) * t,
      b: c1.b + (c2.b - c1.b) * t
    };
  }
  /** 根据归一化距离 t（0=中心, 1=边缘）从色标数组插值颜色 */
  function sampleGradientColor(sortedStops, t) {
    t = clamp(t, 0, 1);
    if (!sortedStops.length) return hexToRgb('#888');
    if (sortedStops.length === 1 || t <= 0) return hexToRgb(sortedStops[0].color);
    if (t >= 1) return hexToRgb(sortedStops[sortedStops.length - 1].color);
    for (let i = 0; i < sortedStops.length - 1; i++) {
      const p0 = sortedStops[i].pos / 100, p1 = sortedStops[i + 1].pos / 100;
      if (t >= p0 && t <= p1) {
        const lt = p1 > p0 ? (t - p0) / (p1 - p0) : 0;
        return lerpColor(hexToRgb(sortedStops[i].color), hexToRgb(sortedStops[i + 1].color), lt);
      }
    }
    return hexToRgb(sortedStops[sortedStops.length - 1].color);
  }

  /* ---------- 渲染渐变到 Canvas ---------- */
  function render() {
    const w = canvas.width, h = canvas.height;
    ctx.clearRect(0, 0, w, h);
    const sorted = stops.slice().sort((a, b) => a.pos - b.pos);
    if (type === 'diamond') {
      // ═══ 真菱形渐变（Diamond Gradient）═══
      // 模型：中心点(cx,cy) + 半径向量(角度angle, 长度dRadius) + 宽窄比(dWidth)
      // 菱形坐标系：u=沿半径轴, v=沿垂直短轴; 归一化距离 d=(|u|+|v|)/2
      // d=0 → 中心色, d=1 → 边缘色; 色标沿 0→100% 映射到 d
      const centerX = w * cx / 100;
      const centerY = h * cy / 100;
      const rad = (angle * Math.PI) / 180;
      const maxDim = Math.max(w, h);
      const radiusPx = Math.max(8, (dRadius / 100) * maxDim);   // 半径（像素）
      const widthPx = Math.max(4, radiusPx * clamp(dWidth, 0.15, 1.5)); // 短轴半长
      // 菱形轴向单位向量
      const ux = Math.cos(rad), uy = Math.sin(rad);       // 长轴方向
      const vx = -uy, vy = ux;                             // 短轴方向（垂直）
      const imgData = ctx.createImageData(w, h);
      const pixels = imgData.data;
      for (let py = 0; py < h; py++) {
        for (let px = 0; px < w; px++) {
          const dx = px - centerX, dy = py - centerY;
          // 变换到菱形局部坐标
          const u = (dx * ux + dy * uy) / radiusPx;   // 长轴归一化 [-1, 1]
          const v = (dx * vx + dy * vy) / widthPx;     // 短轴归一化 [-1, 1]
          // 曼哈顿距离归一化 → d ∈ [0, ∞]，d=1 为菱形边界
          const dist = (Math.abs(u) + Math.abs(v)) / 2;
          const t = clamp(dist, 0, 1);                  // 裁剪到 [0,1]
          const c = sampleGradientColor(sorted, t);
          const idx = (py * w + px) * 4;
          pixels[idx] = c.r; pixels[idx + 1] = c.g;
          pixels[idx + 2] = c.b; pixels[idx + 3] = 255;
        }
      }
      ctx.putImageData(imgData, 0, 0);
      // 绘制菱形辅助线：中心→半径连线 + 中心→宽度连线
      ctx.save();
      ctx.strokeStyle = 'rgba(255,255,255,0.55)';
      ctx.lineWidth = 1.2;
      ctx.setLineDash([4, 3]);
      // 长轴线
      ctx.beginPath();
      ctx.moveTo(centerX, centerY);
      ctx.lineTo(centerX + ux * radiusPx, centerY + uy * radiusPx);
      ctx.stroke();
      // 短轴线
      ctx.beginPath();
      ctx.moveTo(centerX, centerY);
      ctx.lineTo(centerX + vx * widthPx, centerY + vy * widthPx);
      ctx.stroke();
      ctx.restore();
    } else {
      let grad;
      if (type === 'linear') {
        const rad = (angle * Math.PI) / 180;
        const x1 = w / 2 - Math.cos(rad) * w, y1 = h / 2 - Math.sin(rad) * w;
        const x2 = w / 2 + Math.cos(rad) * w, y2 = h / 2 + Math.sin(rad) * w;
        grad = ctx.createLinearGradient(x1, y1, x2, y2);
      } else if (type === 'radial') {
        grad = ctx.createRadialGradient(w * cx / 100, h * cy / 100, 0, w * cx / 100, h * cy / 100, Math.max(w, h));
      } else { // conic
        grad = ctx.createConicGradient((90 - angle) * Math.PI / 180, w * cx / 100, h * cy / 100);
      }
      sorted.forEach(s => grad.addColorStop(clamp(s.pos, 0, 100) / 100, s.color));
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, w, h);
    }
    updateHandle();
    updateCss();
    renderStops();
  }

  /* ---------- 方向手柄 ---------- */
  function updateHandle() {
    const rect = canvas.getBoundingClientRect();
    const px = (p) => (p / 100) * rect.width;
    const py = (p) => (p / 100) * rect.height;
    if (type === 'linear') {
      const rad = (angle * Math.PI) / 180;
      handle.style.left = (px(50) + Math.cos(rad) * rect.width * 0.35) + 'px';
      handle.style.top = (py(50) + Math.sin(rad) * rect.width * 0.35) + 'px';
      handle.style.display = 'block';
      resetHandleStyle(handle);
      handle.classList.add('grad-handle--radial');
      fields.hidden = false;
      hideDiamondHandles();
    } else if (type === 'radial' || type === 'conic') {
      handle.style.left = px(cx) + 'px';
      handle.style.top = py(cy) + 'px';
      handle.style.display = 'block';
      resetHandleStyle(handle);
      handle.classList.remove('grad-handle--radial');
      fields.hidden = false;
      hideDiamondHandles();
    } else if (type === 'diamond') {
      // 菱形三手柄：中心点(方) + 半径点(圆,连线) + 宽度点(圆)
      const dRad = (angle * Math.PI) / 180;
      const maxDim = Math.max(rect.width, rect.height);
      const rPx = (dRadius / 100) * maxDim;
      const wPx = rPx * clamp(dWidth, 0.15, 1.5);
      // 中心手柄（方形）
      handle.style.left = px(cx) + 'px';
      handle.style.top = py(cy) + 'px';
      handle.style.display = 'block';
      handle.style.borderRadius = '3px';
      handle.style.width = '18px'; handle.style.height = '18px';
      handle.style.background = '#fff';
      handle.style.borderColor = 'var(--accent, #fd4a4a)';
      handle.style.borderWidth = '2.5px';
      handle.classList.remove('grad-handle--radial');
      handle.dataset.diamondRole = 'center';
      // 半径手柄
      let rh = $('#gradHandleRadius');
      if (!rh) {
        rh = document.createElement('button'); rh.type = 'button';
        rh.id = 'gradHandleRadius'; rh.className = 'grad-handle grad-handle--radius-pt';
        rh.setAttribute('aria-label', '拖拽调整菱形半径和方向');
        canvas.parentElement.appendChild(rh);
      }
      rh.style.left = (px(cx) + Math.cos(dRad) * rPx) + 'px';
      rh.style.top = (py(cy) + Math.sin(dRad) * rPx) + 'px';
      rh.style.display = 'block'; rh.dataset.diamondRole = 'radius';
      // 宽度手柄（垂直于半径方向）
      let wh = $('#gradHandleWidth');
      if (!wh) {
        wh = document.createElement('button'); wh.type = 'button';
        wh.id = 'gradHandleWidth'; wh.className = 'grad-handle grad-handle--width-pt';
        wh.setAttribute('aria-label', '拖拽调整菱形宽度');
        canvas.parentElement.appendChild(wh);
      }
      wh.style.left = (px(cx) + (-Math.sin(dRad)) * wPx) + 'px';
      wh.style.top = (py(cy) + Math.cos(dRad) * wPx) + 'px';
      wh.style.display = 'block'; wh.dataset.diamondRole = 'width';
      fields.hidden = false;
    } else {
      handle.style.display = 'none';
      hideDiamondHandles();
    }
    /* ---------- 字段可见性 ---------- */
    const angField = angleInput && angleInput.parentElement;
    const posXField = $('#gradPosX') && $('#gradPosX').parentElement;
    const posYField = $('#gradPosY') && $('#gradPosY').parentElement;
    if (angField) angField.style.display = '';
    if (posXField) posXField.style.display = (type === 'diamond') ? 'none' : '';
    if (posYField) posYField.style.display = (type === 'diamond') ? 'none' : '';
    // 菱形额外字段：半径 / 宽窄比
    let radField = $('#gradDiamondRadius');
    if (!radField) {
      // 动态插入半径和宽窄比输入框到 gradFields
      const flds = $('#gradFields');
      if (flds) {
        radField = document.createElement('div'); radField.className = 'grad-field'; radField.id = 'gradDiamondRadius';
        const t = (k, f) => (window.i18n ? window.i18n.t(k) : f);
        radField.innerHTML = '<label class="grad-field-label" for="gradDRadius">' + t('gradient.field.radius', '半径') + '</label><input id="gradDRadius" type="number" min="5" max="100" value="' + dRadius + '" step="1" aria-label="' + t('gradient.field.radiusAria', '菱形半径') + '" />';
        let widField = document.createElement('div'); widField.className = 'grad-field'; widField.id = 'gradDiamondWidth';
        widField.innerHTML = '<label class="grad-field-label" for="gradDWidth">' + t('gradient.field.width', '宽窄') + '</label><input id="gradDWidth" type="number" min="15" max="150" value="' + Math.round(dWidth * 100) + '" step="1" aria-label="' + t('gradient.field.widthAria', '菱形宽窄比') + '" />';
        flds.appendChild(radField); flds.appendChild(widField);
        // 绑定事件
        $('#gradDRadius').addEventListener('input', () => { dRadius = clamp(parseInt($('#gradDRadius').value, 10) || 40, 5, 100); render(); });
        $('#gradDWidth').addEventListener('input', () => { dWidth = (clamp(parseInt($('#gradDWidth').value, 10) || 55, 15, 150)) / 100; render(); });
      }
    }
    if (radField) radField.style.display = (type === 'diamond') ? '' : 'none';
    const widFieldEl = $('#gradDiamondWidth');
    if (widFieldEl) widFieldEl.style.display = (type === 'diamond') ? '' : 'none';
    // 同步值
    const dRInput = $('#gradDRadius');
    const dWInput = $('#gradDWidth');
    if (dRInput && type === 'diamond') dRInput.value = dRadius;
    if (dWInput && type === 'diamond') dWInput.value = Math.round(dWidth * 100);
  }

  /** 重置主手柄为默认圆形样式 */
  function resetHandleStyle(el) {
    el.style.borderRadius = '50%';
    el.style.width = '22px'; el.style.height = '22px';
    el.style.background = 'var(--accent, #fd4a4a)';
    el.style.borderColor = '#fff';
    el.style.borderWidth = '2px';
    delete el.dataset.diamondRole;
  }
  /** 隐藏菱形额外手柄 */
  function hideDiamondHandles() {
    var rh = $('#gradHandleRadius'), wh = $('#gradHandleWidth');
    if (rh) rh.style.display = 'none';
    if (wh) wh.style.display = 'none';
  }

  /* ---------- 色标列表 ---------- */
  function renderStops() {
    const sorted = stops.slice().sort((a, b) => a.pos - b.pos);
    const t = (k, f) => (window.i18n ? window.i18n.t(k) : f);
    stopsEl.innerHTML = sorted.map((s, i) =>
      '<div class="grad-stop-row" data-idx="' + i + '">' +
        '<input type="color" class="grad-stop-color" value="' + s.color + '" aria-label="' + t('gradient.stop.colorAria', '色标颜色') + ' ' + (i + 1) + '" />' +
        '<span class="grad-stop-preview" style="background:' + s.color + '"></span>' +
        '<span class="grad-stop-inputs">' +
          '<input type="text" class="grad-stop-hex" value="' + s.color + '" maxlength="7" spellcheck="false" aria-label="' + t('gradient.stop.valueAria', '色标颜色值') + '" />' +
          '<input type="number" class="grad-stop-pos" value="' + Math.round(s.pos) + '" min="0" max="100" step="1" aria-label="' + t('gradient.stop.posAria', '色标位置（%）') + '" />' +
        '</span>' +
        '<button class="grad-stop-remove" type="button" ' + (stops.length <= 2 ? 'disabled' : '') + ' aria-label="' + t('gradient.stop.removeAria', '删除色标') + '">' +
          '<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>' +
        '</button>' +
      '</div>'
    ).join('');
  }

  if (window.i18n) window.i18n.onChange(() => { try { renderStops(); } catch (e) {} });

  /* ---------- 更新色标状态 ---------- */
  function syncStops() {
    // 从 DOM 读取（保留引用，颜色/位置统一由 renderStops 后的行内元素驱动）
  }

  /* ---------- CSS 代码生成 ---------- */
  function buildCss() {
    const sorted = stops.slice().sort((a, b) => a.pos - b.pos);
    const cs = sorted.map(s => s.color + ' ' + s.pos + '%').join(', ');
    let value;
    if (type === 'linear') value = 'linear-gradient(' + angle + 'deg, ' + cs + ')';
    else if (type === 'radial') value = 'radial-gradient(circle at ' + cx + '% ' + cy + '%, ' + cs + ')';
    else if (type === 'conic') value = 'conic-gradient(from ' + angle + 'deg at ' + cx + '% ' + cy + '%, ' + cs + ')';
    else if (type === 'diamond') {
      // 菱形渐变：用 conic-gradient 多色标近似 + 注释说明
      // 真菱形在 CSS 中无原生等价物，此处用 conic-gradient 做最佳近似
      const sorted = stops.slice().sort((a, b) => a.pos - b.pos);
      // 构建 8 方向色标（模拟菱形对称）
      const c0 = sorted[0].color, cn = sorted[sorted.length - 1].color;
      const midStops = sorted.slice(1, -1);
      value = 'conic-gradient(from ' + angle + 'deg at ' + cx + '% ' + cy + '%, ';
      // 8 段近似菱形：中心→右上→右→右下→下→左下→左→左上→中心
      var dStops = [];
      dStops.push(c0 + ' 0%');
      midStops.forEach(function(s, i) {
        var p = s.pos / 100;
        dStops.push(s.color + ' ' + (p * 25).toFixed(1) + '%');
      });
      dStops.push(cn + ' 25%, ' + cn + ' 37.5%');
      for (var i = midStops.length - 1; i >= 0; i--) {
        var p2 = midStops[i].pos / 100;
        dStops.push(midStops[i].color + ' ' + (50 - p2 * 12.5).toFixed(1) + '%');
      }
      dStops.push(c0 + ' 50%, ' + c0 + ' 62.5%');
      midStops.forEach(function(s, i) {
        var p3 = s.pos / 100;
        dStops.push(s.color + ' ' + (50 + p3 * 25).toFixed(1) + '%');
      });
      dStops.push(cn + ' 75%, ' + cn + ' 87.5%');
      for (var j = midStops.length - 1; j >= 0; j--) {
        var p4 = midStops[j].pos / 100;
        dStops.push(midStops[j].color + ' ' + (100 - p4 * 12.5).toFixed(1) + '%');
      }
      dStops.push(c0 + ' 100%');
      value += dStops.join(', ') + ')';
      /* ═══ 注意 ═══
       * 菱形渐变在 CSS 中无原生支持。
       * 以上 conic-gradient 为视觉近似，精确渲染请用 Canvas/SVG。
       * 参数：角度=' + angle + '° 中心=' + cx + '%,' + cy + '% 半径=' + dRadius + '% 宽窄=' + dWidth.toFixed(2)
       */
    }
    else value = 'linear-gradient(90deg, ' + cs + ')';
    return '.gradient {\n  background: ' + value + ';\n}';
  }
  function updateCss() {
    if (cssEl) cssEl.textContent = buildCss();
  }

  /* ---------- 事件绑定 ---------- */
  // 类型切换
  typeTabs.querySelectorAll('.grad-type-tab').forEach(tab => {
    tab.addEventListener('click', () => {
      typeTabs.querySelectorAll('.grad-type-tab').forEach(t => { t.classList.remove('is-active'); t.setAttribute('aria-selected', 'false'); });
      tab.classList.add('is-active'); tab.setAttribute('aria-selected', 'true');
      type = tab.dataset.type;
      render();
    });
  });

  // 色标：颜色/位置/删除（事件委托）
  stopsEl.addEventListener('input', (e) => {
    const row = e.target.closest('.grad-stop-row'); if (!row) return;
    const idx = parseInt(row.dataset.idx, 10);
    if (e.target.classList.contains('grad-stop-color') || e.target.classList.contains('grad-stop-hex')) {
      const val = e.target.classList.contains('grad-stop-color') ? e.target.value : e.target.value.trim();
      if (val && stops[idx]) stops[idx].color = val;
      // 同步预览
      const prev = row.querySelector('.grad-stop-preview');
      if (prev && stops[idx]) prev.style.background = stops[idx].color;
      render();
    } else if (e.target.classList.contains('grad-stop-pos')) {
      const v = clamp(parseInt(e.target.value, 10) || 0, 0, 100);
      if (stops[idx]) stops[idx].pos = v;
      render();
    }
  });
  stopsEl.addEventListener('click', (e) => {
    const btn = e.target.closest('.grad-stop-remove'); if (!btn || btn.disabled) return;
    const row = btn.closest('.grad-stop-row'); if (!row) return;
    stops.splice(parseInt(row.dataset.idx, 10), 1);
    render();
  });

  // 添加色标
  $('#gradAddStop').addEventListener('click', () => {
    if (stops.length >= MAX_STOPS) { toast('最多支持 ' + MAX_STOPS + ' 个色标'); return; }
    const sorted = stops.slice().sort((a, b) => a.pos - b.pos);
    const last = sorted[sorted.length - 1];
    stops.push({ pos: Math.min(100, last.pos + 10), color: last.color });
    render();
  });

  // 预设方案
  const presets = [
    ['linear', 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'],
    ['radial', 'radial-gradient(circle at 50% 50%, #f093fb 0%, #f5576c 100%)'],
    ['conic', 'conic-gradient(from 45deg at 50% 50%, #ff9a9e 0%, #fecfef 50%, #ff9a9e 100%)'],
    ['diamond', 'conic-gradient(from 45deg at 50% 50%, #e0c3fc 0%, #8ec5fc 25%, #e0c3fc 50%, #8ec5fc 75%, #e0c3fc 100%)']
  ];
  let presetIdx = 0;
  $('#gradPreset').addEventListener('click', () => {
    presetIdx = (presetIdx + 1) % presets.length;
    const [ptype, val] = presets[presetIdx];
    applyCssValue(val, ptype);
    toast('已应用预设：' + (['linear', 'radial', 'conic', 'diamond'])[presetIdx]);
  });
  function applyCssValue(value, forceType) {
    // 解析 CSS 渐变字符串，还原为状态
    const m = value.match(/^(linear-gradient|radial-gradient|conic-gradient)\((.*)\)$/);
    if (!m) return;
    const kind = forceType || m[1].replace('-gradient', '');
    // 提取角度/位置
    const args = m[2];
    let angleMatch = args.match(/^(\d+)deg/), atMatch = args.match(/at (\d+)% (\d+)%/);
    // 提取色标
    const stopList = [];
    args.split(',').forEach(seg => {
      const sm = seg.trim().match(/^(\#[0-9a-fA-F]{3,8})\s+(\d+)%$/);
      if (sm) stopList.push({ pos: parseInt(sm[2], 10), color: sm[1] });
    });
    if (!stopList.length) return;
    stops = stopList;
    type = (kind === 'linear') ? (stopList.length > 2 ? 'diamond' : 'linear') : kind;
    if (angleMatch) angle = parseInt(angleMatch[1], 10);
    if (atMatch) { cx = parseInt(atMatch[1], 10); cy = parseInt(atMatch[2], 10); }
    // 同步 tab 高亮
    typeTabs.querySelectorAll('.grad-type-tab').forEach(t => {
      const on = t.dataset.type === type;
      t.classList.toggle('is-active', on); t.setAttribute('aria-selected', String(on));
    });
    render();
  }

  // 角度/位置字段
  const angleInput = $('#gradAngle'), posX = $('#gradPosX'), posY = $('#gradPosY');
  angleInput.addEventListener('input', () => { angle = clamp(parseInt(angleInput.value, 10) || 0, 0, 360); render(); });
  posX.addEventListener('input', () => { cx = clamp(parseInt(posX.value, 10) || 0, 0, 100); render(); });
  posY.addEventListener('input', () => { cy = clamp(parseInt(posY.value, 10) || 0, 0, 100); render(); });

  // 方向手柄拖拽（鼠标 + 触摸）—— 支持菱形三手柄
  let dragging = false;
  let dragTarget = null; // 'center' | 'radius' | 'width' | null
  function onDrag(e) {
    if (!dragging || !dragTarget) return;
    e.preventDefault();
    const rect = canvas.getBoundingClientRect();
    const mx = (e.touches ? e.touches[0].clientX : e.clientX) - rect.left;
    const my = (e.touches ? e.touches[0].clientY : e.clientY) - rect.top;

    if (type === 'diamond') {
      if (dragTarget === 'center') {
        // 中心点：移动菱形原点
        cx = Math.round(clamp((mx / rect.width) * 100, 0, 100));
        cy = Math.round(clamp((my / rect.height) * 100, 0, 100));
      } else if (dragTarget === 'radius') {
        // 半径点：改变方向(角度) + 长度
        const centerX = rect.width * cx / 100;
        const centerY = rect.height * cy / 100;
        const dx = mx - centerX, dy = my - centerY;
        const dist = Math.sqrt(dx * dx + dy * dy);
        angle = Math.round(Math.atan2(dy, dx) * 180 / Math.PI);
        dRadius = clamp(Math.round((dist / Math.max(rect.width, rect.height)) * 100), 5, 100);
        if (angleInput) angleInput.value = angle;
      } else if (dragTarget === 'width') {
        // 宽度点：改变宽窄比（垂直于半径方向的距离）
        const rad = (angle * Math.PI) / 180;
        const centerX = rect.width * cx / 100;
        const centerY = rect.height * cy / 100;
        const dx = mx - centerX, dy = my - centerY;
        // 投影到垂直方向
        const perpDist = (-Math.sin(rad)) * dx + Math.cos(rad) * dy;
        const maxDim = Math.max(rect.width, rect.height);
        const radiusPx = (dRadius / 100) * maxDim;
        if (radiusPx > 0) {
          dWidth = clamp(Math.abs(perpDist) / radiusPx, 0.15, 1.5);
        }
      }
    } else if (type === 'linear') {
      const dx = mx - rect.width / 2, dy = my - rect.height / 2;
      let deg = Math.atan2(dy, dx) * 180 / Math.PI;
      deg = (deg + 90 + 360) % 360;
      angle = Math.round(deg);
      if (angleInput) angleInput.value = angle;
    } else if (type === 'radial' || type === 'conic') {
      cx = Math.round(clamp((mx / rect.width) * 100, 0, 100));
      cy = Math.round(clamp((my / rect.height) * 100, 0, 100));
      if (posX) posX.value = cx;
      if (posY) posY.value = cy;
    }
    render();
  }
  function startDrag(e, targetRole) {
    dragging = true; dragTarget = targetRole; e.preventDefault(); onDrag(e);
  }
  // 主手柄事件
  handle.addEventListener('mousedown', (e) => startDrag(e, type === 'diamond' ? 'center' : (type === 'linear' ? 'angle' : 'center')));
  handle.addEventListener('touchstart', (e) => startDrag(e, type === 'diamond' ? 'center' : (type === 'linear' ? 'angle' : 'center')), { passive: false });
  // 菱形额外手柄事件（委托到 document 因为元素动态创建）
  document.addEventListener('mousedown', (e) => {
    var t = e.target;
    if (t.id === 'gradHandleRadius') startDrag(e, 'radius');
    else if (t.id === 'gradHandleWidth') startDrag(e, 'width');
  });
  document.addEventListener('touchstart', (e) => {
    var t = e.target;
    if (t.id === 'gradHandleRadius') startDrag(e, 'radius');
    else if (t.id === 'gradHandleWidth') startDrag(e, 'width');
  }, { passive: false });
  window.addEventListener('mousemove', onDrag);
  window.addEventListener('touchmove', onDrag, { passive: false });
  window.addEventListener('mouseup', () => { dragging = false; dragTarget = null; });
  window.addEventListener('touchend', () => { dragging = false; dragTarget = null; });

  // 复制 CSS（非颜色文本，走「选中文本」方案，见 copyText）
  $('#gradCopyCss').addEventListener('click', () => {
    copyText(buildCss());
  });

  // 初始渲染
  render();
}

/* 暴露给其它脚本（gallery.js 等）复用，确保复制逻辑与首页一致（不唤起输入法） */
window.copyText = copyText;
window.toast = toast;

})();
