var cssAddfunds = document.createElement('link');
cssAddfunds.href = chrome.runtime.getURL('js/siteExt/addfunds.css');
cssAddfunds.rel = 'stylesheet';
cssAddfunds.type = 'text/css';
(document.head || document.documentElement).prepend(cssAddfunds);

var cssJqueryUI = document.createElement('link');
cssJqueryUI.href = chrome.runtime.getURL('css/jquery-ui.css');
cssJqueryUI.rel = 'stylesheet';
cssJqueryUI.type = 'text/css';
(document.head || document.documentElement).appendChild(cssJqueryUI);


var actualCode = [
  `window.SIHID = '${chrome.runtime.id}';`,
];

var script = document.createElement('script');
script.textContent = actualCode.join('\r\n');
(document.head || document.documentElement).appendChild(script);
script.parentNode.removeChild(script);

var sJqueryUI = document.createElement('script');
sJqueryUI.src = chrome.runtime.getURL('js/jquery/jquery-ui.min.js');
(document.head || document.documentElement).appendChild(sJqueryUI);
sJqueryUI.onload = function () {

  var sAddfundsBundle = document.createElement('script');
  sAddfundsBundle.src = chrome.runtime.getURL('js/siteExt/addfunds.bundle.js');
  (document.head || document.documentElement).appendChild(sAddfundsBundle);
  sAddfundsBundle.onload = function () {

    var sAddfunds = document.createElement('script');
    sAddfunds.src = chrome.runtime.getURL('js/addfunds.script.js');
    (document.head || document.documentElement).appendChild(sAddfunds);
    sAddfunds.onload = function () {

      sAddfunds.parentNode.removeChild(sAddfunds);
    };

    sAddfundsBundle.parentNode.removeChild(sAddfundsBundle);
  }
  sJqueryUI.parentNode.removeChild(sJqueryUI);
};


