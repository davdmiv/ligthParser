const dataObj = {
  dataAll: [
    {
      ruleName: 'погода на яндексе',
      ruleUrl: 'https://yandex.ru/',
      shrubRule: 'div[class="weather__temp"]',
      pageType: 'dynamic',
      userId: 1,
    },
    {
      ruleName: 'Самокат с яндекса',
      ruleUrl:
        'https://market.yandex.ru/product--elektrosamokat-xiaomi-mijia-m365-pro/394271125',
      shrubRule: 'div[class="KnVez"]',
      pageType: 'dynamic',
      userId: 1,
    },
    {
      ruleName: 'svyaznoy.ru',
      ruleUrl: 'https://www.svyaznoy.ru/catalog/gamepad/9209/5796227',
      shrubRule: '.b-offer-box__right.mobile',
      pageType: 'dynamic',
      userId: 1,
    },
    {
      ruleName: 'shop.mts.ru',
      ruleUrl:
        'https://shop.mts.ru/product/igrovaja-konsol-sony-playstation-5-ultra-hd-blu-ray-disc',
      shrubRule: '.product-detail',
      pageType: 'dynamic',
      userId: 1,
    },
    {
      ruleName: 'gamepark.ru', // похоже статический
      ruleUrl:
        'https://www.gamepark.ru/playstation5/console/IgrovayakonsolSonyPlayStation5/',
      shrubRule: 'div[itemprop="offers"]',
      pageType: 'static',
      userId: 1,
    },
    {
      ruleName: 'citilink.ru',
      ruleUrl:
        'https://www.citilink.ru/product/igrovaya-konsol-playstation-5-ps719398707-belyi-1438618/',
      shrubRule: '.ProductCardLayout__product-description',
      pageType: 'dynamic',
      userId: 1,
    },
    // {
    //   ruleName: 'store.sony.ru',
    //   ruleUrl: 'https://store.sony.ru/product/konsol-playstation-5-317406/',
    //   shrubRule: '.pricebox',
    //   pageType: 'dynamic',
    // },
    // {
    //   ruleName: 'mvideo.ru',
    //   ruleUrl: 'https://www.mvideo.ru/products/igrovaya-konsol-sony-playstation-5-40073270',
    //   shrubRule: '.o-container__price-column',
    //   pageType: 'dynamic',
    // },
    {
      ruleName: 'videoigr.net', // статический
      ruleUrl:
        'https://videoigr.net/product_info/igrovaya-pristavka-playstation-5/21201/',
      shrubRule: '#cart_quantity',
      pageType: 'static',
      userId: 1,
    },
    {
      ruleName: 'koza-k9', // статический
      ruleUrl: 'https://kamindom.ru/product/pech-kamin-kratki-koza-k9.html',
      shrubRule: 'div[class="product-price-block"]',
      pageType: 'static',
      userId: 1,
    },
  ],
  dataLocal: [
    {
      ruleName: 'dynamic-test1', // динамический
      ruleUrl: 'http://localhost:3001/posts/1',
      shrubRule: 'div[src-data="post #1"]',
      pageType: 'dynamic',
      userId: 1,
    },
    {
      ruleName: 'dynamic-test2', // динамический
      ruleUrl: 'http://localhost:3001/posts/2',
      shrubRule: 'div[src-data="post #2"]',
      pageType: 'dynamic',
      userId: 1,
    },
    {
      ruleName: 'dynamic-test3', // динамический
      ruleUrl: 'http://localhost:3001/posts/3',
      shrubRule: 'div[src-data="post #3"]',
      pageType: 'dynamic',
      userId: 1,
    },
    {
      ruleName: 'dynamic-test4', // динамический
      ruleUrl: 'http://localhost:3001/posts/4',
      shrubRule: 'div[src-data="post #4"]',
      pageType: 'dynamic',
      userId: 1,
    },
    {
      ruleName: 'dynamic-test5', // динамический
      ruleUrl: 'http://localhost:3001/posts/5',
      shrubRule: 'div[src-data="post #5"]',
      pageType: 'dynamic',
      userId: 1,
    },
    {
      ruleName: 'static-test1', // статический
      ruleUrl: 'http://localhost:3001/static/static_page2.html',
      shrubRule: 'div[src-data="static post #2"]',
      pageType: 'static',
      userId: 1,
    },
    {
      ruleName: 'static-test2', // статический
      ruleUrl: 'http://localhost:3001/static/html/static_page3.html',
      shrubRule: 'div[src-data="static post #3"]',
      pageType: 'static',
      userId: 1,
    },
  ],
}

module.exports = dataObj
