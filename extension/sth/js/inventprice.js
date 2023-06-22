window.CSGO_ORIGINS = null;
$.getJSON(chrome.runtime.getURL('/assets/json/csgo_origin_names.json'), (data) => {
  CSGO_ORIGINS = data;
});

window.PROVIDERS_LIST = null;

var priceUtils = document.createElement('script');
priceUtils.src = chrome.runtime.getURL('js/priceutils.script.js');
(document.head || document.documentElement).appendChild(priceUtils);
priceUtils.onload = function () {
  priceUtils.parentNode.removeChild(priceUtils);
};

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

var cssInventoryItemRarity = document.createElement('link');
cssInventoryItemRarity.href = chrome.runtime.getURL('css/colorizeinventoryitem.css');
cssInventoryItemRarity.rel = 'stylesheet';
cssInventoryItemRarity.type = 'text/css';
(document.head || document.documentElement).appendChild(cssInventoryItemRarity);

var cssSwitcher = document.createElement('link');
cssSwitcher.href = chrome.runtime.getURL('css/switcher.css');
cssSwitcher.rel = 'stylesheet';
cssSwitcher.type = 'text/css';
(document.head || document.documentElement).appendChild(cssSwitcher);

var sSwitcher = document.createElement('script');
sSwitcher.src = chrome.runtime.getURL('js/jquery/jquery.switcher.min.js');
(document.head || document.documentElement).appendChild(sSwitcher);
sSwitcher.onload = function () {
  sSwitcher.parentNode.removeChild(sSwitcher);
};

var cssJqueryUI = document.createElement('link');
cssJqueryUI.href = chrome.runtime.getURL('css/jquery-ui.css');
cssJqueryUI.rel = 'stylesheet';
cssJqueryUI.type = 'text/css';
(document.head || document.documentElement).appendChild(cssJqueryUI);

var sJqueryUI = document.createElement('script');
sJqueryUI.src = chrome.runtime.getURL('js/jquery/jquery-ui.min.js');
(document.head || document.documentElement).appendChild(sJqueryUI);
sJqueryUI.onload = function () {
  sJqueryUI.parentNode.removeChild(sJqueryUI);
}

var cssProfilesInventory = document.createElement('link');
cssProfilesInventory.href = chrome.runtime.getURL('js/siteExt/profilesInventory.css');
cssProfilesInventory.rel = 'stylesheet';
cssProfilesInventory.type = 'text/css';
(document.head || document.documentElement).appendChild(cssProfilesInventory);

var sCacher = document.createElement('script');
sCacher.src = chrome.runtime.getURL('bundle/js/RequestCacher.js');
(document.head || document.documentElement).appendChild(sCacher);
sCacher.onload = function () {
  sCacher.parentNode.removeChild(sCacher);
};

var sPriceQueue = document.createElement('script');
sPriceQueue.src = chrome.runtime.getURL('js/PriceQueue.js');
(document.head || document.documentElement).appendChild(sPriceQueue);
sPriceQueue.onload = function () {
  sPriceQueue.parentNode.removeChild(sPriceQueue);
};

var cssPQ = document.createElement('link');
cssPQ.href = chrome.runtime.getURL('css/priceQueue.css');
cssPQ.rel = 'stylesheet';
cssPQ.type = 'text/css';
(document.head || document.documentElement).appendChild(cssPQ);

var sHelper = document.createElement('script');
sHelper.src = chrome.runtime.getURL('js/helper.js');
(document.head || document.documentElement).appendChild(sHelper);
sHelper.onload = function () {
  sHelper.parentNode.removeChild(sHelper);
};

var sGlobal = document.createElement('script');
sGlobal.src = chrome.runtime.getURL('js/steam/global.js');
(document.head || document.documentElement).appendChild(sGlobal);
sGlobal.onload = function () {
  sGlobal.parentNode.removeChild(sGlobal);
};

var sScroll = document.createElement('script');
sScroll.src = chrome.runtime.getURL('js/jquery/jquery.scrollbar.min.js');
(document.head || document.documentElement).appendChild(sScroll);
sScroll.onload = function () {
  sScroll.parentNode.removeChild(sScroll);
};

var cssF = document.createElement('link');
cssF.href = chrome.runtime.getURL('css/inventscript.css');
cssF.rel = 'stylesheet';
cssF.type = 'text/css';
(document.head || document.documentElement).appendChild(cssF);

var cssM = document.createElement('link');
cssM.href = window.location.protocol + '//steamcommunity-a.akamaihd.net/public/css/skin_1/economy_market.css';
cssM.rel = 'stylesheet';
cssM.type = 'text/css';
(document.head || document.documentElement).appendChild(cssM);

var cssC = document.createElement('link');
cssC.href = chrome.runtime.getURL('css/jquery.scrollbar.css');
cssC.rel = 'stylesheet';
cssC.type = 'text/css';
(document.head || document.documentElement).appendChild(cssC);

var cJqueryConfirm = document.createElement('link');
cJqueryConfirm.href = chrome.runtime.getURL('js/jquery/jquery-confirm.min.css');
cJqueryConfirm.rel = 'stylesheet';
cJqueryConfirm.type = 'text/css';
(document.head || document.documentElement).appendChild(cJqueryConfirm);

var sLodash = document.createElement('script');
sLodash.src = chrome.runtime.getURL('js/jquery/jquery.ba-throttle-debounce.js');
(document.head || document.documentElement).appendChild(sLodash);
sLodash.onload = function () {
  sLodash.parentNode.removeChild(sLodash);
}

var sJqueryConfirm = document.createElement('script');
sJqueryConfirm.src = chrome.runtime.getURL('js/jquery/jquery-confirm.min.js');
(document.head || document.documentElement).appendChild(sJqueryConfirm);
sJqueryConfirm.onload = function () {
  sJqueryConfirm.parentNode.removeChild(sJqueryConfirm);
}

chrome.storage.sync.get({
  fastdelta: -0.01,
  delaylistings: 200,
  quicksellbuttons: true,
  instantsellbuttons: false,
  buysetbuttons: true,
  selectallbuttons: true,
  inventoryprice: true,
  currency: '',
  lang: '',
  apikey: '',
  gpdelayscc: 3000,
  gpdelayerr: 30000,
  agp_hover: true,
  agp_gem: false,
  agp_sticker: true,
  usevector: false,
  simplyinvent: false,
  hidedefaultprice: false,
  extprice: true,
  extmasslisting: false,
  extbgcolor: '#0000FF',
  exttextcolor: '#FFFFFF',
  userUrl: '//steamcommunity.com/my/',
  show_float_value: true,
  tradableinfo: false,
  show_trade_unlock_date_badge: true,
  show_inventory_rarity_color: true,
  show_phase_color: true,
  show_improved_inventory_nav: true,
  show_price_difference_warning: true,
  price_update_time: 120000,
  market_cache_time: 300000,
  new_interface: true,
  user_sort_market_inventory: [],
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
      $.getJSON(chrome.runtime.getURL('/assets/json/providers.json'), (data) => {
        PROVIDERS_LIST = data
        var actualCode = [
          `window.SIHID = '${chrome.runtime.id}';`,
          `window.PROVIDERS_LIST = ${JSON.stringify(PROVIDERS_LIST)}`,
          `window.CSGO_ORIGINS = ${JSON.stringify(CSGO_ORIGINS)}`,
          `window.priceUpdateTime = ${items.price_update_time}`,
          `window.marketCacheTime = ${items.market_cache_time}`,
          `window.SIHLang = ${JSON.stringify(langData)}`,
          `window.isNewInterface = ${items.new_interface}`,
          `window.sih_subscribe_ads = ${false}`,
        ];

        Object.keys(items).forEach((key) => {
          let prepValue;
          const value = items[key];
          if (typeof value === 'string') prepValue = `window.${key} = '${value}';`;
          else if (Array.isArray(value)) {
            if (key === 'user_sort_market_inventory') {
              prepValue = `window.user_sort_market = ${JSON.stringify(value)};`;
            } else {
              prepValue = `window.${key} = ${JSON.stringify(value)};`;
            }

          }
          else if (typeof value === 'object') prepValue = `window.${key} = ${JSON.stringify(value)};`;
          else prepValue = `window.${key} = ${value};`;

          actualCode.push(prepValue);
        });
        if (items.simplyinvent) {
          $('body').addClass('simple');
          if ($('.games_list_tabs').length > 1) {
            $('.games_list_tabs').each((index, element) => {
              if (index === 0) {
                $(element).prepend(`
              <a href="javascript:void(0)" class="sih-switcher_games-tabs">
                <svg className="eye" width="22" height="16" viewBox="0 0 22 16" fill="none"
                     xmlns="http://www.w3.org/2000/svg">
                  <path
                    d="M11 5C10.2044 5 9.44129 5.31607 8.87868 5.87868C8.31607 6.44129 8 7.20435 8 8C8 8.79565 8.31607 9.55871 8.87868 10.1213C9.44129 10.6839 10.2044 11 11 11C11.7956 11 12.5587 10.6839 13.1213 10.1213C13.6839 9.55871 14 8.79565 14 8C14 7.20435 13.6839 6.44129 13.1213 5.87868C12.5587 5.31607 11.7956 5 11 5ZM11 13C9.67392 13 8.40215 12.4732 7.46447 11.5355C6.52678 10.5979 6 9.32608 6 8C6 6.67392 6.52678 5.40215 7.46447 4.46447C8.40215 3.52678 9.67392 3 11 3C12.3261 3 13.5979 3.52678 14.5355 4.46447C15.4732 5.40215 16 6.67392 16 8C16 9.32608 15.4732 10.5979 14.5355 11.5355C13.5979 12.4732 12.3261 13 11 13ZM11 0.5C6 0.5 1.73 3.61 0 8C1.73 12.39 6 15.5 11 15.5C16 15.5 20.27 12.39 22 8C20.27 3.61 16 0.5 11 0.5Z"
                    fill="#9EA7B3"/>
                </svg>
              </a>
              `
                )
              }
              else {
                $(element).prepend(`
              <a href="javascript:void(0)" class="sih-switcher_games-tabs">
                <svg class="eye" width="22" height="19" viewBox="0 0 22 19" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M10.83 6L14 9.16C14 9.11 14 9.05 14 9C14 8.20435 13.6839 7.44129 13.1213 6.87868C12.5587 6.31607 11.7956 6 11 6C10.94 6 10.89 6 10.83 6ZM6.53 6.8L8.08 8.35C8.03 8.56 8 8.77 8 9C8 9.79565 8.31607 10.5587 8.87868 11.1213C9.44129 11.6839 10.2044 12 11 12C11.22 12 11.44 11.97 11.65 11.92L13.2 13.47C12.53 13.8 11.79 14 11 14C9.67392 14 8.40215 13.4732 7.46447 12.5355C6.52678 11.5979 6 10.3261 6 9C6 8.21 6.2 7.47 6.53 6.8ZM1 1.27L3.28 3.55L3.73 4C2.08 5.3 0.78 7 0 9C1.73 13.39 6 16.5 11 16.5C12.55 16.5 14.03 16.2 15.38 15.66L15.81 16.08L18.73 19L20 17.73L2.27 0L1 1.27ZM11 4C12.3261 4 13.5979 4.52678 14.5355 5.46447C15.4732 6.40215 16 7.67392 16 9C16 9.64 15.87 10.26 15.64 10.82L18.57 13.75C20.07 12.5 21.27 10.86 22 9C20.27 4.61 16 1.5 11 1.5C9.6 1.5 8.26 1.75 7 2.2L9.17 4.35C9.74 4.13 10.35 4 11 4Z" fill="#9EA7B3"/>
                </svg>
              </a>
              `);
              }
            });
          }

        }

        chrome.storage.local.get({
          bookmarks: []
        }, function (subitems) {
          var actualCodeLocal = [
            'window.bookmarkeditems = ' + (JSON.stringify(subitems.bookmarks)) + ';'
          ].join('\r\n');

          var scriptsub = document.createElement('script');
          scriptsub.textContent = actualCodeLocal;
          (document.head || document.documentElement).appendChild(scriptsub);
          scriptsub.parentNode.removeChild(scriptsub);
        });

        // modStyle({ extbgcolor: items.extbgcolor, exttextcolor: items.exttextcolor });
        var script = document.createElement('script');
        script.textContent = actualCode.join('\r\n');
        // script.textContent = actualCode;
        (document.head || document.documentElement).appendChild(script);
        script.parentNode.removeChild(script);


        var sProfilesInventory = document.createElement('script');
        sProfilesInventory.src = chrome.runtime.getURL('js/siteExt/profilesInventory.bundle.js');
        (document.head || document.documentElement).appendChild(sProfilesInventory);
        sProfilesInventory.onload = function () {

          var sCommon = document.createElement('script');
          sCommon.src = chrome.runtime.getURL('js/inventprice.script.js');
          (document.head || document.documentElement).appendChild(sCommon);
          sCommon.onload = function () {
            sCommon.parentNode.removeChild(sCommon);

            var sInventoryDialog = document.createElement('script');
            sInventoryDialog.src = chrome.runtime.getURL('js/inventory.dialog.js');
            (document.head || document.documentElement).appendChild(sInventoryDialog);
            sInventoryDialog.onload = function () {
              sInventoryDialog.parentNode.removeChild(sInventoryDialog);


              var sInventory = document.createElement('script');
              sInventory.src = chrome.runtime.getURL('js/inventory.js');
              (document.head || document.documentElement).appendChild(sInventory);
              sInventory.onload = function () {
                sInventory.parentNode.removeChild(sInventory);


              };
            };
          };

          sProfilesInventory.parentNode.removeChild(sProfilesInventory);
        };
      });
    });
  })
});
