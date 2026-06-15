/**
 * 4Shops static site — UI layer (prod BEM: c-*, o-*, js-*)
 */
(function () {
  'use strict';

  const html = document.documentElement;
  const body = document.body;
  const LOCALE_KEY = '4shops-locale';

  function getPage() {
    return body?.dataset.page || '';
  }

  function normalizeNavPath(path) {
    let value = path || '/';
    if (value.endsWith('/index.html')) value = value.slice(0, -11) || '/';
    if (value !== '/' && value.endsWith('/')) value = value.slice(0, -1);
    return value || '/';
  }

  function navLinkMatches(linkHref, currentPath, pageId) {
    let linkPath;
    try {
      linkPath = normalizeNavPath(new URL(linkHref, window.location.origin).pathname);
    } catch {
      return false;
    }

    if (linkPath === '/') {
      return currentPath === '/' || pageId === 'index';
    }

    if (linkPath === '/pages/shop.html') {
      return currentPath === '/pages/shop.html'
        || pageId === 'shop'
        || pageId === 'product'
        || currentPath.startsWith('/products/');
    }

    if (linkPath === '/pages/products.html') {
      return currentPath === '/pages/products.html' || pageId === 'products';
    }

    if (linkPath === '/pages/news.html') {
      return currentPath === '/pages/news.html'
        || pageId === 'news'
        || pageId === 'news-article'
        || currentPath.startsWith('/pages/news/');
    }

    return currentPath === linkPath;
  }

  /* client:file-nav */
  function initHeaderNavActiveFile() {
    const pageId = getPage();
    const navLinks = document.querySelectorAll('.js-appHeader .js-link, .c-menuOverlay .js-link');
    navLinks.forEach((link) => {
      link.classList.remove('is-active');
      link.removeAttribute('aria-current');
    });
    navLinks.forEach((link) => {
      const href = (link.getAttribute('href') || '').replace(/\\/g, '/');
      if (!href || href.startsWith('#') || link.classList.contains('js-cart-open')) return;
      let active = false;
      if (pageId === 'index' && (href === 'index.html' || href.endsWith('/index.html'))) active = true;
      if (pageId === 'shop' && href.includes('shop.html')) active = true;
      if (pageId === 'products' && href.includes('products.html')) active = true;
      if (pageId === 'about-us' && href.includes('about-us.html')) active = true;
      if (pageId === 'contact' && href.includes('contact.html')) active = true;
      if (pageId === 'faq' && href.includes('faq.html')) active = true;
      if (pageId === 'news' && href.includes('news.html')) active = true;
      if (pageId === 'news-article' && href.includes('news/')) active = true;
      if (pageId === 'product' && href.includes('products/')) active = true;
      if (active) {
        link.classList.add('is-active');
        link.setAttribute('aria-current', 'page');
      }
    });
  }

  function initHeaderNavActive() {
    if (window.location.protocol === 'file:') {
      initHeaderNavActiveFile();
      return;
    }

    const currentPath = normalizeNavPath(window.location.pathname);
    const pageId = getPage();
    const navLinks = document.querySelectorAll('.js-appHeader .js-link, .c-menuOverlay .js-link');

    navLinks.forEach((link) => {
      link.classList.remove('is-active');
      link.removeAttribute('aria-current');
    });

    navLinks.forEach((link) => {
      const href = link.getAttribute('href');
      if (!href || href.startsWith('#') || link.classList.contains('js-cart-open')) return;

      if (navLinkMatches(href, currentPath, pageId)) {
        link.classList.add('is-active');
        link.setAttribute('aria-current', 'page');
      }
    });
  }

  const DEFAULT_LOCALE = {
    country: 'US',
    lang: 'en',
    currency: 'USD',
  };

  function ready(fn) {
    if (document.readyState !== 'loading') fn();
    else document.addEventListener('DOMContentLoaded', fn);
  }

  function setVh() {
    html.style.setProperty('--vh', `${window.innerHeight * 0.01}px`);
  }

  function unlockScroll() {
    html.classList.remove('is-no-scroll', 'is-loading');
    body.classList.remove('is-modal-open');
  }

  function readLocale() {
    try {
      const stored = JSON.parse(localStorage.getItem(LOCALE_KEY) || 'null');
      return { ...DEFAULT_LOCALE, ...(stored || {}) };
    } catch {
      return { ...DEFAULT_LOCALE };
    }
  }

  function writeLocale(locale) {
    localStorage.setItem(LOCALE_KEY, JSON.stringify(locale));
  }

  function formatCurrencyLabel(code) {
    const labels = {
      CAD: '$ CAD',
      USD: '$ USD',
      MXN: '$ MXN',
      GBP: '£ GBP',
      EUR: '€ EUR',
    };
    return labels[code] || code;
  }

  function applyLocale(locale) {
    body.dataset.country = locale.country;
    body.dataset.lang = locale.lang;
    html.lang = locale.lang;
    html.classList.remove('is-en', 'is-es');
    html.classList.add(`is-${locale.lang}`);

    document.querySelectorAll('.js-locale-lang').forEach((btn) => {
      const active = btn.dataset.lang === locale.lang;
      btn.classList.toggle('is-active', active);
      btn.setAttribute('aria-pressed', active ? 'true' : 'false');
    });

    document.querySelectorAll('.js-locale-country').forEach((btn) => {
      btn.classList.toggle('is-active', btn.dataset.country === locale.country);
    });

    document.querySelectorAll('.js-intl-switch').forEach((link) => {
      const match = link.dataset.country === locale.country && link.dataset.lang === locale.lang;
      if (match) link.setAttribute('aria-current', 'true');
      else link.removeAttribute('aria-current');
    });

    const form = document.querySelector('.js-locale-form');
    if (form) {
      form.querySelector('[name="country_code"]').value = locale.country;
      form.querySelector('[name="language_code"]').value = locale.lang;
    }

    if (window.context) window.context.lang = locale.lang;
    if (window.currentMarket !== undefined) window.currentMarket = locale.country;

    const headerLang = document.querySelector('.c-header__lang.js-locale-lang');
    if (headerLang) {
      headerLang.textContent = locale.lang === 'en' ? 'ES' : 'EN';
      headerLang.setAttribute('aria-label', locale.lang === 'en' ? 'See content in Spanish' : 'See content in english');
    }
  }

  function setLocale(partial) {
    const locale = { ...readLocale(), ...partial };
    writeLocale(locale);
    applyLocale(locale);
  }

  function openLayer(el) {
    if (!el) return;
    el.classList.add('is-active');
    el.setAttribute('aria-hidden', 'false');
    body.classList.add('is-modal-open');
  }

  function closeLayer(el) {
    if (!el) return;
    el.classList.remove('is-active');
    el.setAttribute('aria-hidden', 'true');
    el.querySelector('.js-cartOverlay-panel')?.classList.remove('is-active');
    if (el.classList.contains('js-cartOverlay')) {
      document.querySelector('.js-appHeader-cartBtn')?.setAttribute('aria-expanded', 'false');
      el.querySelector('.js-overlay-close')?.setAttribute('aria-expanded', 'false');
    }
    if (!document.querySelector('.o-overlay.is-active, .o-modal.is-active')) {
      unlockScroll();
    }
  }

  function initPageState() {
    applyLocale(readLocale());
    initHeaderNavActive();
    if (getPage() === 'product') {
      document.querySelector('.c-productHero')?.classList.add('is-ready');
    }
  }

  function resetPageContent() {
    const main = document.querySelector('#main');
    if (!main) return;

    main.querySelectorAll('.js-corp-reveal').forEach((el) => {
      el.classList.remove('js-corp-reveal', 'js-corp-reveal--zoom', 'is-inview');
      el.style.removeProperty('--reveal-delay');
    });

    main.querySelectorAll('.is-counted').forEach((el) => {
      el.classList.remove('is-counted');
      const suffix = el.dataset.suffix || '';
      el.textContent = `0${suffix}`;
    });

    document.querySelector('.js-appHeader')?.classList.remove('is-inverted');
  }

  function refreshPage(pageId) {
    const main = document.querySelector('#main');
    unlockScroll();
    resetPageContent();
    initPageState();
    initCorpHeroVideo();
    if (main) {
      initAccordions(main);
      initModals(main);
      initSiteScrollReveal(main);
      initAddToCart(main);
      initForms(main);
    }
    initHeaderInvert();
    initCorpStats();
    initProductVariants();
    initSwiperFallback(main || document);
    window.dispatchEvent(new CustomEvent('fourshops:page-enter', {
      detail: { page: pageId || getPage() },
    }));
  }

  window.FourShops = { refreshPage };

  function initOverlays() {
    document.querySelectorAll('.js-overlay-close, .js-overlay-bg').forEach((el) => {
      el.addEventListener('click', () => closeLayer(el.closest('.o-overlay')));
    });

    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        document.querySelectorAll('.o-overlay.is-active, .o-modal.is-active').forEach(closeLayer);
        document.querySelector('.js-menu-locale')?.classList.remove('is-open');
        document.querySelector('.js-menu-locale-toggle')?.setAttribute('aria-expanded', 'false');
        document.querySelector('.js-menu-locale-panel')?.setAttribute('hidden', '');
      }
    });
  }

  function initModals(root = document) {
    root.querySelectorAll('[class*="js-modal-open-"]:not([data-bound])').forEach((trigger) => {
      trigger.dataset.bound = '1';
      trigger.addEventListener('click', (e) => {
        e.preventDefault();
        const cls = [...trigger.classList].find((c) => c.startsWith('js-modal-open-'));
        const id = cls?.replace('js-modal-open-', '');
        if (id) openLayer(document.getElementById(id));
      });
    });

    root.querySelectorAll('.js-modal-close:not([data-bound]), .js-modal-bg:not([data-bound])').forEach((el) => {
      el.dataset.bound = '1';
      el.addEventListener('click', () => closeLayer(el.closest('.o-modal')));
    });

    root.querySelectorAll('.o-modal__tab[role="tab"]:not([data-bound])').forEach((tab) => {
      tab.dataset.bound = '1';
      tab.addEventListener('click', () => {
        const modal = tab.closest('.o-modal');
        const panelId = tab.getAttribute('aria-controls');
        if (!modal || !panelId) return;

        modal.querySelectorAll('.o-modal__tab').forEach((t) => {
          t.classList.remove('is-active');
          t.setAttribute('aria-selected', 'false');
        });
        tab.classList.add('is-active');
        tab.setAttribute('aria-selected', 'true');

        modal.querySelectorAll('[role="tabpanel"]').forEach((panel) => {
          const active = panel.id === panelId;
          panel.hidden = !active;
          panel.classList.toggle('is-active', active);
        });
      });
    });

    root.querySelectorAll('.o-modal').forEach((modal) => {
      modal.querySelector('.o-modal__tab.is-active')?.click()
        || modal.querySelector('.o-modal__tab')?.click();
    });
  }

  function initAccordions(root = document) {
    root.querySelectorAll('.js-accordion-toggle:not([data-bound])').forEach((toggle) => {
      if (toggle.closest('.js-mobile-submenu')) return;
      toggle.dataset.bound = '1';

      toggle.addEventListener('click', (e) => {
        e.preventDefault();
        const itemRoot = toggle.closest('.c-accordion, li');
        const content = itemRoot?.querySelector('.js-accordion-content, .c-accordion__content');
        const open = toggle.getAttribute('aria-expanded') === 'true';
        toggle.setAttribute('aria-expanded', open ? 'false' : 'true');
        itemRoot?.classList.toggle('is-open', !open);
        if (content) {
          if (!open) {
            content.style.setProperty('--max-height', `${content.scrollHeight}px`);
          } else {
            content.style.removeProperty('--max-height');
          }
        }
      });
    });
  }

  function initMobileMenu() {
    const overlay = document.querySelector('.js-menuOverlay');
    if (!overlay) return;

    const closeMenu = () => {
      overlay.querySelector('.js-overlay-close')?.click();
      document.querySelector('.js-menu-locale')?.classList.remove('is-open');
    };

    overlay.querySelectorAll('.c-menuOverlay__nav a.js-link:not(.js-cart-open), .c-menuOverlay__submenu a.js-link').forEach((link) => {
      link.addEventListener('click', closeMenu);
    });
  }

  function initCartDrawer() {
    const overlay = document.querySelector('.js-cartOverlay');
    const panel = overlay?.querySelector('.js-cartOverlay-panel');
    const cartBtn = document.querySelector('.js-appHeader-cartBtn');
    if (!overlay || !panel) return;

    const setExpanded = (open) => {
      cartBtn?.setAttribute('aria-expanded', open ? 'true' : 'false');
      overlay.querySelector('.js-overlay-close')?.setAttribute('aria-expanded', open ? 'true' : 'false');
    };

    const openCart = () => {
      document.querySelector('.js-menuOverlay.is-active')?.querySelector('.js-overlay-close')?.click();
      openLayer(overlay);
      panel.classList.add('is-active');
      setExpanded(true);
    };

    const closeCart = () => {
      closeLayer(overlay);
      panel.classList.remove('is-active');
      setExpanded(false);
    };

    document.addEventListener('click', (e) => {
      const trigger = e.target.closest('.js-appHeader-cartBtn, .js-cart-open, .c-menuOverlay__navLink--cart');
      if (!trigger) return;
      e.preventDefault();
      e.stopImmediatePropagation();
      if (overlay.classList.contains('is-active')) closeCart();
      else openCart();
    }, true);

    overlay.querySelectorAll('.js-overlay-close, .js-overlay-bg').forEach((el) => {
      el.addEventListener('click', () => closeCart());
    });

    overlay.querySelectorAll('.js-cart-continue').forEach((link) => {
      link.addEventListener('click', () => closeCart());
    });

    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && overlay.classList.contains('is-active')) closeCart();
    });
  }

  function initLocale() {
    document.querySelectorAll('.js-locale-form').forEach((form) => {
      form.addEventListener('submit', (e) => e.preventDefault());
    });

    document.addEventListener('click', (e) => {
      const intlLink = e.target.closest('.js-intl-switch');
      if (intlLink) {
        e.preventDefault();
        e.stopImmediatePropagation();
        setLocale({
          country: intlLink.dataset.country || readLocale().country,
          lang: intlLink.dataset.lang || readLocale().lang,
          currency: intlLink.dataset.currency || readLocale().currency,
          countryLabel: intlLink.closest('.c-intlOverlay__country')
            ?.querySelector('h4')?.textContent?.trim() || readLocale().countryLabel,
          currencyLabel: formatCurrencyLabel(intlLink.dataset.currency || readLocale().currency),
        });
        closeLayer(document.querySelector('.js-intlOverlay'));
        return;
      }

      const langBtn = e.target.closest('.js-locale-lang');
      if (langBtn) {
        e.preventDefault();
        const target = langBtn.dataset.lang;
        const current = readLocale().lang;
        const next = langBtn.closest('.c-header__extras')
          ? (current === 'en' ? 'es' : 'en')
          : target;
        setLocale({ lang: next });
        return;
      }

      const countryBtn = e.target.closest('.js-locale-country');
      if (countryBtn) {
        e.preventDefault();
        setLocale({
          country: countryBtn.dataset.country,
          currency: countryBtn.dataset.currency,
          countryLabel: countryBtn.dataset.name,
          currencyLabel: countryBtn.dataset.currencyLabel,
        });
        const localeRoot = countryBtn.closest('.js-menu-locale');
        localeRoot?.classList.remove('is-open');
        const toggle = localeRoot?.querySelector('.js-menu-locale-toggle');
        toggle?.setAttribute('aria-expanded', 'false');
        localeRoot?.querySelector('.js-menu-locale-panel')?.setAttribute('hidden', '');
        return;
      }

      const localeToggle = e.target.closest('.js-menu-locale-toggle');
      if (localeToggle) {
        e.preventDefault();
        const root = localeToggle.closest('.js-menu-locale');
        const panel = root?.querySelector('.js-menu-locale-panel');
        const open = root?.classList.toggle('is-open');
        localeToggle.setAttribute('aria-expanded', open ? 'true' : 'false');
        if (panel) {
          if (open) panel.removeAttribute('hidden');
          else panel.setAttribute('hidden', '');
        }
      }
    }, true);

    document.querySelectorAll('.js-lang-switch').forEach((link) => {
      link.addEventListener('click', (e) => {
        e.preventDefault();
        const next = readLocale().lang === 'en' ? 'es' : 'en';
        setLocale({ lang: next });
      });
    });
  }

  function initHeaderSubmenus() {
    const header = document.querySelector('.js-appHeader');
    if (!header) return;

    const closeAll = () => {
      document.querySelectorAll('.js-submenu').forEach((submenu) => {
        submenu.classList.remove('--open', '--reveal', '--active');
        submenu.style.removeProperty('max-height');
      });
      header.classList.remove('is-header-inverted', 'is-submenu-open');
    };

    const syncOpenClass = () => {
      header.classList.toggle('is-submenu-open', !!header.querySelector('.js-submenu.--open'));
    };

    header.addEventListener('mouseleave', closeAll);

    new MutationObserver(syncOpenClass).observe(header, {
      attributes: true,
      attributeFilter: ['class'],
    });

    document.querySelectorAll('.js-submenu').forEach((submenu) => {
      new MutationObserver(syncOpenClass).observe(submenu, {
        attributes: true,
        attributeFilter: ['class'],
      });
    });

    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') closeAll();
    });
  }

  function initGenderToggle() {
    document.querySelectorAll('.js-toggle-gender').forEach((toggle) => {
      toggle.addEventListener('click', () => {
        const input = toggle.querySelector('input[type="checkbox"]');
        if (input) input.checked = !input.checked;
        toggle.closest('.c-uiFeaturedCategories, .c-uiFeatured')?.classList.toggle('is-women', input?.checked);
      });
    });
  }

  function initColorSwatches() {
    document.querySelectorAll('.js-color-thumb').forEach((thumb) => {
      thumb.addEventListener('click', (e) => {
        const href = thumb.getAttribute('href');
        if (href && !href.startsWith('#')) return;

        e.preventDefault();
        const root = thumb.closest('.c-productHero, .c-productColorSwatch');
        root?.querySelectorAll('.js-color-thumb').forEach((t) => t.classList.remove('active'));
        thumb.classList.add('active');

        const label = thumb.getAttribute('aria-label') || thumb.dataset.color;
        root?.querySelectorAll('.js-title-color, .js-title-color-default').forEach((el) => {
          el.classList.toggle('is-active', el.textContent.trim() === label);
        });
      });
    });
  }

  function initReadMore() {
    document.querySelectorAll('.js-read-more-toggle, .c-productHero__readMore button').forEach((btn) => {
      btn.addEventListener('click', () => {
        btn.closest('.c-productHero__description, .c-productHero__text, .c-productHero__readMore')
          ?.classList.toggle('is-expanded');
      });
    });
  }

  function initSizeGuideToggle() {
    document.querySelectorAll('.js-toggle-unit').forEach((btn) => {
      btn.addEventListener('click', () => {
        btn.closest('.c-legacySizeGuide, .c-faqAccordions')?.classList.toggle('is-inches');
        btn.classList.toggle('is-inches');
      });
    });
  }

  function initSiteScrollReveal(root = document) {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    const isMobile = window.matchMedia('(max-width: 768px)').matches;
    const configs = [
      /* Homepage */
      { selector: '.c-corpHero__content > *', stagger: 85, max: 255 },
      { selector: '.c-corpStats__item', stagger: 90, max: 360 },
      { selector: '.c-corpAreas__header', stagger: 0 },
      { selector: '.c-corpAreas__item', stagger: 70, max: 490, zoom: true },
      { selector: '.c-corpHeadline__inner > *', stagger: 110, max: 330 },
      { selector: '.c-corpStory__header', stagger: 0 },
      { selector: '.c-corpStory__row', stagger: 0, zoom: true },
      { selector: '.c-corpNews__title', stagger: 0 },
      { selector: '.c-corpNews__featured', stagger: 0, zoom: true },
      { selector: '.c-corpNews__listItem', stagger: 70, max: 280, zoom: true },
      { selector: '.c-corpSubscribe__inner > *', stagger: 100, max: 300 },
      { selector: '.c-corpShopBand__inner > *', stagger: 100, max: 300 },
      /* Shop & catalog */
      { selector: '.c-uiIntro__content > *', stagger: 90, max: 270 },
      { selector: '.c-uiIntro__media', stagger: 0, zoom: true },
      { selector: '.c-uiFeatured__header', stagger: 0 },
      { selector: '.c-uiFeatured__header > *', stagger: 70, max: 210 },
      { selector: '.c-featuredBrandsGrid__item', stagger: 55, max: 440, zoom: true },
      { selector: '.c-featuredBrandsGrid__cta', stagger: 0 },
      { selector: '.c-corpProducts .o-productItem', stagger: 45, max: 450, zoom: true },
      { selector: '.c-productsGrid__header', stagger: 0 },
      { selector: '.c-productsGrid .o-productItem', stagger: 45, max: 450, zoom: true },
      { selector: '.c-selling-points__item', stagger: 80, max: 320 },
      { selector: '.c-uiTwoColsMedia__container > *', stagger: 100, max: 200, zoom: true },
      /* Product page */
      { selector: '.c-productHero__gallery', stagger: 0, zoom: true },
      { selector: '.c-productHero__infos__inner > *', stagger: 60, max: 300 },
      { selector: '.c-productHero__stickyInfos > *', stagger: 50, max: 150 },
      { selector: '.c-product-highlight-products', stagger: 0 },
      { selector: '.c-product-highlight-products .o-productItem', stagger: 45, max: 360, zoom: true },
      { selector: '.c-productPage__details', stagger: 0 },
      /* News */
      { selector: '.c-corpNews__top', stagger: 0 },
      { selector: '.c-corpNewsPage__card', stagger: 80, max: 320, zoom: true },
      { selector: '.c-corpNewsArticle__headerInner > *', stagger: 90, max: 270 },
      { selector: '.c-corpNewsArticle__media', stagger: 0, zoom: true },
      { selector: '.c-corpNewsArticle__prose > *', stagger: 55, max: 280 },
      { selector: '.c-corpNewsArticle__footer', stagger: 0 },
      /* Policy & FAQ */
      { selector: '.c-corpPolicyPage__header', stagger: 0 },
      { selector: '.c-corpPolicyPage__body > *', stagger: 50, max: 300 },
      { selector: '.c-faqAccordions .c-accordion', stagger: 45, max: 360 },
      { selector: '.c-splitText .word', stagger: 35, max: 140 },
      { selector: '.c-linesBlock__line', stagger: 90, max: 180 },
      /* About & contact */
      { selector: '.c-corpAboutPage__mission', stagger: 0 },
      { selector: '.c-corpAboutPage__narrativeInner > *', stagger: 120, max: 240, zoom: true },
      { selector: '.c-corpAboutPage__valuesHeader', stagger: 0 },
      { selector: '.c-corpAboutPage__value', stagger: 90, max: 270 },
      { selector: '.c-corpAboutPage__partnersInner', stagger: 0 },
      { selector: '.c-corpAboutPage__marketCard', stagger: 100, max: 200, zoom: true },
      { selector: '.c-corpAboutPage__closing .c-corpHeadline__inner > *', stagger: 100, max: 300 },
      { selector: '.c-corpContactStats .c-corpStats__item', stagger: 90, max: 270 },
      { selector: '.c-corpContactForm__intro', stagger: 0 },
      { selector: '.c-corpContactForm__form', stagger: 0 },
      /* Footer */
      { selector: '.c-footerShop__intro', stagger: 0 },
      { selector: '.c-footerShop__intro > *', stagger: 80, max: 240 },
      { selector: '.c-footerShop__col', stagger: 70, max: 210 },
      { selector: '.c-footerShop__visual', stagger: 0, zoom: true },
      { selector: '.c-footerShop__bar', stagger: 0 },
    ];

    const seen = new Set();
    const nodes = [];

    configs.forEach(({ selector, stagger = 0, max = 0, zoom = false }) => {
      if (selector.startsWith('.c-corpHero__content')) return;
      document.querySelectorAll(selector).forEach((el, index) => {
        if (!root.contains(el)) return;
        if (seen.has(el)) return;
        seen.add(el);
        el.classList.add('js-corp-reveal');
        if (zoom) el.classList.add('js-corp-reveal--zoom');
        if (stagger) {
          el.style.setProperty('--reveal-delay', `${Math.min(index * stagger, max)}ms`);
        }
        nodes.push(el);
      });
    });

    if (!nodes.length) return;

    const io = new IntersectionObserver(
      (entries) => entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add('is-inview');
        io.unobserve(entry.target);
      }),
      {
        threshold: isMobile ? 0.08 : 0.12,
        rootMargin: isMobile ? '0px 0px -3% 0px' : '0px 0px -6% 0px',
      }
    );

    nodes.forEach((el) => io.observe(el));
  }

  function initScrollReveal() {
    initSiteScrollReveal();
  }

  function initMarquee() {
    document.querySelectorAll('.c-uiMarquee, .c-marquee').forEach((el) => el.classList.add('is-animating'));
  }

  function initHeaderInvert() {
    const header = document.querySelector('.js-appHeader');
    if (!header) return;
    const hero = document.querySelector('.c-uiIntro .-has-media, .c-corpHero .-has-media, .c-productsGrid__header.-has-media');
    if (hero) header.classList.add('is-inverted');
  }

  function initHeaderScroll() {
    const header = document.querySelector('.js-appHeader');
    if (!header) return;
    const threshold = 24;
    let ticking = false;
    const apply = () => {
      const scrolled = window.scrollY > threshold;
      header.classList.toggle('is-scrolled', scrolled);
      body.classList.toggle('has-scrolled-header', scrolled);
      ticking = false;
    };
    const onScroll = () => {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(apply);
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    apply();
  }

  function initScrollPerformance() {
    html.classList.add('is-static-smooth');
  }

  function initMobileUX() {
    const touch = window.matchMedia('(hover: none), (pointer: coarse)').matches;
    html.classList.toggle('is-touch', touch);
    html.classList.toggle('is-no-touchevents', !touch);
  }

  function initAddToCart(root = document) {
    root.querySelectorAll('.js-add-btn:not([data-bound])').forEach((btn) => {
      btn.dataset.bound = '1';
      btn.addEventListener('click', (e) => {
        e.preventDefault();
        btn.classList.add('is-loading');
        setTimeout(() => {
          btn.classList.remove('is-loading');
          const label = btn.querySelector('.shopify-status, span:last-child');
          if (label) {
            const orig = label.textContent;
            label.textContent = 'Added';
            setTimeout(() => { label.textContent = orig; }, 1800);
          }
        }, 500);
      });
    });
  }

  function initForms(root = document) {
    root.querySelectorAll('form:not(.js-locale-form):not([data-bound])').forEach((form) => {
      form.dataset.bound = '1';
      form.addEventListener('submit', (e) => {
        e.preventDefault();
        const span = form.querySelector('[type="submit"] span');
        if (span) span.textContent = 'Subscribed';
      });
    });
  }

  function initReviews() {
    document.querySelectorAll('.jdgm-rev-widg').forEach((w) => w.style.removeProperty('display'));
    document.querySelectorAll('.jdgm-temp-hiding-style').forEach((s) => s.remove());
  }

  function initCorpHeroVideo() {
    const hero = document.querySelector('.c-corpHero:not(.c-corpHero--page)');
    const video = document.querySelector('.js-corp-hero-video');
    if (!hero || !video) return;

    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    const showPoster = () => {
      hero.classList.add('is-video-fallback');
      hero.classList.remove('is-video-ready');
      video.pause();
    };

    const showVideo = () => {
      hero.classList.add('is-video-ready');
      hero.classList.remove('is-video-fallback');
    };

    if (prefersReducedMotion) {
      showPoster();
      return;
    }

    video.addEventListener('loadeddata', showVideo);
    video.addEventListener('canplay', showVideo);
    video.addEventListener('error', showPoster);

    const play = () => {
      const attempt = video.play();
      if (attempt && typeof attempt.catch === 'function') {
        attempt.catch(showPoster);
      }
    };

    if (video.readyState >= 2) showVideo();
    play();

    document.addEventListener('visibilitychange', () => {
      if (document.hidden) video.pause();
      else if (!hero.classList.contains('is-video-fallback')) play();
    });
  }

  function initCorpStats() {
    const stats = document.querySelectorAll('.js-corp-stat');
    if (!stats.length) return;

    const animateValue = (el) => {
      const target = Number(el.dataset.target) || 0;
      const suffix = el.dataset.suffix || '';
      const duration = 1400;
      const start = performance.now();

      el.classList.add('is-counted');

      const step = (now) => {
        const progress = Math.min((now - start) / duration, 1);
        const eased = 1 - Math.pow(1 - progress, 3);
        const current = Math.round(eased * target);
        el.textContent = `${current}${suffix}`;
        if (progress < 1) requestAnimationFrame(step);
        else el.textContent = `${target}${suffix}`;
      };

      requestAnimationFrame(step);
    };

    const io = new IntersectionObserver(
      (entries) => entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        animateValue(entry.target);
        io.unobserve(entry.target);
      }),
      { threshold: 0.35, rootMargin: '0px 0px -8% 0px' }
    );

    stats.forEach((el) => {
      const suffix = el.dataset.suffix || '';
      el.textContent = `0${suffix}`;
      io.observe(el);
    });
  }

  function initSwiperFallback(root = document) {
    if (typeof window.Swiper !== 'undefined') return;
    root.querySelectorAll('.js-swiper-prev:not([data-bound])').forEach((btn) => {
      btn.dataset.bound = '1';
      btn.addEventListener('click', () => {
        const wrap = btn.closest('.swiper, [data-component]')?.querySelector('.swiper-wrapper');
        if (wrap) wrap.scrollBy({ left: -wrap.clientWidth * 0.8, behavior: 'smooth' });
      });
    });
    root.querySelectorAll('.js-swiper-next:not([data-bound])').forEach((btn) => {
      btn.dataset.bound = '1';
      btn.addEventListener('click', () => {
        const wrap = btn.closest('.swiper, [data-component]')?.querySelector('.swiper-wrapper');
        if (wrap) wrap.scrollBy({ left: wrap.clientWidth * 0.8, behavior: 'smooth' });
      });
    });
  }

  function initProductVariants() {
    const hero = document.querySelector('.c-productHero');
    if (!hero) return;

    const selects = hero.querySelectorAll('.js-product-variant');
    const priceEls = hero.querySelectorAll('.js-product-price');
    const buttons = hero.querySelectorAll('.js-add-btn');

    function applyVariant(option) {
      if (!option) return;
      const price = option.dataset.price;
      const state = option.dataset.state || 'in-stock';
      const variantId = option.value;
      const inStock = state === 'in-stock';

      priceEls.forEach((el) => {
        if (price) el.textContent = `$${parseFloat(price).toFixed(2)}`;
      });

      buttons.forEach((btn) => {
        btn.dataset.variantId = variantId;
        btn.dataset.state = state;
        btn.disabled = !inStock;
        const label = btn.querySelector('.shopify-status');
        if (label) label.textContent = inStock ? 'Add to cart' : 'Out of stock';
      });

      hero.querySelectorAll('[data-variant-id]').forEach((input) => {
        if (input.tagName === 'INPUT') input.value = variantId;
      });
    }

    function syncSelects(source) {
      selects.forEach((select) => {
        if (select !== source) select.value = source.value;
      });
      applyVariant(source.selectedOptions[0]);
    }

    selects.forEach((select) => {
      select.addEventListener('change', () => syncSelects(select));
      if (select.selectedOptions[0]) applyVariant(select.selectedOptions[0]);
    });
  }

  ready(() => {
    html.classList.remove('is-loading');
    html.classList.add('is-ready', 'is-dom-ready');
    unlockScroll();
    setVh();
    window.addEventListener('resize', setVh);
    window.addEventListener('load', unlockScroll, { once: true });

    initCorpHeroVideo();
    initPageState();
    initLocale();
    initOverlays();
    initModals();
    initAccordions();
    initMobileMenu();
    initCartDrawer();
    initHeaderSubmenus();
    initGenderToggle();
    initColorSwatches();
    initReadMore();
    initSizeGuideToggle();
    initScrollReveal();
    initMarquee();
    initHeaderInvert();
    initCorpStats();
    initHeaderScroll();
    initScrollPerformance();
    initMobileUX();
    initAddToCart();
    initProductVariants();
    initForms();
    initReviews();
    initSwiperFallback();
  });
})();
