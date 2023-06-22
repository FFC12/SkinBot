// For pages where there are PriceQueue.js
const EXCLUDE_LOCATION_NAME = ['tradeoffer', 'tradeoffers', 'inventory', 'market'];

var cssSihGlobalHeader = document.createElement('link');
cssSihGlobalHeader.href = chrome.runtime.getURL('js/siteExt/sihGlobalHeader.css');
cssSihGlobalHeader.rel = 'stylesheet';
cssSihGlobalHeader.type = 'text/css';
(document.head || document.documentElement).prepend(cssSihGlobalHeader);

var cssManrope = document.createElement('link');
cssManrope.href = chrome.runtime.getURL('css/fonts/manrope.css');
cssManrope.rel = 'stylesheet';
cssManrope.type = 'text/css';
(document.head || document.documentElement).prepend(cssManrope);

var cssRoboto = document.createElement('link');
cssRoboto.href = chrome.runtime.getURL('css/fonts/roboto.css');
cssRoboto.rel = 'stylesheet';
cssRoboto.type = 'text/css';
(document.head || document.documentElement).prepend(cssRoboto);

chrome.storage.sync.get((itemsSync) => {
  chrome.storage.local.get((itemsLocal) => {
    const actualCode = [
      `window.SIHID = '${chrome.runtime.id}';`,
      `window.sih_app_account = ${itemsSync.sih_app_account};`,
      `window.steamCurrency = ${JSON.stringify(itemsSync.steamCurrency)};`
    ].join('\r\n');

    var sData = document.createElement('script');
    sData.textContent = actualCode;
    (document.head || document.documentElement).appendChild(sData);
    sData.parentNode.removeChild(sData);

    let isInclude = false;

    EXCLUDE_LOCATION_NAME.forEach((locationName) => {
      if (window.location.href.includes(locationName)) {
        isInclude = true;
      }
    })

    if (!isInclude) {
      var sPriceQueue = document.createElement('script');
      sPriceQueue.src = chrome.runtime.getURL('js/PriceQueue.js');
      (document.head || document.documentElement).appendChild(sPriceQueue);
      sPriceQueue.onload = function () {
        sPriceQueue.parentNode.removeChild(sPriceQueue);
      }
    }


    var sSihGlobalHeaderBundle = document.createElement('script');
    sSihGlobalHeaderBundle.src = chrome.runtime.getURL('js/siteExt/sihGlobalHeader.bundle.js');
    (document.head || document.documentElement).appendChild(sSihGlobalHeaderBundle);
    sSihGlobalHeaderBundle.onload = function () {

      var sSihGlobalHeader = document.createElement('script');
      sSihGlobalHeader.src = chrome.runtime.getURL('js/sih_global_header.script.js');
      (document.head || document.documentElement).appendChild(sSihGlobalHeader);
      sSihGlobalHeader.onload = function () {
        sSihGlobalHeader.parentNode.removeChild(sSihGlobalHeader);
      };

      sSihGlobalHeaderBundle.parentNode.removeChild(sSihGlobalHeaderBundle);
    }

  })
})


