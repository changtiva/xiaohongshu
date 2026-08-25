(function () {
  'use strict';
  /* 每个主题有多个 variants（不同主调色板），suffixes 循环时按 variant 索引取色板，
     避免同主题所有渐变颜色看起来一样（之前 vary() 只微调通道值，主调不变）。 */
  const themes = [
    /* 暖色 */
    { names: ['晨曦珊瑚', '晨曦珊瑚', 'Sunrise Coral', 'Corail au lever du jour', 'Рассветный коралл', 'Sonnenaufgangskoralle'], categories: ['warm', 'nature'],
      variants: [['#FF6B6B', '#FFD166', '#F78C6B', '#EF476F'], ['#FB7185', '#F59E0B', '#FCD34D', '#DC2626'], ['#FED7AA', '#FB923C', '#EA580C', '#7C2D12']] },
    { names: ['蜜桃慕斯', '蜜桃慕斯', 'Peach Mousse', 'Mousse de pêche', 'Персиковый мусс', 'Pfirsichmousse'], categories: ['soft', 'warm'],
      variants: [['#FFEDD5', '#FDBA74', '#FB7185', '#BE123C'], ['#FFE4E6', '#FDA4AF', '#F87171', '#9F1239'], ['#FED7AA', '#FB923C', '#F472B6', '#BE185D']] },
    { names: ['莓果气泡', '莓果氣泡', 'Berry Fizz', 'Pétillant aux baies', 'Ягодная газировка', 'Beerenbrause'], categories: ['neon', 'warm'],
      variants: [['#845EC2', '#D65DB1', '#FF6F91', '#FFC75F'], ['#BE185D', '#EC4899', '#F59E0B', '#FCD34D'], ['#7C3AED', '#D946EF', '#F472B6', '#FCA5A5']] },
    { names: ['炭火余烬', '炭火餘燼', 'Charcoal Ember', 'Braise de charbon', 'Угольные угли', 'Holzkohleglut'], categories: ['dark', 'warm'],
      variants: [['#1C1917', '#7C2D12', '#EA580C', '#FDBA74'], ['#292524', '#9A3412', '#C2410C', '#FB923C'], ['#0C0A09', '#431407', '#7C2D12', '#F97316']] },
    /* 冷色 */
    { names: ['海盐薄荷', '海鹽薄荷', 'Sea Salt Mint', 'Menthe de sel marin', 'Морская мята', 'Meersalz-Minze'], categories: ['cool', 'nature'],
      variants: [['#0D9488', '#5EEAD4', '#BAF3E8', '#0F766E'], ['#1E40AF', '#0EA5E9', '#67E8F9', '#ECFEFF'], ['#0F766E', '#14B8A6', '#A7F3D0', '#F0FDFA']] },
    { names: ['薰衣草暮色', '薰衣草暮色', 'Lavender Dusk', 'Crépuscule lavande', 'Лавандовые сумерки', 'Lavendeldämmerung'], categories: ['cool', 'soft'],
      variants: [['#4C1D95', '#8B5CF6', '#C4B5FD', '#FCE7F3'], ['#312E81', '#7C3AED', '#C4B5FD', '#EDE9FE'], ['#1E3A8A', '#6366F1', '#A5B4FC', '#DBEAFE']] },
    { names: ['极光夜晚', '極光夜晚', 'Aurora Night', 'Nuit boréale', 'Северная ночь', 'Polarlichtnacht'], categories: ['cool', 'dark'],
      variants: [['#0F172A', '#164E63', '#2DD4BF', '#A7F3D0'], ['#020617', '#1E1B4B', '#06B6D4', '#67E8F9'], ['#0C0A09', '#1E293B', '#0EA5E9', '#7DD3FC']] },
    { names: ['冰川蓝', '冰川藍', 'Glacier Blue', 'Bleu glacier', 'Ледниковый синий', 'Gletscherblau'], categories: ['cool'],
      variants: [['#0C4A6E', '#0284C7', '#7DD3FC', '#E0F2FE'], ['#082F49', '#0EA5E9', '#BAE6FD', '#F0F9FF'], ['#172554', '#3B82F6', '#93C5FD', '#DBEAFE']] },
    { names: ['电光紫', '電光紫', 'Electric Purple', 'Violet électrique', 'Электрический пурпур', 'Elektrisches Violett'], categories: ['neon', 'cool'],
      variants: [['#312E81', '#7C3AED', '#D946EF', '#F0ABFC'], ['#1E1B4B', '#6366F1', '#A855F7', '#E879F9'], ['#4C1D95', '#8B5CF6', '#C084FC', '#F5D0FE']] },
    /* 自然 */
    { names: ['午夜森林', '午夜森林', 'Midnight Forest', 'Forêt de minuit', 'Полуночный лес', 'Mitternachtswald'], categories: ['dark', 'nature'],
      variants: [['#022C22', '#14532D', '#4D7C0F', '#A7F3D0'], ['#052E16', '#166534', '#22C55E', '#BBF7D0'], ['#14532D', '#16A34A', '#84CC16', '#FACC15']] },
    { names: ['苔原晨雾', '苔原晨霧', 'Tundra Mist', 'Brume de toundra', 'Тундровый туман', 'Tundra-Nebel'], categories: ['cool', 'nature'],
      variants: [['#0C4A6E', '#475569', '#94A3B8', '#F1F5F9'], ['#1E293B', '#64748B', '#CBD5E1', '#F8FAFC'], ['#334155', '#0EA5E9', '#7DD3FC', '#E0F2FE']] },
    { names: ['沙漠落日', '沙漠落日', 'Desert Sunset', 'Coucher de soleil désert', 'Пустынный закат', 'Wüstensonnenuntergang'], categories: ['warm', 'nature'],
      variants: [['#FB923C', '#FCD34D', '#FDE68A', '#451A03'], ['#EA580C', '#F59E0B', '#FCD34D', '#78350F'], ['#DC2626', '#F97316', '#FBBF24', '#92400E']] },
    /* 复古 — 多色调扩充，避免单一 */
    { names: ['复古胶片', '復古膠片', 'Vintage Film', 'Film vintage', 'Винтажная плёнка', 'Vintagefilm'], categories: ['vintage', 'warm'],
      variants: [['#7C2D12', '#C08457', '#E7C9A9', '#1E3A8A'], ['#451A03', '#92400E', '#D97706', '#FDE68A'], ['#831843', '#BE185D', '#F472B6', '#FCE7F3']] },
    { names: ['复古青绿', '復古青綠', 'Vintage Teal', 'Sarcelle vintage', 'Винтажный бирюзовый', 'Vintage-Teal'], categories: ['vintage', 'cool'],
      variants: [['#134E4A', '#0F766E', '#5EEAD4', '#FEF3C7'], ['#164E63', '#0E7490', '#22D3EE', '#FEF9C3'], ['#365314', '#65A30D', '#A3E635', '#FEF3C7']] },
    { names: ['复古玫粉', '復古玫粉', 'Vintage Rose', 'Rose vintage', 'Винтажная роза', 'Vintage-Rose'], categories: ['vintage', 'warm'],
      variants: [['#831843', '#9D174D', '#EC4899', '#FCE7F3'], ['#7C2D12', '#BE185D', '#F472B6', '#FBCFE8'], ['#581C87', '#A21CAF', '#E879F9', '#FAE8FF']] },
    { names: ['复古米黄', '復古米黃', 'Vintage Cream', 'Crème vintage', 'Винтажный кремовый', 'Vintage-Creme'], categories: ['vintage', 'soft'],
      variants: [['#78350F', '#A16207', '#EAB308', '#FEF9C3'], ['#451A03', '#92400E', '#D97706', '#FED7AA'], ['#57534E', '#A8A29E', '#D6D3D1', '#FAFAF9']] },
    { names: ['复古冷蓝', '復古冷藍', 'Vintage Indigo', 'Indigo vintage', 'Винтажный индиго', 'Vintage-Indigo'], categories: ['vintage', 'cool'],
      variants: [['#1E1B4B', '#312E81', '#6366F1', '#C7D2FE'], ['#0C0A09', '#1E3A8A', '#3B82F6', '#BFDBFE'], ['#1E293B', '#334155', '#64748B', '#E2E8F0']] },
    /* 霓虹/暗色 */
    { names: ['霓虹赛博', '霓虹賽博', 'Neon Cyber', 'Cyber néon', 'Неоновый киберпанк', 'Neon-Cyber'], categories: ['neon', 'dark'],
      variants: [['#FF00FF', '#7C3AED', '#00FFFF', '#172554'], ['#EC4899', '#8B5CF6', '#06B6D4', '#0F172A'], ['#F472B6', '#A855F7', '#22D3EE', '#1E1B4B']] },
    { names: ['暗夜深紫', '暗夜深紫', 'Dark Violet', 'Violet sombre', 'Тёмный фиолетовый', 'Dunkelviolett'], categories: ['neon', 'dark'],
      variants: [['#020617', '#1E1B4B', '#7C3AED', '#A78BFA'], ['#0C0A09', '#1E293B', '#6D28D9', '#C4B5FD'], ['#0F0F23', '#312E81', '#8B5CF6', '#DDD6FE']] },
    { names: ['青空拂晓', '青空拂曉', 'Sky Dawn', 'Aube céleste', 'Небесный рассвет', 'Himmelsdämmerung'], categories: ['soft', 'cool'],
      variants: [['#0C4A6E', '#0284C7', '#BAE6FD', '#FEF3C7'], ['#1E3A8A', '#3B82F6', '#93C5FD', '#FED7AA'], ['#082F49', '#0EA5E9', '#7DD3FC', '#FEF9C3']] },
    { names: ['落樱粉', '落櫻粉', 'Cherry Blossom', 'Fleurs de cerisier', 'Сакура', 'Kirschblüte'], categories: ['soft', 'warm'],
      variants: [['#831843', '#F472B6', '#FBCFE8', '#FDF2F8'], ['#9D174D', '#FB7185', '#FECDD3', '#FFF1F2'], ['#7E22CE', '#D946EF', '#F5D0FE', '#FAE8FF']] }
  ];
  const suffixes = [
    ['清晨','清晨','Morning','Matin','Утро','Morgen'], ['午后','午後','Afternoon','Après-midi','День','Nachmittag'],
    ['薄暮','薄暮','Twilight','Crépuscule','Сумерки','Dämmerung'], ['月光','月光','Moonlight','Clair de lune','Лунный свет','Mondlicht'],
    ['微光','微光','Glow','Lueur','Сияние','Schimmer'], ['脉冲','脈衝','Pulse','Pulsation','Пульс','Puls'],
    ['回声','回聲','Echo','Écho','Эхо','Echo'], ['呼吸','呼吸','Breath','Souffle','Дыхание','Atem'],
    ['潮汐','潮汐','Tide','Marée','Прилив','Gezeiten'], ['漂浮','漂浮','Drift','Dérive','Дрейф','Drift'],
    ['棱镜','棱鏡','Prism','Prisme','Призма','Prisma'], ['幻梦','幻夢','Dream','Rêve','Сон','Traum'],
    ['远景','遠景','Horizon','Horizon','Горизонт','Horizont'], ['余晖','餘暉','Afterglow','Lueur tardive','Послесвечение','Nachglühen'],
    ['星尘','星塵','Stardust','Poussière d’étoiles','Звёздная пыль','Sternenstaub'],
    ['朝霞','朝霞','Dawn Glow','Lueur de l’aube','Утреннее сияние','Morgenrot'],
    ['暮色','暮色','Dusk','Crépuscule','Сумерки','Abenddämmerung'],
    ['霓影','霓影','Neon Shadow','Ombre néon','Неоновая тень','Neonschatten'],
    ['暖阳','暖陽','Warm Sun','Soleil chaud','Тёплое солнце','Warme Sonne'],
    ['冷月','冷月','Cold Moon','Lune froide','Холодная луна','Kalter Mond'],
    ['翠影','翠影','Jade Shadow','Ombre de jade','Нефритовая тень','Jadeschatten'],
    ['鎏金','鎏金','Gilded','Doré','Позолоченный','Vergoldet'],
    ['缥缈','縹緲','Ethereal','Éthéré','Эфемерный','Ätherisch'],
    ['织梦','織夢','Weave Dream','Tisser le rêve','Ткать сон','Traumweben']
  ];
  /* 渐变方案库仅允许线性渐变：删除 radial / conic 类型，全部 linear */
  const angles = [0, 30, 45, 60, 90, 120, 135, 150, 180, 210, 225, 240, 270, 300, 315, 330];
  const clamp255 = v => Math.max(0, Math.min(255, Math.round(v)));
  const hexToRgb = hex => hex.slice(1).match(/.{2}/g).map(v => parseInt(v, 16));
  const rgbToHex = rgb => `#${rgb.map(v => clamp255(v).toString(16).padStart(2, '0').toUpperCase()).join('')}`;
  const rgbToHsl = ([r, g, b]) => {
    r /= 255; g /= 255; b /= 255;
    const max = Math.max(r, g, b), min = Math.min(r, g, b);
    let h = 0, s = 0; const l = (max + min) / 2;
    if (max !== min) {
      const d = max - min;
      s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
      if (max === r) h = (g - b) / d + (g < b ? 6 : 0);
      else if (max === g) h = (b - r) / d + 2;
      else h = (r - g) / d + 4;
      h /= 6;
    }
    return [h * 360, s * 100, l * 100];
  };
  const hslToHex = (h, s, l) => {
    h = ((h % 360) + 360) % 360; s = clamp255(s) / 100; l = clamp255(l) / 100;
    if (s === 0) { const v = clamp255(l * 255); return rgbToHex([v, v, v]); }
    const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
    const p = 2 * l - q;
    const hue = (t) => { t = (t % 1 + 1) % 1; if (t < 1 / 6) return p + (q - p) * 6 * t; if (t < 1 / 2) return q; if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6; return p; };
    return rgbToHex([hue(h / 360 + 1 / 3) * 255, hue(h / 360) * 255, hue(h / 360 - 1 / 3) * 255]);
  };
  /* 颜色筛选：只保留符合要求的颜色——鲜明（饱和度足够）、明度在可见区间，
     剔除灰扑扑 / 过黑 / 过白的不合格颜色，并保留渐变内的层次跨度。 */
  const polishColor = (hex) => {
    const [h, s, l] = rgbToHsl(hexToRgb(hex));
    const outS = Math.max(s, 46);          // 最低饱和度，避免发灰
    const outL = Math.min(Math.max(l, 20), 80); // 明度区间，避免过黑/过白
    return hslToHex(h, outS, outL);
  };
  const gradients = [];
  themes.forEach((theme, themeIndex) => suffixes.forEach((suffix, variant) => {
    /* 按 variant 索引取该主题的不同色板，让相邻渐变用不同主调色板 */
    const basePalette = theme.variants[variant % theme.variants.length];
    /* 筛选并优化颜色：仅保留鲜明、有层次的合格颜色 */
    const colors = basePalette.map(polishColor);
    const selected = variant % 3 === 0 ? colors.slice(0, 3) : variant % 3 === 1 ? [colors[0], colors[2], colors[3]] : colors;
    const names = theme.names.map((name, index) => `${name} ${suffix[index]}`);
    /* 角度用 themeIndex + variant 双因子打散，避免相邻渐变角度重复 */
    const angle = angles[(themeIndex * 5 + variant * 3) % angles.length];
    const stops = selected.map((color, index) => `${color} ${Math.round(index * 100 / (selected.length - 1))}%`).join(', ');
    /* 所有方案均为线性渐变 */
    const css = `linear-gradient(${angle}deg, ${stops})`;
    gradients.push({ names: { 'zh-CN': names[0], 'zh-TW': names[1], en: names[2], fr: names[3], ru: names[4], de: names[5] }, css, categories: theme.categories });
  }));
  const $ = (s, r = document) => r.querySelector(s);
  const toast = $('#toast');
  let timeout;
  const gradientGroups = [];
  let activeCard = null;
  // 把渐变保存到相册（官方方法：Canvas → writeTempFile → saveImageToPhotosAlbum）
  function saveGradient(css) {
    if (window.saveGradientImage) window.saveGradientImage(css);
    else show(t('gradient.saved', '已保存到本地'));
  }
  function registerGradientGroup(gridSel, tabsSel) {
    const grid = $(gridSel);
    const tabs = $(tabsSel);
    if (!grid) return;
    const g = { grid, tabs, category: 'all' };
    g.render = () => {
      const list = shuffle(gradients.filter(item => g.category === 'all' || item.categories.includes(g.category)));
      const saveLabel = t('gradient.save', '保存');
      grid.innerHTML = list.map(item => {
        const name = item.names[lang()] || item.names.en;
        return `<article class="gradient-card" style="background:${item.css}" title="${item.css}" data-css="${item.css}" aria-label="${saveLabel} ${name}">
          <span class="gradient-overlay">
            <span class="gradient-name">${name}</span>
            <span class="gradient-actions">
              <button type="button" class="gradient-action-btn gradient-action-save" data-act="save">
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
                <span>${saveLabel}</span>
              </button>
            </span>
          </span>
        </article>`;
      }).join('');
      grid.querySelectorAll('.gradient-card').forEach(card => {
        card.addEventListener('click', () => {
          const wasActive = card.classList.contains('is-active');
          grid.querySelectorAll('.gradient-card.is-active').forEach(c => { if (c !== card) c.classList.remove('is-active'); });
          card.classList.toggle('is-active', !wasActive);
        });
      });
      grid.querySelectorAll('.gradient-action-btn').forEach(btn => btn.addEventListener('click', e => {
        e.stopPropagation();
        const card = btn.closest('.gradient-card');
        const css = card?.dataset.css;
        if (!css) return;
        saveGradient(css);
      }));
    };
    g.setCategory = value => { g.category = value; g.tabs?.querySelectorAll('.gallery-tab').forEach(tab => { const active = tab.dataset.category === value; tab.classList.toggle('is-active', active); tab.setAttribute('aria-selected', String(active)); }); g.render(); };
    g.tabs?.addEventListener('click', e => { const tab = e.target.closest('.gallery-tab'); if (tab) g.setCategory(tab.dataset.category); });
    gradientGroups.push(g);
    g.render();
  }
  const t = (key, fallback) => window.i18n?.t(key) || fallback;
  const lang = () => window.i18n?.getLang?.() || 'zh-CN';
  const show = message => { if (!toast) return; toast.textContent = message; toast.classList.add('show'); clearTimeout(timeout); timeout = setTimeout(() => toast.classList.remove('show'), 2200); };
  const shuffle = items => { const result = items.slice(); for (let i = result.length - 1; i > 0; i -= 1) { const j = Math.floor(Math.random() * (i + 1)); [result[i], result[j]] = [result[j], result[i]]; } return result; };
  const init = () => {
    registerGradientGroup('#gradientSchemeGrid', '#gradientSchemeTabs');
    window.i18n?.onChange?.(() => gradientGroups.forEach(g => g.render()));
  };
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init); else init();
})();
