var cssMarketListing = document.createElement('link');
cssMarketListing.href = chrome.runtime.getURL('js/siteExt/marketListing.css');
cssMarketListing.rel = 'stylesheet';
cssMarketListing.type = 'text/css';
(document.head || document.documentElement).prepend(cssMarketListing);

var cssF = document.createElement('link');
cssF.href = chrome.runtime.getURL('css/listings.css');
cssF.rel = 'stylesheet';
cssF.type = 'text/css';
(document.head || document.documentElement).appendChild(cssF);

var cssJqueryUI = document.createElement('link');
cssJqueryUI.href = chrome.runtime.getURL('css/jquery-ui.css');
cssJqueryUI.rel = 'stylesheet';
cssJqueryUI.type = 'text/css';
(document.head || document.documentElement).appendChild(cssJqueryUI);

chrome.storage.sync.get({
  sound: 'offersound.ogg',
  resultnumber: 10,
  shownotify: true,
  quickbuybuttons: false,

  showbookmarks: true,
  show_phase_color_listing: true,
  bookmarkscategories: {},
  gpdelayscc: 3000,
  gpdelayerr: 30000,
  agp_hover: true,
  agp_gem: false,
  agp_sticker: true,
  show_orders_currencies: true,
  show_more_orders: true,
  orders_amount: 20,
  lang: '',
  sih_token: '',
  market_cache_time: 300000,
  currency: '',
  user_sort_market_listing: [],
}, function (items) {

  const detectUserLanguage = () => {
    let navLang;
    if (window.navigator.languages && window.navigator.languages.length > 0) {
      [navLang] = window.navigator.languages;
    }
    if (!navLang) {
      navLang = window.navigator.language || window.navigator.userLanguage || '';
    }

    const VALID_LANGUAGES = [
      'bg', 'cs', 'de', 'en', 'es', 'fa', 'fr', 'he', 'it', 'ka', 'lv', 'no', 'pl', 'pt_BR',
      'ro', 'ru', 'sv', 'tr', 'vi', 'uk', 'zh_CN', 'zh_TW'
    ];
    return (VALID_LANGUAGES.includes(navLang)) ? navLang : 'en';
  }
  items.lang = items.lang || detectUserLanguage();

  $.getJSON(chrome.runtime.getURL(`_locales/en/controls.json`), (enData) => {
    $.getJSON(chrome.runtime.getURL(`_locales/${items.lang}/controls.json`), (langData) => {
      langData = jQuery.extend(true, {}, enData, langData);

      chrome.storage.local.get({
        bookmarks: {}
      }, function (subitems) {


        var actualCode = ['window.replaceBuy = ' + items.quickbuybuttons + ';',
          'window.SIHID = \'' + chrome.runtime.id + '\';',
          'window.show_orders_currencies = ' + items.show_orders_currencies + ';',
          'window.show_more_orders = ' + items.show_more_orders + ';',
          'window.orders_amount = ' + items.orders_amount + ';',
          'window.noOfRows = ' + items.resultnumber + ';',
          'window.showbookmarks = ' + items.showbookmarks + ';',
          'window.bookmarkscategories = ' + JSON.stringify(items.bookmarkscategories) + ';',
          'window.bookmarks = ' + JSON.stringify(subitems.bookmarks) + ';',
          'window.bookmarksLink = \'' + chrome.runtime.getURL('/html/bookmarks.html') + '\';',
          'window.gpdelayscc = ' + items.gpdelayscc + ';',
          'window.gpdelayerr = ' + items.gpdelayerr + ';',
          'window.agp_gem = ' + items.agp_gem + ';',
          'window.agp_sticker = ' + items.agp_sticker + ';',
          'window.show_phase_color_listing = ' + items.show_phase_color_listing + ';',
          'window.marketCacheTime = ' + items.market_cache_time + ';',
          `window.SIH_TOKEN='${items.sih_token}';`,
          `window.SIHLang = ${JSON.stringify(langData)}`,
          `window.currencyID = ${items.currency !== '' ? items.currency : null}`,
          `window.user_sort_market = ${JSON.stringify(items.user_sort_market_listing)};`,
          `window.sih_subscribe_ads = ${false}`,
        ].join('\r\n');

        var sData = document.createElement('script');
        sData.textContent = actualCode;
        (document.head || document.documentElement).appendChild(sData);
        sData.parentNode.removeChild(sData);
      });

      var sGlobal = document.createElement('script');
      sGlobal.src = chrome.runtime.getURL('js/steam/global.js');
      (document.head || document.documentElement).appendChild(sGlobal);
      sGlobal.onload = function () {

        var sPriceQueue = document.createElement('script');
        sPriceQueue.src = chrome.runtime.getURL('js/PriceQueue.js');
        (document.head || document.documentElement).appendChild(sPriceQueue);
        sPriceQueue.onload = function () {
          var sCommon = document.createElement('script');
          sCommon.src = chrome.runtime.getURL('js/hovermod.script.js');
          (document.head || document.documentElement).appendChild(sCommon);
          sCommon.onload = function () {

            var sJqueryUI = document.createElement('script');
            sJqueryUI.src = chrome.runtime.getURL('js/jquery/jquery-ui.min.js');
            (document.head || document.documentElement).appendChild(sJqueryUI);
            sJqueryUI.onload = function () {

              var sMarketListingBundle = document.createElement('script');
              sMarketListingBundle.src = chrome.runtime.getURL('js/siteExt/marketListing.bundle.js');
              (document.head || document.documentElement).appendChild(sMarketListingBundle);
              sMarketListingBundle.onload = function () {

                var sOffer = document.createElement('script');
                sOffer.src = chrome.runtime.getURL('js/listing.script.js');
                (document.head || document.documentElement).appendChild(sOffer);
                sOffer.onload = function () {

                  sOffer.parentNode.removeChild(sOffer);
                };

                sMarketListingBundle.parentNode.removeChild(sMarketListingBundle);
              };


              sJqueryUI.parentNode.removeChild(sJqueryUI);
            };

            sCommon.parentNode.removeChild(sCommon);
          };
          sPriceQueue.parentNode.removeChild(sPriceQueue);
        };
        sGlobal.parentNode.removeChild(sGlobal);
      };
    });
  });
});

var sKnifePhaseDetector = document.createElement('script');
sKnifePhaseDetector.src = chrome.runtime.getURL('js/knifephasedetector.script.js');
(document.head || document.documentElement).appendChild(sKnifePhaseDetector);
sKnifePhaseDetector.onload = function () {
  sKnifePhaseDetector.parentNode.removeChild(sKnifePhaseDetector);

  var sInventoryItemRarity = document.createElement('script');
  sInventoryItemRarity.src = chrome.runtime.getURL('js/inventoryitemrarity.script.js');
  (document.head || document.documentElement).appendChild(sInventoryItemRarity);
  sInventoryItemRarity.onload = function () {
    sInventoryItemRarity.parentNode.removeChild(sInventoryItemRarity);
  };
};

var sLodash = document.createElement('script');
sLodash.src = chrome.runtime.getURL('js/jquery/jquery.ba-throttle-debounce.js');
(document.head || document.documentElement).appendChild(sLodash);
sLodash.onload = function () {
  sLodash.parentNode.removeChild(sLodash);
}

var cssPQ = document.createElement('link');
cssPQ.href = chrome.runtime.getURL('css/priceQueue.css');
cssPQ.rel = 'stylesheet';
cssPQ.type = 'text/css';
(document.head || document.documentElement).appendChild(cssPQ);



