var cssInvitesPage = document.createElement('link');
cssInvitesPage.href = chrome.runtime.getURL('js/siteExt/invitesPage.css');
cssInvitesPage.rel = 'stylesheet';
cssInvitesPage.type = 'text/css';
(document.head || document.documentElement).prepend(cssInvitesPage);

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

var sJqueryUI = document.createElement('script');
sJqueryUI.src = chrome.runtime.getURL('js/jquery/jquery-ui.min.js');
(document.head || document.documentElement).appendChild(sJqueryUI);
sJqueryUI.onload = function () {

  var sInvitesBundle = document.createElement('script');
  sInvitesBundle.src = chrome.runtime.getURL('js/siteExt/invitesPage.bundle.js');
  (document.head || document.documentElement).appendChild(sInvitesBundle);
  sInvitesBundle.onload = function () {

    var sOffer = document.createElement('script');
    sOffer.src = chrome.runtime.getURL('js/invites.script.js');
    (document.head || document.documentElement).appendChild(sOffer);
    sOffer.onload = function () {
      sOffer.parentNode.removeChild(sOffer);
    };

    sInvitesBundle.parentNode.removeChild(sInvitesBundle);
  }


  sJqueryUI.parentNode.removeChild(sJqueryUI);
}
