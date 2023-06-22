var sProfilePage = document.createElement('script');
sProfilePage.src = chrome.runtime.getURL('js/profile.script.js');
(document.head || document.documentElement).appendChild(sProfilePage);
sProfilePage.onload = function () {
  sProfilePage.parentNode.removeChild(sProfilePage);
};

