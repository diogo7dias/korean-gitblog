(function () {
  // Fixed deploy base: https://diogo7dias.github.io/korean-gitblog/
  // Resolve relative to current page so it also works in local file:// preview.
  function getBlogBase() {
    // The nav already carries a correct relative link to the blog index on
    // every page, so trust it before falling back to path sniffing (which
    // only knew about /posts/ and /blog/ and broke in /gallery/ and /micro/).
    var navLink = document.querySelector('nav a[href$="blog/index.html"]');
    if (navLink) return navLink.getAttribute('href').replace(/index\.html$/, '');
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
  // Shuffle: /blog/ shows every story in a fresh random order on
  // each load, so the list is a lucky dip instead of a timeline.
  // The HTML stays newest-first; only the rendered order changes.
  // -----------------------------------------------------------
  function shuffleBlogList() {
    if (!/\/blog\/(?:index\.html)?$/.test(location.pathname)) return;
    var ul = document.querySelector('ul.blog-posts');
    if (!ul) return;
    var items = Array.prototype.slice.call(ul.children);
    if (items.length < 2) return;
    for (var i = items.length - 1; i > 0; i--) {
      var j = Math.floor(Math.random() * (i + 1));
      var tmp = items[i];
      items[i] = items[j];
      items[j] = tmp;
    }
    var frag = document.createDocumentFragment();
    items.forEach(function (li) { frag.appendChild(li); });
    ul.appendChild(frag);
  }

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

  // -----------------------------------------------------------
  // Story count: the nav link to /blog/ shows how many stories the
  // list holds, e.g. "이야기 목록 (322)". Counted at runtime from the
  // canonical list so no page ever carries a stale hard-coded number.
  // /micro/ also renders a ul.blog-posts, so only /blog/ may count
  // its own DOM; every other page fetches the blog list once and
  // reuses the value from sessionStorage on later navigations.
  // -----------------------------------------------------------
  var COUNT_KEY = 'blogPostCount';

  function isBlogPage() {
    return /\/blog\/(?:index\.html)?$/.test(location.pathname);
  }

  function blogNavLinks() {
    return document.querySelectorAll('nav a[href$="blog/index.html"]');
  }

  function paintStoryCount(n) {
    if (!n) return;
    blogNavLinks().forEach(function (a) {
      a.textContent = a.textContent.replace(/\s*\(\d+\)\s*$/, '') + ' (' + n + ')';
    });
  }

  function readCachedCount() {
    try {
      return parseInt(sessionStorage.getItem(COUNT_KEY), 10) || 0;
    } catch (e) {
      return 0;
    }
  }

  function cacheCount(n) {
    try {
      sessionStorage.setItem(COUNT_KEY, String(n));
    } catch (e) { /* private mode: skip the cache, still paint */ }
  }

  function showStoryCount() {
    if (!blogNavLinks().length) return;

    if (isBlogPage()) {
      var n = document.querySelectorAll('ul.blog-posts > li').length;
      cacheCount(n);
      paintStoryCount(n);
      return;
    }

    paintStoryCount(readCachedCount());

    fetch(getBlogBase() + 'index.html', { credentials: 'same-origin' })
      .then(function (r) { return r.text(); })
      .then(function (html) {
        var doc = new DOMParser().parseFromString(html, 'text/html');
        var n = doc.querySelectorAll('ul.blog-posts > li').length;
        cacheCount(n);
        paintStoryCount(n);
      })
      .catch(function () { /* silent: link keeps its plain label */ });
  }

  document.addEventListener('DOMContentLoaded', function () {
    document.querySelectorAll('.random-button').forEach(function (b) {
      b.addEventListener('click', randomPost);
    });
    shuffleBlogList();
    initSearch();
    showStoryCount();
  });
})();
