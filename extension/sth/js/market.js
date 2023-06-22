
var sGlobal = document.createElement('script');
sGlobal.src = chrome.runtime.getURL('js/steam/global.js');
(document.head || document.documentElement).appendChild(sGlobal);
sGlobal.onload = function () {
  sGlobal.parentNode.removeChild(sGlobal);
};

var cssJqueryUI = document.createElement('link');
cssJqueryUI.href = chrome.runtime.getURL('css/jquery-ui.css');
cssJqueryUI.rel = 'stylesheet';
cssJqueryUI.type = 'text/css';
(document.head || document.documentElement).appendChild(cssJqueryUI);

var cssPQ = document.createElement('link');
cssPQ.href = chrome.runtime.getURL('css/priceQueue.css');
cssPQ.rel = 'stylesheet';
cssPQ.type = 'text/css';
(document.head || document.documentElement).appendChild(cssPQ);

var cssMarket = document.createElement('link');
cssMarket.href = chrome.runtime.getURL('js/siteExt/market.css');
cssMarket.rel = 'stylesheet';
cssMarket.type = 'text/css';
(document.head || document.documentElement).appendChild(cssMarket);

chrome.storage.sync.get({
  quickbuybuttons: false,
  totalrow: true,
  overallsum: true,
  mylistingspagesize: 10,
  historypagesize: 10,
  highlight: true,
  highlight_await: true,
  highlight_buy: true,
  bookmarkscategories: null,
  showbookmarks: true,
  gpdelayscc: 3000,
  gpdelayerr: 30000,
  agp_hover: true,
  agp_gem: false,
  agp_sticker: true,
  lang: '',
  show_phase_color_listing: true,
  color_slot_removed_history_tran: '#47555F',
  color_slot_removed_history_tran_show: false,
  color_slot_placed_history_tran: '#FFDB0C',
  color_slot_placed_history_tran_show: false,
  color_slot_purchased_history_tran: '#FF0123',
  color_slot_purchased_history_tran_show: true,
  color_slot_sold_history_tran: '#00F900',
  color_slot_sold_history_tran_show: true,
  price_update_time: 120000,
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
      var actualCode = ['window.replaceBuy = ' + items.quickbuybuttons + ';',
        'window.SIHID = \'' + chrome.runtime.id + '\';',
        'window.totalrow = ' + items.totalrow + ';',
        'window.overallsum = ' + items.overallsum + ';',
        'window.mylistingspagesize = ' + items.mylistingspagesize + ';',
        'window.historypagesize = ' + items.historypagesize + ';',
        'window.highlight = ' + items.highlight + ';',
        'window.highlight_await = ' + items.highlight_await + ';',
        'window.highlight_buy = ' + items.highlight_buy + ';',
        'window.bookmarkscategories = ' + (items.showbookmarks ? JSON.stringify(items.bookmarkscategories) : 'null') + ';',
        'window.gpdelayscc = ' + items.gpdelayscc + ';',
        'window.gpdelayerr = ' + items.gpdelayerr + ';',
        'window.agp_gem = ' + items.agp_gem + ';',
        'window.agp_sticker = ' + items.agp_sticker + ';',
        'window.color_slot_removed_history_tran = "' + items.color_slot_removed_history_tran + '";',
        'window.color_slot_removed_history_tran_show = ' + items.color_slot_removed_history_tran_show + ';',
        'window.color_slot_placed_history_tran = "' + items.color_slot_placed_history_tran + '";',
        'window.color_slot_placed_history_tran_show = ' + items.color_slot_placed_history_tran_show + ';',
        'window.color_slot_purchased_history_tran = "' + items.color_slot_purchased_history_tran + '";',
        'window.color_slot_purchased_history_tran_show = ' + items.color_slot_purchased_history_tran_show + ';',
        'window.color_slot_sold_history_tran = "' + items.color_slot_sold_history_tran + '";',
        'window.color_slot_sold_history_tran_show = ' + items.color_slot_sold_history_tran_show + ';',
        'window.show_phase_color_listing = ' + items.show_phase_color_listing + ';',
        'window.priceUpdateTime = ' + items.price_update_time + ';',
        `window.SIHLang = ${JSON.stringify(langData)}`,
      ].join('\r\n');

      chrome.storage.local.get({
        bookmarks: null
      }, function (subitems) {
        var actualCode = [
          'window.bookmarkeditems = ' + (items.showbookmarks ? JSON.stringify(subitems.bookmarks) : 'null') + ';'
        ].join('\r\n');

        var scriptsub = document.createElement('script');
        scriptsub.textContent = actualCode;
        (document.head || document.documentElement).appendChild(scriptsub);
        scriptsub.parentNode.removeChild(scriptsub);
      });

      var script = document.createElement('script');
      script.textContent = actualCode;
      (document.head || document.documentElement).appendChild(script);
      script.parentNode.removeChild(script);


      var sJqueryUI = document.createElement('script');
      sJqueryUI.src = chrome.runtime.getURL('js/jquery/jquery-ui.min.js');
      (document.head || document.documentElement).appendChild(sJqueryUI);
      sJqueryUI.onload = function () {

      var sPriceQueue = document.createElement('script');
      sPriceQueue.src = chrome.runtime.getURL('js/PriceQueue.js');
      (document.head || document.documentElement).appendChild(sPriceQueue);
      sPriceQueue.onload = function () {
        sPriceQueue.parentNode.removeChild(sPriceQueue);
      };


        var sCommon = document.createElement('script');
        sCommon.src = chrome.runtime.getURL('js/hovermod.script.js');
        (document.head || document.documentElement).appendChild(sCommon);

        sCommon.onload = function () {
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

          var sMarketBundle = document.createElement('script');
          sMarketBundle.src = chrome.runtime.getURL('js/siteExt/market.bundle.js');
          (document.head || document.documentElement).appendChild(sMarketBundle);
          sMarketBundle.onload = function () {

            var sOffer = document.createElement('script');
            sOffer.src = chrome.runtime.getURL('js/market.script.js');
            (document.head || document.documentElement).appendChild(sOffer);
            sOffer.onload = function () {
              sOffer.parentNode.removeChild(sOffer);
            };

            sMarketBundle.parentNode.removeChild(sMarketBundle);
          }


          sCommon.parentNode.removeChild(sCommon);
        };


        var sDebounce = document.createElement('script');
        sDebounce.src = chrome.runtime.getURL('js/jquery/jquery.ba-throttle-debounce.min.js');
        (document.head || document.documentElement).appendChild(sDebounce);
        sDebounce.onload = function () {
          // sPriceQueue.parentNode.removeChild(sDebounce);
        };

        sJqueryUI.parentNode.removeChild(sJqueryUI);
      };
    });
  });
});

var cssF = document.createElement('link');
cssF.href = chrome.runtime.getURL('css/market.css');
cssF.rel = 'stylesheet';
cssF.type = 'text/css';
(document.head || document.documentElement).appendChild(cssF);

$(function () {
  $('#myListings').on('click', '.remove-bookmark', function () {
    var hashmarket = $(this).data('hash');
    $(this).parents('.market_listing_row.market_recent_listing_row').hide(200);
    chrome.storage.local.get({
      bookmarks: null
    }, function (items) {
      var bookmarks = items.bookmarks || {};
      if (bookmarks[hashmarket]) {
        delete bookmarks[hashmarket];
      }

      chrome.storage.local.set({
        bookmarks: bookmarks
      });
    });
  });
});
