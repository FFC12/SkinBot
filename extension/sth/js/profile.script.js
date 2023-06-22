function ShowTradeOffer(tradeOfferID, rgParams) {
  var strParams = '';
  if (rgParams)
    strParams = '?' + $J.param(rgParams);

  var strKey = (tradeOfferID == 'new' ? 'NewTradeOffer' + rgParams['partner'] : 'TradeOffer' + tradeOfferID);

  var winHeight = 1120;
  if (Steam.BIsUserInSteamClient() && Steam.GetClientPackageVersion() < 1407800248) {
    // workaround for client break when the popup window is too tall for the screen.  Try and pick a height that will fit here.
    var nClientChromePX = 92;
    if (window.screen.availHeight && window.screen.availHeight - nClientChromePX < winHeight)
      winHeight = window.screen.availHeight - nClientChromePX;
  }

  var winOffer = window.open('https://steamcommunity.com/tradeoffer/' + tradeOfferID + '/' + strParams, strKey, 'height=' + winHeight + ',width=1328,resize=yes,scrollbars=yes');

  winOffer.focus();
}
