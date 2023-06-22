var cssSteamPowered = document.createElement('link');
cssSteamPowered.href = chrome.runtime.getURL('js/siteExt/steamPowered.css');
cssSteamPowered.rel = 'stylesheet';
cssSteamPowered.type = 'text/css';
(document.head || document.documentElement).prepend(cssSteamPowered);

chrome.storage.sync.get((itemsSync) => {
  chrome.storage.local.get((itemsLocal) => {
    const actualCode = [
      `window.SIHID = '${chrome.runtime.id}';`,
      `window.sih_app_account = ${itemsSync.sih_app_account};`
    ].join('\r\n');

    var sData = document.createElement('script');
    sData.textContent = actualCode;
    (document.head || document.documentElement).appendChild(sData);
    sData.parentNode.removeChild(sData);

    var sSteamPoweredBundle = document.createElement('script');
    sSteamPoweredBundle.src = chrome.runtime.getURL('js/siteExt/steamPowered.bundle.js');
    (document.head || document.documentElement).appendChild(sSteamPoweredBundle);
    sSteamPoweredBundle.onload = function () {
      sSteamPoweredBundle.parentNode.removeChild(sSteamPoweredBundle);
    }
  })
})

