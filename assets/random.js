(function () {
  // Fixed deploy base: https://diogo7dias.github.io/korean-gitblog/
  // Resolve relative to current page so it also works in local file:// preview.
  function getBlogBase() {
    var p = location.pathname;
    if (p.indexOf('/posts/') !== -1) return '../blog/';
    if (/\/blog\/(?:index\.html)?$/.test(p)) return './';
    return 'blog/';
  }

  function navigate(href) {
    window.location.href = href;
  }

  function pickFrom(anchors, base) {
    if (!anchors || !anchors.length) return false;
    var a = anchors[Math.floor(Math.random() * anchors.length)];
    var href = a.getAttribute('href');
    if (base) {
      // Resolve href relative to the blog/ folder
      var blogAbs = new URL(base, window.location.href).href;
      navigate(new URL(href, blogAbs).href);
    } else {
      navigate(a.href);
    }
    return true;
  }

  function randomPost() {
    // If the current page already has a post list, use it.
    var local = document.querySelectorAll('ul.blog-posts li a');
    if (local.length) {
      pickFrom(local);
      return;
    }
    // Otherwise fetch the canonical list from /blog/index.html
    var base = getBlogBase();
    fetch(base + 'index.html', { credentials: 'same-origin' })
      .then(function (r) { return r.text(); })
      .then(function (html) {
        var doc = new DOMParser().parseFromString(html, 'text/html');
        var anchors = doc.querySelectorAll('ul.blog-posts li a');
        pickFrom(anchors, base);
      })
      .catch(function () { /* silent: button no-ops on fetch failure */ });
  }

  window.randomPost = randomPost;

  // -----------------------------------------------------------
  // Search: live inline filter on /blog/ + /micro/,
  //         debounced redirect to /blog/?q= from other pages.
  // -----------------------------------------------------------
  function isListPage() {
    return /\/(blog|micro)\/(?:index\.html)?$/.test(location.pathname);
  }

  function blogBaseRedirect() {
    var p = location.pathname;
    if (p.indexOf('/posts/') !== -1) return '../blog/index.html';
    if (/\/micro\//.test(p)) return '../blog/index.html';
    return 'blog/index.html';
  }

  function applyFilter(q) {
    q = (q || '').toLowerCase().trim();
    var items = document.querySelectorAll('ul.blog-posts > li');
    items.forEach(function (li) {
      var t = li.textContent.toLowerCase();
      li.style.display = (!q || t.indexOf(q) !== -1) ? '' : 'none';
    });
  }

  function initSearch() {
    var inp = document.getElementById('search-input');
    if (!inp) return;

    var params = new URLSearchParams(location.search);
    var initial = params.get('q') || '';
    if (initial) inp.value = initial;

    if (isListPage()) {
      if (initial) applyFilter(initial);
      inp.addEventListener('input', function () {
        applyFilter(inp.value);
      });
      return;
    }

    var t;
    function go() {
      var q = inp.value.trim();
      if (!q) return;
      window.location.href = blogBaseRedirect() + '?q=' + encodeURIComponent(q);
    }
    inp.addEventListener('input', function () {
      clearTimeout(t);
      t = setTimeout(go, 400);
    });
    inp.addEventListener('keydown', function (e) {
      if (e.key === 'Enter') { clearTimeout(t); go(); }
    });
  }

  document.addEventListener('DOMContentLoaded', function () {
    document.querySelectorAll('.random-button').forEach(function (b) {
      b.addEventListener('click', randomPost);
    });
    initSearch();
  });
})();
