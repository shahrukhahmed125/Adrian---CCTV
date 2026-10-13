/* ==========================================================================
   ADI Security Installations: site script (jQuery)
   ==========================================================================

   SITE SETTINGS: edit these values, then upload this file again.

   - social: paste full profile URLs. Any profile left as '' stays hidden,
     including the "Join our community" Instagram section.
   - photos: once real photos are uploaded, switch the matching value to true.
       projects -> images/projects/project-1.jpg ... project-6.jpg
       team     -> images/team/adrian.jpg and images/team/team.jpg
     The illustrations are replaced by the photos automatically.
   ========================================================================== */
var ADI = {
  phone: '+447398056376',
  whatsapp: '447398056376',
  email: 'adiinstallations@outlook.com',
  social: {
    instagram: '',
    facebook: '',
    tiktok: ''
  },
  photos: {
    projects: false,
    team: false
  }
};

(function ($) {
  'use strict';

  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var finePointer = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
  var hasIO = 'IntersectionObserver' in window;

  /* ------------------------------------------------------------------------
     Helpers
     ------------------------------------------------------------------------ */
  function whatsappUrl(message) {
    return 'https://wa.me/' + ADI.whatsapp + '?text=' + encodeURIComponent(message);
  }

  function onVisible(elements, callback, options) {
    var $els = $(elements);
    if (!$els.length) return;
    if (!hasIO) {
      $els.each(function () { callback(this); });
      return;
    }
    var io = new IntersectionObserver(function (entries, observer) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          callback(entry.target);
          observer.unobserve(entry.target);
        }
      });
    }, options || { rootMargin: '0px 0px -12% 0px', threshold: 0.12 });
    $els.each(function () { io.observe(this); });
  }

  /* ------------------------------------------------------------------------
     Social profiles and photo slots (driven by the ADI settings above)
     ------------------------------------------------------------------------ */
  function initSocial() {
    $('[data-social]').each(function () {
      var $el = $(this);
      var network = $el.attr('data-social');
      var url = ADI.social[network];
      if (!url) return;
      $el.find('a[data-social-link]').addBack('a[data-social-link]').attr('href', url);
      $el.prop('hidden', false);
    });
  }

  function initPhotos() {
    $.each(['projects', 'team'], function (_, group) {
      if (!ADI.photos[group]) return;
      $('[data-photo-group="' + group + '"] [data-photo]').each(function () {
        var $slot = $(this);
        var $img = $slot.find('img').first();
        var src = $slot.attr('data-photo');
        var alt = $slot.attr('data-photo-alt');
        var probe = new Image();
        probe.onload = function () {
          $img.attr('src', src).addClass('is-photo');
          if (alt) $img.attr('alt', alt);
        };
        probe.src = src;
      });
    });
  }

  /* ------------------------------------------------------------------------
     Header: shadow once the page has scrolled (IntersectionObserver sentinel)
     ------------------------------------------------------------------------ */
  function initHeader() {
    var $header = $('.site-header');
    if (!$header.length || !hasIO) return;
    var sentinel = $('<div aria-hidden="true"></div>').css({
      position: 'absolute', top: 0, left: 0, width: '1px', height: '24px', pointerEvents: 'none'
    }).prependTo('body')[0];
    new IntersectionObserver(function (entries) {
      $header.toggleClass('is-scrolled', !entries[0].isIntersecting);
    }).observe(sentinel);
  }

  /* ------------------------------------------------------------------------
     Desktop services dropdown
     ------------------------------------------------------------------------ */
  function initDropdown() {
    $('.nav__item--has-menu').each(function () {
      var $item = $(this);
      var $btn = $item.children('button');
      var closeTimer;

      function open() {
        clearTimeout(closeTimer);
        $item.addClass('is-open');
        $btn.attr('aria-expanded', 'true');
      }

      function close() {
        $item.removeClass('is-open');
        $btn.attr('aria-expanded', 'false');
      }

      $btn.on('click', function () {
        if ($item.hasClass('is-open')) { close(); } else { open(); }
      });

      if (finePointer) {
        $item.on('mouseenter', open);
        $item.on('mouseleave', function () {
          closeTimer = setTimeout(close, 180);
        });
      }

      $item.on('keydown', function (e) {
        if (e.key === 'Escape' && $item.hasClass('is-open')) {
          close();
          $btn.trigger('focus');
        }
      });

      $item.on('focusout', function () {
        setTimeout(function () {
          if (!$item[0].contains(document.activeElement)) close();
        }, 0);
      });

      $(document).on('click', function (e) {
        if (!$item[0].contains(e.target)) close();
      });
    });
  }

  /* ------------------------------------------------------------------------
     Mobile menu
     ------------------------------------------------------------------------ */
  function initMobileMenu() {
    var $toggle = $('.nav-toggle');
    var $menu = $('#mobile-menu');
    if (!$toggle.length || !$menu.length) return;
    var $outside = $('main, footer, .wa-float');

    $menu.find('.mobile-menu__list > li, .mobile-menu__actions').each(function (i) {
      this.style.setProperty('--i', i);
    });

    function setOpen(isOpen) {
      $toggle.attr('aria-expanded', String(isOpen));
      $toggle.attr('aria-label', isOpen ? 'Close menu' : 'Open menu');
      $menu.toggleClass('is-open', isOpen).attr('aria-hidden', String(!isOpen));
      $('body').toggleClass('menu-open', isOpen);
      $outside.each(function () {
        if (isOpen) { this.setAttribute('inert', ''); } else { this.removeAttribute('inert'); }
      });
      if (isOpen) {
        $menu.find('a').first().trigger('focus');
      }
    }

    $menu.attr('aria-hidden', 'true');

    $toggle.on('click', function () {
      setOpen($toggle.attr('aria-expanded') !== 'true');
    });

    $menu.on('click', 'a', function () {
      setOpen(false);
    });

    $(document).on('keydown', function (e) {
      if (e.key === 'Escape' && $menu.hasClass('is-open')) {
        setOpen(false);
        $toggle.trigger('focus');
      }
    });

    window.matchMedia('(min-width: 1024px)').addEventListener('change', function (mq) {
      if (mq.matches) setOpen(false);
    });
  }

  /* ------------------------------------------------------------------------
     Scroll reveal and process line
     ------------------------------------------------------------------------ */
  function initReveal() {
    $('[data-reveal-group]').each(function () {
      $(this).find('[data-reveal]').each(function (i) {
        this.style.setProperty('--reveal-delay', i);
      });
    });

    $('.steps .step').each(function (i) {
      this.style.setProperty('--i', i);
    });

    if (reduceMotion) {
      $('[data-reveal], .steps').addClass('is-visible');
      return;
    }

    onVisible('[data-reveal], .steps', function (el) {
      $(el).addClass('is-visible');
    });
  }

  /* ------------------------------------------------------------------------
     Number counters (the final figure is in the HTML for no-JS and SEO)
     ------------------------------------------------------------------------ */
  function initCounters() {
    if (reduceMotion) return;
    onVisible('[data-count]', function (el) {
      var $el = $(el);
      var target = parseFloat($el.attr('data-count'));
      var suffix = $el.attr('data-suffix') || '';
      var duration = 1600;
      var start = null;

      function frame(ts) {
        if (!start) start = ts;
        var p = Math.min((ts - start) / duration, 1);
        var eased = 1 - Math.pow(1 - p, 4);
        $el.text(Math.round(target * eased) + suffix);
        if (p < 1) window.requestAnimationFrame(frame);
      }

      $el.text('0' + suffix);
      window.requestAnimationFrame(frame);
    }, { threshold: 0.6 });
  }

  /* ------------------------------------------------------------------------
     Hero camera feed: live clock, alert card, gentle pointer tilt
     ------------------------------------------------------------------------ */
  function initFeed() {
    var $clock = $('[data-clock]');
    if ($clock.length) {
      var pad = function (n) { return (n < 10 ? '0' : '') + n; };
      var tick = function () {
        if ($clock.closest('[data-motion]').hasClass('is-paused')) return;
        var d = new Date();
        $clock.text(
          pad(d.getDate()) + '-' + pad(d.getMonth() + 1) + '-' + d.getFullYear() + ' ' +
          pad(d.getHours()) + ':' + pad(d.getMinutes()) + ':' + pad(d.getSeconds())
        );
      };
      tick();
      setInterval(tick, 1000);
    }

    var $notify = $('.feed__notify');
    if ($notify.length) {
      setTimeout(function () { $notify.addClass('is-shown'); }, reduceMotion ? 0 : 2600);
    }

    var $feed = $('.feed');
    var shell = $feed.find('.feed__shell')[0];
    if (!shell || reduceMotion || !finePointer) return;

    var raf = null;
    $feed.on('pointermove', function (e) {
      var rect = this.getBoundingClientRect();
      var x = (e.clientX - rect.left) / rect.width - 0.5;
      var y = (e.clientY - rect.top) / rect.height - 0.5;
      if (raf) return;
      raf = window.requestAnimationFrame(function () {
        shell.style.setProperty('--tilt-y', (x * 7).toFixed(2) + 'deg');
        shell.style.setProperty('--tilt-x', (y * -6).toFixed(2) + 'deg');
        raf = null;
      });
    });
    $feed.on('pointerleave', function () {
      shell.style.setProperty('--tilt-y', '0deg');
      shell.style.setProperty('--tilt-x', '0deg');
    });
  }

  /* ------------------------------------------------------------------------
     Pause / play for looping decorative motion (WCAG 2.2.2)
     ------------------------------------------------------------------------ */
  function initMotionToggles() {
    $('[data-motion-toggle]').each(function () {
      var $btn = $(this);
      var $scope = $btn.closest('[data-motion]');
      var noun = ($btn.attr('aria-label') || '').replace(/^Pause /, '');
      $btn.on('click', function () {
        var paused = !$scope.hasClass('is-paused');
        $scope.toggleClass('is-paused', paused);
        $btn.attr('aria-pressed', String(paused));
        $btn.attr('aria-label', (paused ? 'Play ' : 'Pause ') + noun);
        $btn.find('[data-icon="pause"]').attr('hidden', paused ? '' : null);
        $btn.find('[data-icon="play"]').attr('hidden', !paused ? '' : null);
      });
    });
  }

  /* ------------------------------------------------------------------------
     Reviews slider (prev / next / pause, stops on hover, focus and reduced motion)
     ------------------------------------------------------------------------ */
  function initReviews() {
    $('[data-slider]').each(function () {
      var $root = $(this);
      var $slides = $root.find('.review');
      var $status = $root.find('.slider-status');
      var $pause = $root.find('[data-slider-pause]');
      var total = $slides.length;
      var index = 0;
      var timer = null;
      var userPaused = reduceMotion;
      var hoverPaused = false;

      function show(i, announce) {
        index = (i + total) % total;
        $slides.removeClass('is-active').attr('aria-hidden', 'true');
        $slides.eq(index).addClass('is-active').attr('aria-hidden', 'false');
        $status.attr('aria-live', announce ? 'polite' : 'off');
        $status.text('Review ' + (index + 1) + ' of ' + total);
      }

      function stop() {
        clearInterval(timer);
        timer = null;
      }

      function start() {
        stop();
        if (userPaused || hoverPaused) return;
        timer = setInterval(function () { show(index + 1, false); }, 7000);
      }

      function setPausedLabel() {
        $pause.attr('aria-pressed', String(userPaused));
        $pause.attr('aria-label', userPaused ? 'Play reviews' : 'Pause reviews');
        $pause.find('[data-icon="pause"]').attr('hidden', userPaused ? '' : null);
        $pause.find('[data-icon="play"]').attr('hidden', !userPaused ? '' : null);
      }

      $root.find('[data-slider-prev]').on('click', function () { show(index - 1, true); start(); });
      $root.find('[data-slider-next]').on('click', function () { show(index + 1, true); start(); });
      $pause.on('click', function () {
        userPaused = !userPaused;
        setPausedLabel();
        start();
      });

      $root.find('.review-stage').on('mouseenter focusin', function () { hoverPaused = true; stop(); });
      $root.find('.review-stage').on('mouseleave focusout', function () { hoverPaused = false; start(); });

      var touchX = null;
      $root.find('.review-stage').on('touchstart', function (e) {
        touchX = e.originalEvent.touches[0].clientX;
      }).on('touchend', function (e) {
        if (touchX === null) return;
        var dx = e.originalEvent.changedTouches[0].clientX - touchX;
        if (Math.abs(dx) > 40) { show(index + (dx < 0 ? 1 : -1), true); start(); }
        touchX = null;
      });

      setPausedLabel();
      show(0, false);
      start();
    });
  }

  /* ------------------------------------------------------------------------
     Projects gallery: buttons, drag to scroll with a mouse
     ------------------------------------------------------------------------ */
  function initGallery() {
    $('[data-gallery]').each(function () {
      var $wrap = $(this);
      var track = $wrap.find('.gallery')[0];
      var $prev = $wrap.find('[data-gallery-prev]');
      var $next = $wrap.find('[data-gallery-next]');
      var items = track ? track.querySelectorAll('.project') : [];
      if (!track || !items.length) return;

      function step() {
        return items[0].getBoundingClientRect().width + 16;
      }

      $prev.on('click', function () {
        track.scrollBy({ left: -step(), behavior: reduceMotion ? 'auto' : 'smooth' });
      });
      $next.on('click', function () {
        track.scrollBy({ left: step(), behavior: reduceMotion ? 'auto' : 'smooth' });
      });

      if (hasIO) {
        var edgeObserver = new IntersectionObserver(function (entries) {
          entries.forEach(function (entry) {
            if (entry.target === items[0]) $prev.prop('disabled', entry.isIntersecting);
            if (entry.target === items[items.length - 1]) $next.prop('disabled', entry.isIntersecting);
          });
        }, { root: track, threshold: 0.9 });
        edgeObserver.observe(items[0]);
        edgeObserver.observe(items[items.length - 1]);
      }

      var dragging = false;
      var moved = false;
      var startX = 0;
      var startScroll = 0;

      track.addEventListener('pointerdown', function (e) {
        if (e.pointerType !== 'mouse' || e.button !== 0) return;
        dragging = true;
        moved = false;
        startX = e.clientX;
        startScroll = track.scrollLeft;
      });

      window.addEventListener('pointermove', function (e) {
        if (!dragging) return;
        var dx = e.clientX - startX;
        if (!moved && Math.abs(dx) > 5) {
          moved = true;
          track.classList.add('is-dragging');
        }
        if (moved) track.scrollLeft = startScroll - dx;
      });

      window.addEventListener('pointerup', function () {
        if (!dragging) return;
        dragging = false;
        track.classList.remove('is-dragging');
      });

      track.addEventListener('click', function (e) {
        if (moved) {
          e.preventDefault();
          e.stopPropagation();
          moved = false;
        }
      }, true);
    });
  }

  /* ------------------------------------------------------------------------
     Quote form: validates, then opens WhatsApp or the email app, prefilled
     ------------------------------------------------------------------------ */
  function initQuoteForm() {
    var $form = $('#quote-form');
    if (!$form.length) return;
    var $status = $form.find('.form-status');

    var params = new URLSearchParams(window.location.search);
    var preset = params.get('service');
    if (preset) {
      var $opt = $form.find('#qf-service option[data-key="' + preset + '"]');
      if ($opt.length) $form.find('#qf-service').val($opt.val());
    }

    function field(name) {
      return $form.find('[name="' + name + '"]');
    }

    function value(name) {
      var $f = field(name);
      if ($f.is(':radio')) return $f.filter(':checked').val() || '';
      return $.trim($f.val() || '');
    }

    function setError($f, hasError) {
      var $wrap = $f.closest('.field');
      $wrap.toggleClass('has-error', hasError);
      $f.attr('aria-invalid', hasError ? 'true' : null);
    }

    function validate() {
      var ok = true;
      var $first = null;
      var checks = [
        { name: 'name', test: function (v) { return v.length >= 2; } },
        { name: 'phone', test: function (v) { return v.replace(/[^\d]/g, '').length >= 10; } },
        { name: 'email', test: function (v) { return v === '' || /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v); } },
        { name: 'area', test: function (v) { return v.length >= 2; } },
        { name: 'service', test: function (v) { return v !== ''; } }
      ];
      $.each(checks, function (_, c) {
        var $f = field(c.name);
        var valid = c.test(value(c.name));
        setError($f, !valid);
        if (!valid) {
          ok = false;
          if (!$first) $first = $f;
        }
      });
      if ($first) $first.trigger('focus');
      return ok;
    }

    function buildLines() {
      var lines = [
        'Hi ADI, I would like a free quote.',
        '',
        'Name: ' + value('name'),
        'Phone: ' + value('phone')
      ];
      if (value('email')) lines.push('Email: ' + value('email'));
      lines.push('Town or postcode: ' + value('area'));
      lines.push('Service: ' + value('service'));
      if (value('property')) lines.push('Property: ' + value('property'));
      if (value('contact')) lines.push('Best way to reach me: ' + value('contact'));
      if (value('message')) {
        lines.push('');
        lines.push('Details: ' + value('message'));
      }
      return lines;
    }

    $form.on('input change', 'input, select, textarea', function () {
      var $f = $(this);
      if ($f.closest('.field').hasClass('has-error')) setError($f, false);
    });

    $form.on('submit', function (e) {
      e.preventDefault();
      $status.removeClass('is-error').text('');
      if (!validate()) {
        $status.addClass('is-error').text('Please check the highlighted fields, then try again.');
        return;
      }
      var url = whatsappUrl(buildLines().join('\n'));
      var win = window.open(url, '_blank', 'noopener');
      if (!win) window.location.href = url;
      $status.text('WhatsApp has opened with your details. Press send in WhatsApp and we will reply as soon as we can.');
    });

    $form.find('[data-send-email]').on('click', function () {
      $status.removeClass('is-error').text('');
      if (!validate()) {
        $status.addClass('is-error').text('Please check the highlighted fields, then try again.');
        return;
      }
      var subject = 'Free quote request: ' + value('service');
      var body = buildLines().join('\r\n');
      window.location.href = 'mailto:' + ADI.email + '?subject=' + encodeURIComponent(subject) + '&body=' + encodeURIComponent(body);
      $status.text('Your email app has opened with your details. Press send and we will reply as soon as we can.');
    });
  }

  /* ------------------------------------------------------------------------
     Blog: table of contents highlight
     ------------------------------------------------------------------------ */
  function initToc() {
    var $links = $('.toc a[href^="#"]');
    if (!$links.length || !hasIO) return;
    var map = {};
    $links.each(function () {
      map[this.getAttribute('href').slice(1)] = $(this);
    });
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting && map[entry.target.id]) {
          $links.removeClass('is-active').removeAttr('aria-current');
          map[entry.target.id].addClass('is-active').attr('aria-current', 'location');
        }
      });
    }, { rootMargin: '-20% 0px -70% 0px' });
    $.each(map, function (id) {
      var el = document.getElementById(id);
      if (el) io.observe(el);
    });
  }

  /* ------------------------------------------------------------------------
     404: camera static
     ------------------------------------------------------------------------ */
  function initNoise() {
    var canvas = document.querySelector('[data-noise]');
    if (!canvas || !canvas.getContext) return;
    var ctx = canvas.getContext('2d');
    var w = canvas.width = 160;
    var h = canvas.height = 100;
    var img = ctx.createImageData(w, h);
    var last = 0;
    var started = null;

    function draw() {
      for (var i = 0; i < img.data.length; i += 4) {
        var v = Math.random() * 255;
        img.data[i] = v * 0.7;
        img.data[i + 1] = v * 0.8;
        img.data[i + 2] = v;
        img.data[i + 3] = 255;
      }
      ctx.putImageData(img, 0, 0);
    }

    // The static runs for under 5 seconds, then settles on a still frame.
    function loop(ts) {
      if (started === null) started = ts;
      if (ts - last > 80) {
        draw();
        last = ts;
      }
      if (ts - started < 4500) window.requestAnimationFrame(loop);
    }

    draw();
    if (!reduceMotion) window.requestAnimationFrame(loop);
  }

  /* ------------------------------------------------------------------------
     Small things
     ------------------------------------------------------------------------ */
  function initMisc() {
    $('[data-year]').text(new Date().getFullYear());
  }

  $(function () {
    initSocial();
    initPhotos();
    initHeader();
    initDropdown();
    initMobileMenu();
    initReveal();
    initCounters();
    initFeed();
    initMotionToggles();
    initReviews();
    initGallery();
    initQuoteForm();
    initToc();
    initNoise();
    initMisc();
    window.ADI_READY = true;
  });
})(jQuery);
