/* 单页路由 + 工具卡片跳转（外置，符合容器"禁止内联脚本"要求） */
(function () {
  var tabbar = document.getElementById('appTabbar');
  var views = document.querySelectorAll('.view');
  function showView(id) {
    views.forEach(function (v) { v.classList.toggle('is-active', v.id === id); });
    if (tabbar) {
      tabbar.querySelectorAll('.app-tab').forEach(function (t) {
        t.classList.toggle('is-active', t.getAttribute('data-view') === id);
      });
    }
    window.scrollTo(0, 0);
  }
  if (tabbar) {
    tabbar.addEventListener('click', function (e) {
      var btn = e.target.closest('.app-tab');
      if (btn) showView(btn.getAttribute('data-view'));
    });
  }
  document.addEventListener('click', function (e) {
    var a = e.target.closest('a[href^="#view-"]');
    if (a) {
      e.preventDefault();
      var id = a.getAttribute('href').slice(1);
      if (document.getElementById(id)) showView(id);
    }
  });
  var h = location.hash.replace('#', '');
  if (h && document.getElementById(h) && h.indexOf('view-') === 0) showView(h);
})();
