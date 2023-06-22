var cssProfilesTradeOffers = document.createElement('link');
cssProfilesTradeOffers.href = chrome.runtime.getURL('js/siteExt/profilesTradeOffers.css');
cssProfilesTradeOffers.rel = 'stylesheet';
cssProfilesTradeOffers.type = 'text/css';
(document.head || document.documentElement).prepend(cssProfilesTradeOffers);


var priceUtils = document.createElement('script');
priceUtils.src = chrome.runtime.getURL('js/priceutils.script.js');
(document.head || document.documentElement).appendChild(priceUtils);
priceUtils.onload = function () {
  priceUtils.parentNode.removeChild(priceUtils);
};

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

var sJqueryUI = document.createElement('script');
sJqueryUI.src = chrome.runtime.getURL('js/jquery/jquery-ui.min.js');
(document.head || document.documentElement).appendChild(sJqueryUI);
sJqueryUI.onload = function () {
  sJqueryUI.parentNode.removeChild(sJqueryUI);
}

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

chrome.storage.sync.get({
  currency: '',
  quickaccept: false,
  quickacceptprompt: true,
  quickrefuse: false,
  quickrefuseprompt: true,
  qadelay: 10,
  qrdelay: 10,
  gpdelayscc: 3000,
  gpdelayerr: 30000,
  agp_hover: true,
  agp_gem: false,
  agp_sticker: true,
  lang: '',
  apikey: ''
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
      var actualCode = [
        `window.quickaccept = ${items.quickaccept};`,
        `window.quickacceptprompt = ${items.quickacceptprompt};`,
        `window.quickrefuse = ${items.quickrefuse};`,
        `window.quickrefuseprompt = ${items.quickrefuseprompt};`,
        `window.qadelay = ${items.qadelay};`,
        `window.qrdelay = ${items.qrdelay};`,
        `window.currency = '${items.currency}';`,
        `window.gpdelayscc = ${items.gpdelayscc};`,
        `window.gpdelayerr = ${items.gpdelayerr};`,
        `window.agp_gem = ${items.agp_gem};`,
        `window.agp_sticker = ${items.agp_sticker};`,
        `window.SIHID = '${chrome.runtime.id}';`,
        `window._apikey = '${items.apikey}';`,
        `window.SIHLang = ${JSON.stringify(langData)}`,
      ].join('\r\n');
      var scriptOpt = document.createElement('script');
      scriptOpt.textContent = actualCode;
      (document.head || document.documentElement).appendChild(scriptOpt);
      scriptOpt.onload = function () {
        scriptOpt.parentNode.removeChild(scriptOpt);
      }

      var sPriceQueue = document.createElement('script');
      sPriceQueue.src = chrome.runtime.getURL('js/PriceQueue.js');
      (document.head || document.documentElement).appendChild(sPriceQueue);
      sPriceQueue.onload = function () {
        var sProfilesTradeOffers = document.createElement('script');
        sProfilesTradeOffers.src = chrome.runtime.getURL('js/siteExt/profilesTradeOffers.bundle.js');
        (document.head || document.documentElement).appendChild(sProfilesTradeOffers);
        sProfilesTradeOffers.onload = function () {
          var sCommon = document.createElement('script');
          sCommon.src = chrome.runtime.getURL('js/hovermod.script.js');
          (document.head || document.documentElement).appendChild(sCommon);
          sCommon.onload = function () {
            var sOffer = document.createElement('script');
            sOffer.src = chrome.runtime.getURL('js/tradeofferrev.script.js');
            (document.head || document.documentElement).appendChild(sOffer);
            sOffer.onload = function () {
              sOffer.parentNode.removeChild(sOffer);
            };
            sCommon.parentNode.removeChild(sCommon);
          };

          sProfilesTradeOffers.parentNode.removeChild(sProfilesTradeOffers);
        }

        sPriceQueue.parentNode.removeChild(sPriceQueue);
      };
    });
  });
});

var cssF = document.createElement('link');
cssF.href = chrome.runtime.getURL('css/inventscript.css');
cssF.rel = 'stylesheet';
cssF.type = 'text/css';
(document.head || document.documentElement).appendChild(cssF);

cssF = document.createElement('link');
cssF.href = chrome.runtime.getURL('css/tradeoffer.css');
cssF.rel = 'stylesheet';
cssF.type = 'text/css';
(document.head || document.documentElement).appendChild(cssF);

