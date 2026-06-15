/**
 * Minimal Shopify global for static local site (app.js expects it on prod).
 */
window.Shopify = {
  shop: '4shops.local',
  locale: 'en',
  country: 'US',
  currency: {
    active: 'USD',
    rate: '1.0',
  },
  routes: {
    root: '',
  },
  theme: {
    name: '4Shops',
    id: 0,
  },
};

(function () {
  const emptyCart = {
    token: 'local',
    note: null,
    attributes: {},
    original_total_price: 0,
    total_price: 0,
    total_discount: 0,
    total_weight: 0,
    item_count: 0,
    items: [],
    requires_shipping: false,
    currency: 'USD',
  };

  const nativeFetch = window.fetch.bind(window);
  window.fetch = function (input, init) {
    const url = typeof input === 'string' ? input : input.url;
    if (url.includes('/cart.js')) {
      return Promise.resolve({
        ok: true,
        json: () => Promise.resolve({ ...emptyCart }),
      });
    }
    if (url.includes('/cart/add.js') || url.includes('/cart/change.js') || url.includes('/cart/update.js')) {
      return Promise.resolve({
        ok: true,
        json: () => Promise.resolve({ ...emptyCart, items: [] }),
      });
    }
    return nativeFetch(input, init);
  };
})();
