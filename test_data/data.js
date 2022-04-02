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
  rules: [
    {
      id: 2,
      name: 'dynamic-test2',
      url: 'http://localhost:3001/posts/2',
      shrub_rule: 'div[src-data="post #2"]',
      shrub_cache: 'f9b3d616ebeba818ef24d03502312e06',
      frequency: '1970-01-01T00:01:10.000Z',
      page_type: 'dynamic',
      page_changed: '2022-04-02T09:06:14.878Z',
      last_check: '2022-04-02T15:23:20.604Z',
      duration: 6363,
      public_status: false,
      description: '',
      activate_cnt: 39,
      activate_status: true,
      createdAt: '2022-03-22T14:40:27.131Z',
      updatedAt: '2022-04-02T15:23:20.605Z',
      user_id: 1
    },
    {
      id: 1,
      name: 'dynamic-test1',
      url: 'http://localhost:3001/posts/1',
      shrub_rule: 'div[src-data="post #1"]',
      shrub_cache: 'e7a9e3f8fd3a05c51e8a2d0d23092fca',
      frequency: '1970-01-01T00:01:11.000Z',
      page_type: 'dynamic',
      page_changed: '2022-04-02T09:06:18.367Z',
      last_check: '2022-04-02T15:23:24.299Z',
      duration: 5949,
      public_status: false,
      description: '',
      activate_cnt: 57,
      activate_status: true,
      createdAt: '2022-03-22T14:40:27.080Z',
      updatedAt: '2022-04-02T15:23:24.299Z',
      user_id: 1
    },
    {
      id: 7,
      name: 'static-test2',
      url: 'http://localhost:3001/static/html/static_page3.html',
      shrub_rule: 'div[src-data="static post #3"]',
      shrub_cache: '9c6213120124dd19f6138e02e59004eb',
      frequency: '1970-01-01T00:01:26.000Z',
      page_type: 'static',
      page_changed: '2022-03-31T23:14:01.950Z',
      last_check: '2022-04-02T15:23:25.843Z',
      duration: 16,
      public_status: false,
      description: '',
      activate_cnt: 33,
      activate_status: true,
      createdAt: '2022-03-22T14:40:27.686Z',
      updatedAt: '2022-04-02T15:23:25.843Z',
      user_id: 1
    },
    {
      id: 4,
      name: 'dynamic-test4',
      url: 'http://localhost:3001/posts/4',
      shrub_rule: 'div[src-data="post #4"]',
      shrub_cache: 'ccd5dca6299df6681cd220a670d51e27',
      frequency: '1970-01-01T00:01:24.000Z',
      page_type: 'dynamic',
      page_changed: '2022-04-02T09:06:44.355Z',
      last_check: '2022-04-02T15:23:37.784Z',
      duration: 5993,
      public_status: false,
      description: '',
      activate_cnt: 36,
      activate_status: true,
      createdAt: '2022-03-22T14:40:27.247Z',
      updatedAt: '2022-04-02T15:23:37.785Z',
      user_id: 1
    },
    {
      id: 6,
      name: 'static-test1',
      url: 'http://localhost:3001/static/static_page2.html',
      shrub_rule: 'div[src-data="static post #2"]',
      shrub_cache: '6a24b436c2c876abb112396082f80616',
      frequency: '1970-01-01T00:01:38.000Z',
      page_type: 'static',
      page_changed: '2022-04-02T09:06:57.522Z',
      last_check: '2022-04-02T15:23:37.899Z',
      duration: 22,
      public_status: false,
      description: '',
      activate_cnt: 20,
      activate_status: true,
      createdAt: '2022-03-22T14:40:27.643Z',
      updatedAt: '2022-04-02T15:23:37.899Z',
      user_id: 1
    },
    {
      id: 5,
      name: 'dynamic-test5',
      url: 'http://localhost:3001/posts/5',
      shrub_rule: 'div[src-data="post #5"]',
      shrub_cache: '6907cc2ccba2d83e87f06e35cb5c4865',
      frequency: '1970-01-01T00:01:30.000Z',
      page_type: 'dynamic',
      page_changed: '2022-04-02T09:06:54.163Z',
      last_check: '2022-04-02T15:23:40.152Z',
      duration: 5557,
      public_status: false,
      description: '',
      activate_cnt: 55,
      activate_status: true,
      createdAt: '2022-03-22T14:40:27.407Z',
      updatedAt: '2022-04-02T15:23:40.152Z',
      user_id: 1
    },
    {
      id: 3,
      name: 'dynamic-test3',
      url: 'http://localhost:3001/posts/3',
      shrub_rule: 'div[src-data="post #3"]',
      shrub_cache: 'cb74763a4e6163e6a2e1474b72f457d2',
      frequency: '1970-01-01T00:01:34.000Z',
      page_type: 'dynamic',
      page_changed: '2022-04-02T09:07:01.620Z',
      last_check: '2022-04-02T15:23:41.313Z',
      duration: 2386,
      public_status: false,
      description: '',
      activate_cnt: 53,
      activate_status: true,
      createdAt: '2022-03-22T14:40:27.177Z',
      updatedAt: '2022-04-02T15:23:41.313Z',
      user_id: 1
    }
  ]
}

module.exports = dataObj
