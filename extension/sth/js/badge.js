var sGen = document.createElement('script');
sGen.src = chrome.runtime.getURL('js/lang/_gen.js');
(document.head || document.documentElement).appendChild(sGen);
sGen.onload = function () {
  sGen.parentNode.removeChild(sGen);
};

var sCacher = document.createElement('script');
sCacher.src = chrome.runtime.getURL('bundle/js/RequestCacher.js');
(document.head || document.documentElement).appendChild(sCacher);
sCacher.onload = function () {
  sCacher.parentNode.removeChild(sCacher);
};

var cssM = document.createElement('link');
cssM.href = window.location.protocol + '//steamcommunity-a.akamaihd.net/public/css/skin_1/economy_market.css';
cssM.rel = 'stylesheet';
cssM.type = 'text/css';
(document.head || document.documentElement).appendChild(cssM);

chrome.storage.sync.get({
  lang: ''
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
        `window.SIHLang = ${JSON.stringify(langData)}`,
      ].join('\r\n');

      var sData = document.createElement('script');
      sData.textContent = actualCode;
      (document.head || document.documentElement).appendChild(sData);
      sData.parentNode.removeChild(sData);
    });
  });
});

var sOffer = document.createElement('script');
sOffer.src = chrome.runtime.getURL('js/badge.script.js');
(document.head || document.documentElement).appendChild(sOffer);
sOffer.onload = function () {
  sOffer.parentNode.removeChild(sOffer);
};

var sModal = document.createElement('script');
sModal.src = `${window.location.protocol}//steamcommunity-a.akamaihd.net/public/javascript/modalv2.js?v=xM3yIvzXuMtB&amp;l=english`;
(document.head || document.documentElement).appendChild(sModal);
sModal.onload = function () {
  sModal.parentNode.removeChild(sModal);
};
