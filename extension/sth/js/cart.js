var cssCartPage = document.createElement('link');
cssCartPage.href = chrome.runtime.getURL('js/siteExt/cartPage.css');
cssCartPage.rel = 'stylesheet';
cssCartPage.type = 'text/css';
(document.head || document.documentElement).prepend(cssCartPage);


var sJqueryUI = document.createElement('script');
sJqueryUI.src = chrome.runtime.getURL('js/jquery/jquery-ui.min.js');
(document.head || document.documentElement).appendChild(sJqueryUI);
sJqueryUI.onload = function () {

  var sCartBundle = document.createElement('script');
  sCartBundle.src = chrome.runtime.getURL('js/siteExt/cartPage.bundle.js');
  (document.head || document.documentElement).appendChild(sCartBundle);
  sCartBundle.onload = function () {

    var sOffer = document.createElement('script');
    sOffer.src = chrome.runtime.getURL('js/cart.script.js');
    (document.head || document.documentElement).appendChild(sOffer);
    sOffer.onload = function () {
      sOffer.parentNode.removeChild(sOffer);
    };

    sCartBundle.parentNode.removeChild(sCartBundle);
  }


  sJqueryUI.parentNode.removeChild(sJqueryUI);
}
