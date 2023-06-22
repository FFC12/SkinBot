var itemRegExp = /BuildHover.*;/i;

var _tradesTimers = {};
var _openedWins = {};
// Включение/отключение расширения СИХА
var COOKIE_ENABLED_SIH = 'enableSIH';
var IS_ENABLED_SIH = GetCookie(COOKIE_ENABLED_SIH);
IS_ENABLED_SIH = IS_ENABLED_SIH === null || IS_ENABLED_SIH === 'true';
// Включение/отключение расширения СИХА
SIH?.panelMode?.loadHtml(IS_ENABLED_SIH);


$J(function () {


  if (IS_ENABLED_SIH) {
    var warningMsg = $J('<div class="warning_message text text_tiny" style="color: red; z-index: 0">Warning! This is an empty trade offer, you will not receive anything after accepted.<br /> <a href="https://support.steampowered.com/kb_article.php?ref=2178-QGJV-0708#whatoffer" target="_blank">Steam wallet funds can not be included in trade, or trade offer.</a></div>');
    warningMsg.click(function (e) {
      e.stopPropagation();
    });
    var emptyTradeOffers = $J('.tradeoffer_items.primary .tradeoffer_item_list:not(:has(.trade_item ))');
    emptyTradeOffers.append(warningMsg);
    emptyTradeOffers.parents('.tradeoffer_items_ctn').find('.link_overlay').css('top', '110px');
  }


  $J('.refuse_trade').click(function () {
    if ($J(this).prop('disabled')) return false;
    var idTrade = $J(this).parents('.tradeoffer').prop('id').substr(13);
    if (_tradesTimers[idTrade]) {
      window.clearInterval(_tradesTimers[idTrade].timer);
      _tradesTimers[idTrade] = null;
      $J(this).html('Quick refuse');
      return false;
    }
    if (window.quickrefuseprompt && !confirm('Are you sure?')) {
      return false;
    }
    if (window.qrdelay) {
      _tradesTimers[idTrade] = {
        timer: window.setInterval('TradeRefuseTimerTick(' + idTrade + ')', 1000),
        remain: window.qrdelay
      };
      $J(this).html('Cancel (' + (window.qrdelay < 10 ? '0' : '') + window.qrdelay + ')');
    } else if (window.qrdelay == 0) {
      var link = $J(this);
      link.html('Refusing...');
      link.prop('disabled', true);
      RefuseTradeOffer(idTrade);
    }
    return false;
  });

  $J(function () {
    $J(window).on('message', function (event) {
      var origin = event.originalEvent.origin;
      var data = event.originalEvent.data;
      if (origin && data &&
        ('http://steamcommunity.com/'.indexOf(origin) == 0 || 'https://steamcommunity.com/'.indexOf(origin) == 0)) {
        if (data.type == 'accepted' || data.type == 'await_confirm' && _openedWins[data.tradeofferid]) {
          _openedWins[data.tradeofferid].close();
        }
      }
    });
  });

  var category = $J('.right_controls_large_block_active_bg').parent();
  if (category.length && window._apikey !== '') {
    $J.ajax({
      url: 'https://api.steampowered.com/IEconService/GetTradeOffers/v1/',
      data: {get_sent_offers: 1, get_received_offers: 1, key: window._apikey}
    }).done(function (result) {
      var sentCounters = {}, receivedCounters = {};

      $J.each((result.response.trade_offers_sent || []), function (i, row) {
        if (sentCounters[row.accountid_other]) {
          sentCounters[row.accountid_other].count++;
        } else {
          sentCounters[row.accountid_other] = {count: 1};
        }
      });
      $J.each((result.response.trade_offers_received || []), function (i, row) {
        if (receivedCounters[row.accountid_other]) {
          receivedCounters[row.accountid_other].count++;
        } else {
          receivedCounters[row.accountid_other] = {count: 1};
        }
      });

      $J('.tradeoffer').each(function (i, el) {
        var tradeId = el.getAttribute('id').split('_')[1], primary = '', secondary = '';
        var primaryProfileId = $J(el).find('.tradeoffer_items.primary .tradeoffer_avatar').data('miniprofile');
        var secondaryProfileId = $J(el).find('.tradeoffer_items.secondary .tradeoffer_avatar').data('miniprofile');

        if (sentCounters[secondaryProfileId] !== undefined && receivedCounters[secondaryProfileId] !== undefined) {
          primary = 'Sent: ' + sentCounters[secondaryProfileId].count;
          secondary = 'Received: ' + receivedCounters[secondaryProfileId].count;
        }
        if (receivedCounters[primaryProfileId] !== undefined && sentCounters[primaryProfileId] !== undefined) {
          secondary = 'Sent: ' + sentCounters[primaryProfileId].count;
          primary = 'Received: ' + receivedCounters[primaryProfileId].count;
        }

        $J('#tradeofferid_' + tradeId + ' .tradeoffer_items.primary .tradeoffer_items_header').append('<div class="label">' + primary + '</div>');
        $J('#tradeofferid_' + tradeId + ' .tradeoffer_items.secondary .tradeoffer_items_header').append('<div class="label">' + secondary + '</div>');
      });
    });
  }

  if (IS_ENABLED_SIH) {
    const data =  SIH?.common?.GetDataFromLocalStorage();
    if (data && data.mode && data.mode === 'lite') {
      // SIH?.filter?.load();
      SIH?.tradeofferLite?.load();
      SIH?.itemsRule?.load();
      SIH?.items?.load();
      SIH?.footer?.load();
      SIH?.common?.removeDeclinedOfferFromSihWindow();
      SIH?.common?.sendTradeLinkToBackground();
    }
    else {
      SIH?.filter?.load();
      SIH?.tradeoffer?.load();
      SIH?.items?.load();
      SIH?.lots?.load();
      SIH?.itemsRule?.load();
      SIH?.footer?.load();
      SIH?.common?.sendTradeofferTxtToBackground();
      SIH?.common?.removeDeclinedOfferFromSihWindow();
      SIH?.common?.sendTradeLinkToBackground();
    }

  }

});

var regRpLink = /javascript:ReportTradeScam\( '(\d+)',/;

