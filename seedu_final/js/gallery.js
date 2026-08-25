(function () {
  'use strict';
  const pool = window.SEEDU_GALLERY_POOL || [];
  const $ = (s, r = document) => r.querySelector(s);
  const toastEl = $('#toast');
  let timer;

  /* 支持多组画廊（首页 + 方案库），每组独立分类状态 */
  const groups = [];
  function registerGroup(gridSel, tabsSel) {
    const grid = $(gridSel);
    const tabs = $(tabsSel);
    if (!grid) return;
    const g = { grid, tabs, category: 'all' };
    g.render = () => {
      let items = shuffle(g.category === 'all' ? pool : pool.filter(item => item.categories.includes(g.category)));
      if (gridSel === '#galleryGrid') items = items.slice(0, 6);
      grid.innerHTML = items.map((item) => `<article class="palette-card">
        <div class="palette-preview">${item.colors.map(color => `<span class="palette-preview-bar" style="background:${color}" data-hex="${color}" title="${t('gallery.copyColor', '复制颜色')} ${color}"></span>`).join('')}</div>
        <div class="palette-info" data-base="${item.colors[0]}">
          <h3 class="palette-name">${nameOf(item)}</h3>
          <p class="palette-meta">${item.colors.length} ${t('gallery.colorsCount', '色')}</p>
        </div>
      </article>`).join('');
      grid.querySelectorAll('.palette-preview-bar').forEach(button => button.addEventListener('click', (event) => { event.stopPropagation(); copy(button.dataset.hex); }));
      // 与首页色卡交互一致：点击卡片信息区把该方案主色设为基准色（仅首页有 setBase 时生效）
      grid.querySelectorAll('.palette-info').forEach((info) => info.addEventListener('click', () => {
        const base = info.dataset.base;
        if (window.setBase) { window.setBase(base); showToast(`${t('gallery.setBase', '已把')} ${base} ${t('gallery.setAsBase', '设为基准色')}`); }
      }));
    };
    g.setCategory = (value) => {
      g.category = value;
      g.tabs?.querySelectorAll('.gallery-tab').forEach(tab => {
        const active = tab.dataset.category === value;
        tab.classList.toggle('is-active', active);
        tab.setAttribute('aria-selected', String(active));
      });
      g.render();
    };
    g.tabs?.addEventListener('click', event => { const tab = event.target.closest('.gallery-tab'); if (tab) g.setCategory(tab.dataset.category); });
    groups.push(g);
    g.render();
  }

  const t = (key, fallback) => window.i18n?.t(key) || fallback;
  const nameOf = (item) => {
    const lang = window.i18n?.getLang?.() || 'zh-CN';
    return lang === 'zh-CN' ? item.name : item.i18n?.[lang] || item.name;
  };
  const tagsOf = (tags) => tags.split(' · ').map(tag => {
    const keys = {
      自然: 'gallery.cat.nature', 柔和: 'gallery.cat.soft', 复古: 'gallery.cat.retro',
      霓虹: 'gallery.cat.neon', 冷色: 'color.temp.cool', 暖色: 'color.temp.warm',
      互补: 'palette.harmony.complementary', 邻近: 'palette.harmony.analogous',
      单色: 'palette.harmony.mono', 三分: 'palette.harmony.triadic', 矩形: 'palette.harmony.tetradic',
      '分裂互补': 'palette.harmony.split', '高饱和': 'gallery.tag.highsat',
      粉色: 'gallery.tag.pink', 紫色: 'gallery.tag.purple', 绿色: 'gallery.tag.green',
      橙色: 'gallery.tag.orange', 紫粉: 'gallery.tag.pinkPurple', 粉绿: 'gallery.tag.pinkGreen'
    };
    return t(keys[tag], tag);
  }).join(' · ');
  const shuffle = (items) => [...items].sort(() => Math.random() - 0.5);
  const showToast = (message) => {
    if (window.toast) { window.toast(message); return; }
    if (!toastEl) return;
    toastEl.textContent = message;
    toastEl.classList.add('show');
    clearTimeout(timer);
    timer = setTimeout(() => toastEl.classList.remove('show'), 2200);
  };
  // 统一走 window.copyText（颜色→黑色胶囊+右下角浮窗；其它→选中文本）
  const copy = (value) => {
    if (window.copyText) { window.copyText(value); return; }
    showToast(`${t('gallery.copied', '已复制')} ${value}`);
  };
  const init = () => {
    registerGroup('#galleryGrid', '#galleryTabs');
    registerGroup('#schemeGrid', '#schemeTabs');
    window.i18n?.onChange?.(() => groups.forEach(g => g.render()));
  };
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init); else init();
})();
