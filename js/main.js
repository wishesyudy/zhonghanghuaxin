/* ============================================================
   中航华信官网 — main.js
   模块：initNav / initReveal / initCounters / initTabs / initSwipe
        / initLightbox / initMarquee / initHeroVideo（宣传片循环背景）
   ============================================================ */
(function () {
  'use strict';

  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------- 导航：滚动变底 + 汉堡 + 高亮 ---------- */
  function initNav() {
    var nav = document.getElementById('site-nav');
    var toggle = document.getElementById('nav-toggle');
    var links = document.getElementById('nav-links');

    function onScroll() {
      if (window.scrollY > 80) nav.classList.add('scrolled');
      else nav.classList.remove('scrolled');
    }
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();

    toggle.addEventListener('click', function () {
      var open = document.body.classList.toggle('nav-open');
      toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
      document.body.style.overflow = open ? 'hidden' : '';
    });
    links.addEventListener('click', function (e) {
      if (e.target.tagName === 'A') {
        document.body.classList.remove('nav-open');
        toggle.setAttribute('aria-expanded', 'false');
        document.body.style.overflow = '';
      }
    });

    // 当前板块高亮
    var sections = document.querySelectorAll('main section[id]');
    var navAnchors = document.querySelectorAll('.nav-links a');
    var secObserver = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          navAnchors.forEach(function (a) {
            a.classList.toggle('active', a.getAttribute('href') === '#' + entry.target.id);
          });
        }
      });
    }, { rootMargin: '-40% 0px -55% 0px' });
    sections.forEach(function (s) { secObserver.observe(s); });
  }

  /* ---------- reveal 入场 + 十项闭环点亮 ---------- */
  function initReveal() {
    var items = document.querySelectorAll('.reveal');
    var loopNodes = document.querySelectorAll('.loop-node');
    var statsBand = document.getElementById('stats');

    if (reduceMotion || !('IntersectionObserver' in window)) {
      items.forEach(function (el) { el.classList.add('in-view'); });
      loopNodes.forEach(function (el) { el.classList.add('lit'); });
      return;
    }

    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('in-view');
          io.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12 });
    items.forEach(function (el) { io.observe(el); });

    // 闭环节点进入视口后逐个点亮
    var loopTrack = document.querySelector('.loop-track');
    if (loopTrack) {
      var loopIO = new IntersectionObserver(function (entries) {
        if (entries[0].isIntersecting) {
          loopNodes.forEach(function (node, i) {
            setTimeout(function () { node.classList.add('lit'); }, i * 180);
          });
          loopIO.disconnect();
        }
      }, { threshold: 0.4 });
      loopIO.observe(loopTrack);
    }

    // 数据带进入视口时启动数字滚动
    if (statsBand) {
      var statsIO = new IntersectionObserver(function (entries) {
        if (entries[0].isIntersecting) {
          runCounters();
          statsIO.disconnect();
        }
      }, { threshold: 0.3 });
      statsIO.observe(statsBand);
    }
  }

  /* ---------- 数字滚动 ---------- */
  function runCounters() {
    document.querySelectorAll('.stat-num[data-target]').forEach(function (el) {
      var target = parseInt(el.getAttribute('data-target'), 10);
      if (reduceMotion) { el.textContent = target; return; }
      var start = null;
      var duration = 1200;
      function easeOutCubic(t) { return 1 - Math.pow(1 - t, 3); }
      function step(ts) {
        if (!start) start = ts;
        var p = Math.min((ts - start) / duration, 1);
        el.textContent = Math.round(target * easeOutCubic(p));
        if (p < 1) requestAnimationFrame(step);
        else el.textContent = target;
      }
      requestAnimationFrame(step);
    });
  }

  /* ---------- tab 切换（服务 + 案例通用） ---------- */
  function initTabs() {
    document.querySelectorAll('.tab-btns').forEach(function (btnGroup) {
      var scope = btnGroup.parentElement;
      btnGroup.addEventListener('click', function (e) {
        var btn = e.target.closest('.tab-btn');
        if (!btn) return;
        scope.querySelectorAll('.tab-btn').forEach(function (b) { b.classList.remove('active'); });
        scope.querySelectorAll('.tab-panel').forEach(function (p) { p.classList.remove('active'); });
        btn.classList.add('active');
        var panel = scope.querySelector('.tab-panel[data-panel="' + btn.getAttribute('data-tab') + '"]');
        if (panel) panel.classList.add('active');
      });
    });
  }

  /* ---------- 触摸滑动切换 tab ---------- */
  function initSwipe() {
    document.querySelectorAll('.service-tabs, .case-tabs').forEach(function (tabs) {
      var startX = null, startY = null;
      tabs.addEventListener('touchstart', function (e) {
        startX = e.touches[0].clientX;
        startY = e.touches[0].clientY;
      }, { passive: true });
      tabs.addEventListener('touchend', function (e) {
        if (startX === null) return;
        var dx = e.changedTouches[0].clientX - startX;
        var dy = e.changedTouches[0].clientY - startY;
        startX = startY = null;
        if (Math.abs(dx) < 50 || Math.abs(dy) > 30) return;
        var btns = tabs.querySelectorAll('.tab-btn');
        var activeIdx = -1;
        btns.forEach(function (b, i) { if (b.classList.contains('active')) activeIdx = i; });
        if (activeIdx === -1) return;
        var next = dx < 0 ? activeIdx + 1 : activeIdx - 1;
        if (next < 0) next = btns.length - 1;
        if (next >= btns.length) next = 0;
        btns[next].click();
      }, { passive: true });
    });
  }

  /* ---------- 证书灯箱 ---------- */
  function initLightbox() {
    var lb = document.getElementById('lightbox');
    var lbImg = lb.querySelector('.lb-img');
    var imgs = Array.prototype.slice.call(document.querySelectorAll('.cert-img'));
    var index = 0;

    function show(i) {
      index = (i + imgs.length) % imgs.length;
      lbImg.src = imgs[index].getAttribute('data-full');
    }
    function open(i) {
      show(i);
      lb.hidden = false;
      document.body.style.overflow = 'hidden';
    }
    function close() {
      lb.hidden = true;
      document.body.style.overflow = '';
    }

    document.getElementById('cert-grid').addEventListener('click', function (e) {
      var img = e.target.closest('.cert-img');
      if (!img) return;
      open(imgs.indexOf(img));
    });
    lb.querySelector('.lb-close').addEventListener('click', close);
    lb.querySelector('.lb-prev').addEventListener('click', function () { show(index - 1); });
    lb.querySelector('.lb-next').addEventListener('click', function () { show(index + 1); });
    lb.addEventListener('click', function (e) { if (e.target === lb) close(); });
    document.addEventListener('keydown', function (e) {
      if (lb.hidden) return;
      if (e.key === 'Escape') close();
      if (e.key === 'ArrowLeft') show(index - 1);
      if (e.key === 'ArrowRight') show(index + 1);
    });
  }

  /* ---------- 客户墙 marquee：内容复制实现无缝循环 ---------- */
  function initMarquee() {
    var track = document.querySelector('.client-track');
    if (!track) return;
    track.innerHTML += track.innerHTML;
  }

  /* ---------- Hero 宣传片循环背景 ----------
     由 <video autoplay muted loop playsinline> 原生循环播放，
     压缩后的 17 秒片段见 assets/video/promo-17s.mp4 */
  function initHeroVideo() {
    var video = document.querySelector('.hero-video');
    if (!video) return;
    // 个别浏览器（省电流模式）会拦截自动播放，滚动时补一次
    var playPromise = video.play();
    if (playPromise !== undefined) {
      playPromise.catch(function () {
        document.addEventListener('touchstart', function play() {
          video.play().catch(function () {});
          document.removeEventListener('touchstart', play);
        }, { once: true });
      });
    }
  }

  /* ---------- 启动 ---------- */
  document.addEventListener('DOMContentLoaded', function () {
    initNav();
    initReveal();
    initTabs();
    initSwipe();
    initLightbox();
    initMarquee();
    initHeroVideo();
  });

  /* ---------- 语言切换：重置统计数字并重播 ----------
     i18n.js 切换语言后派发 zhx:langchange；
     跑马灯无需重建（克隆节点同样带 data-i18n，已被一并翻译） */
  document.addEventListener('zhx:langchange', function () {
    document.querySelectorAll('.stat-num[data-target]').forEach(function (el) {
      el.textContent = '0';
    });
    var statsBand = document.getElementById('stats');
    if (statsBand) {
      var rect = statsBand.getBoundingClientRect();
      if (rect.top < window.innerHeight && rect.bottom > 0) runCounters();
    }
  });
})();
