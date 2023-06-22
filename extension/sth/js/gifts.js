var sGen = document.createElement('script');
sGen.src = chrome.runtime.getURL('js/lang/_gen.js');
(document.head || document.documentElement).appendChild(sGen);
sGen.onload = function () {
  sGen.parentNode.removeChild(sGen);
};

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

var script = document.createElement('script');
script.textContent = `window.SIHID = '${chrome.runtime.id}'`;
(document.head || document.documentElement).appendChild(script);
script.parentNode.removeChild(script);

var sOffer = document.createElement('script');
sOffer.src = chrome.runtime.getURL('js/gifts.script.js');
(document.head || document.documentElement).appendChild(sOffer);
sOffer.onload = function () {
  sOffer.parentNode.removeChild(sOffer);
};
