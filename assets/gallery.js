(function () {
  function init() {
    var tiles = Array.prototype.slice.call(document.querySelectorAll('.gallery-tile'));
    if (!tiles.length) return;

    var urls = tiles.map(function (a) { return a.getAttribute('href'); });
    var idx = 0;

    var overlay = document.createElement('div');
    overlay.className = 'lightbox';
    overlay.innerHTML =
      '<button type="button" class="lightbox-btn lightbox-close" aria-label="Close">x</button>' +
      '<span class="lightbox-count"></span>' +
      '<button type="button" class="lightbox-btn lightbox-prev" aria-label="Previous">&larr;</button>' +
      '<img alt="">' +
      '<button type="button" class="lightbox-btn lightbox-next" aria-label="Next">&rarr;</button>';
    document.body.appendChild(overlay);

    var img = overlay.querySelector('img');
    var count = overlay.querySelector('.lightbox-count');
    var prevBtn = overlay.querySelector('.lightbox-prev');
    var nextBtn = overlay.querySelector('.lightbox-next');
    var closeBtn = overlay.querySelector('.lightbox-close');

    function render() {
      img.src = urls[idx];
      count.textContent = (idx + 1) + ' / ' + urls.length;
    }
    function open(i) {
      idx = i;
      render();
      overlay.classList.add('open');
      document.body.style.overflow = 'hidden';
    }
    function close() {
      overlay.classList.remove('open');
      document.body.style.overflow = '';
    }
    function next() { idx = (idx + 1) % urls.length; render(); }
    function prev() { idx = (idx - 1 + urls.length) % urls.length; render(); }

    tiles.forEach(function (a, i) {
      a.addEventListener('click', function (e) {
        e.preventDefault();
        open(i);
      });
    });

    nextBtn.addEventListener('click', function (e) { e.stopPropagation(); next(); });
    prevBtn.addEventListener('click', function (e) { e.stopPropagation(); prev(); });
    closeBtn.addEventListener('click', function (e) { e.stopPropagation(); close(); });
    overlay.addEventListener('click', function (e) {
      if (e.target === overlay) close();
    });

    document.addEventListener('keydown', function (e) {
      if (!overlay.classList.contains('open')) return;
      if (e.key === 'Escape') close();
      else if (e.key === 'ArrowRight') next();
      else if (e.key === 'ArrowLeft') prev();
    });

    // Swipe (touch)
    var sx = 0, sy = 0, tracking = false;
    overlay.addEventListener('touchstart', function (e) {
      if (e.touches.length !== 1) return;
      sx = e.touches[0].clientX;
      sy = e.touches[0].clientY;
      tracking = true;
    }, { passive: true });
    overlay.addEventListener('touchend', function (e) {
      if (!tracking) return;
      tracking = false;
      var t = e.changedTouches[0];
      var dx = t.clientX - sx;
      var dy = t.clientY - sy;
      if (Math.abs(dx) > 50 && Math.abs(dx) > Math.abs(dy)) {
        if (dx < 0) next(); else prev();
      }
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
