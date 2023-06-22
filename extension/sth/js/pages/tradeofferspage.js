/* global chrome */
var steamOfferExp = /<div class="link_overlay" onclick="ShowTradeOffer\( '(\d+)' \);"><\/div>[\s\S]+?<img src="(.+)">[\s\S]+?">([\s\S]+?)[：:]/g;
var imgExp = /<img src="http:\/\/steamcommunity-a.akamaihd.net\/economy\/image\/[^"]+(\d{2})f".+>/g;
var userUrlExp = /<a href="https:\/\/steamcommunity.com\/.+?\/.+?\/">/;
var sessionIDJSExp = /g_sessionID = \"(.+)\";/;
var sessionID = '';
var _tradesTimers = {};
var _openedWins = {};

const SIH_REFERRER_KEY_NAME = 'sih_referrer';
const SIH_REFERRER_IFRAME_ID = 'sih-referrer-iframe';
const UNKNOWN_REFERRER = 'unknown';

chrome.storage.sync.get({
  quickaccept: false,
  quickacceptprompt: true,
  quickrefuse: false,
  quickrefuseprompt: true,
  offertotalprice: false,
  qadelay: 10,
  qrdelay: 10,
  currency: '',
  userUrl: null,
  lang: '',
  apikey: '',
  sih_app_account: false,
}, function (items) {
  window.quickaccept = items.quickaccept;
  window.quickacceptprompt = items.quickacceptprompt;
  window.quickrefuse = items.quickrefuse;
  window.quickrefuseprompt = items.quickrefuseprompt;
  window.offertotalprice = items.offertotalprice;
  window.qadelay = items.qadelay;
  window.qrdelay = items.qrdelay;
  window.currencyId = items.currency !== '' ? items.currency : 1;
  window.userUrl = items.userUrl + (items.userUrl[items.userUrl.length - 1] === '/' ? '' : '/');
  window._apikey = items.apikey;
  window.userLanguage = items.lang;
  window.sih_app_account = items.sih_app_account;

  $(function () {
    if (_apikey === '' && (userUrl === null || userUrl === '//steamcommunity.com/my/')) {
      $.ajax({
        method: 'get',
        url: 'https://steamcommunity.com/my/'
      }).done(function (response) {
        if ($(response).find('.login_bottom_row_item').length) {
          userSignedOut();
        } else {
          var userUrl = userUrlExp.exec(response)[0].split('"')[1];
          chrome.storage.sync.set({ userUrl: userUrl.split(':')[1] });
          getTrades(userUrl.split(':')[1]);
        }
      });
    } else {
      getTrades(userUrl);
    }
    chrome.browserAction.setPopup({ popup: 'html/tradeoffers.html' });
    chrome.runtime.sendMessage(chrome.runtime.id, {type: 'BACKGROUND_LOGIN_SIH_APP'}, (cb) => {});

    if (!sih_app_account) {
      chrome.storage.sync.set({sih_app_account: true});
    }


  });
});

const getRandomItem = (arr = []) => (
  arr.length
    ? arr[Math.round(Math.random() * 100) % arr.length]
    : null
);

$(document).ready(function () {
  // TODO: BANNER FOR WINDOW
  // const partner = 'tradeit';
  const place = 'mto';

  setTimeout(function () {
    // Get banner
    // TODO: BANNER FOR WINDOW
    // chrome.runtime.sendMessage(chrome.runtime.id, { type: 'GetBanner', data: { place, partner } }, (res) => {
    //
    //   if (res.success) {
    //     const banner = res.data;
    //     $('.sponsor-link a').prop('href', banner.href);
    //     $('#mto-banner').prop('href', banner.href);
    //     $('#mto-banner img').attr('src', banner.img);
    //
    //     $('.sponsor img').delay(500).fadeIn(500);
    //     chrome.runtime.sendMessage(chrome.runtime.id, {
    //       type: "AD_HIT_STORE",
    //       data: { adLocation: place, action: 'show', adId: 3, partner }
    //     });
    //   }
    // });
    // $('.sponsor').click(function () {
    //   chrome.runtime.sendMessage(chrome.runtime.id, {
    //     type: "AD_HIT_STORE",
    //     data: { adLocation: place, action: 'click', adId: 3, partner }
    //   });
    // });
    registerSIHInstallationReferrer();
  }, 10);
});

var lastleft = 0, lasttop = 0;
var nofSteam = function (idOffer, img, name) {
  name = name.trim();
  name = name.replace(/<span.+?>/g, '').replace(/<\/span>/g, '');
  var path = img.replace('.jpg', '_medium.jpg');// chrome.runtime.getURL("/icon64.png");
  var div = $('<div class="tradeoffer" data-id="' + idOffer + '">');
  var link = $('<a href="https://steamcommunity.com/tradeoffer/' + idOffer + '/" target="_blank"><img src="' + path + '"></a>');
  var declineLink = $('<a class="decline-bt" href="#" >' + i18next.t('tradeoffers.decline') + '</a>');
  var acceptLink = $('<a class="accept-bt" href="#" >' + i18next.t('tradeoffers.quickaccept') + '</a>');
  var refuseLink = $('<a class="refuse-bt" href="#" >' + i18next.t('tradeoffers.quickrefuse') + '</a>');

  $(div).append('<div style="clear:both; float:none">' + name + '</div>');
  $(div).append(link);
  $(div).append('<div class="offer-theirs"></div><div>for</div><div class="offer-yours"></div><div class="clearer">&nbsp;</div>');
  $(div).append(declineLink);

  if (quickaccept) {
    $(div).append(acceptLink);
    acceptLink.click(function (e) {
      e.preventDefault();
      e.stopPropagation();

      if (_tradesTimers[idOffer]) {
        window.clearInterval(_tradesTimers[idOffer].timer);
        _tradesTimers[idOffer] = null;
        $(this).html(i18next.t('tradeoffers.quickaccept'));
        return false;
      }

      if (window.quickacceptprompt && !confirm(i18next.t('tradeoffers.confirmation'))) {
        return false;
      }

      if (window.qadelay) {
        _tradesTimers[idOffer] = {
          timer: window.setInterval(function () {
            TradeAcceptTimerTick(idOffer);
          }, 1000),
          remain: window.qadelay
        };
        $(this).html(i18next.t('tradeoffers.cancel') + ' (' + (window.qadelay < 10 ? '0' : '') + window.qadelay + ')');
      } else if (window.qadelay == 0) {
        var link = $J(this);
        link.html('Accepting...');
        link.prop('disabled', true);
        AcceptTradeOffer(idOffer);
      }
    });
  }

  if (quickrefuse) {
    $(div).append(refuseLink);
    refuseLink.click(function (e) {
      e.preventDefault();
      e.stopPropagation();

      if (_tradesTimers[idOffer]) {
        window.clearInterval(_tradesTimers[idOffer].timer);
        _tradesTimers[idOffer] = null;
        $(this).html(i18next.t('tradeoffers.quickrefuse'));
        return false;
      }

      if (window.quickrefuseprompt && !confirm(i18next.t('tradeoffers.confirmation'))) {
        return false;
      }

      if (window.qrdelay) {
        _tradesTimers[idOffer] = {
          timer: window.setInterval(function () {
            TradeRefuseTimerTick(idOffer);
          }, 1000),
          remain: window.qrdelay
        };
        $(this).html(i18next.t('tradeoffers.cancel') + ' (' + (window.qrdelay < 10 ? '0' : '') + window.qrdelay + ')');
      } else if (window.qrdelay == 0) {
        var link = $J(this);
        link.html('Refusing...');
        link.prop('disabled', true);
        RefuseTradeOffer(idOffer);
      }
    });
  }

  $(div).append('<div class="clearer">&nbsp;</div>');
  $('#Div_Offers').append(div);
  $(declineLink).click(function (event) {
    DeclineTradeOffer(idOffer, sessionID);
    event.stopPropagation();
    return false;
  });
  $(div).click(function (e) {
    chrome.windows.create({
      'url': 'https://steamcommunity.com/tradeoffer/' + idOffer + '/',
      'type': 'popup',
      'left': lastleft,
      'top': lasttop
    }, function (window) {
    });
    lastleft += 10;
    lasttop += 10;
    e.preventDefault();
  });
  return div;
};

var TradeAcceptTimerTick = function (IdTradeOffer) {
  if (!_tradesTimers[IdTradeOffer]) return;

  var remain = _tradesTimers[IdTradeOffer].remain;
  var link = $('.tradeoffer[data-id="' + IdTradeOffer + '"]').find('.accept-bt');

  if (remain == 0) {
    link.html('Accepting...');
    link.prop('disabled', true);
    window.clearInterval(_tradesTimers[IdTradeOffer].timer);
    AcceptTradeOffer(IdTradeOffer);
  } else {
    remain--;
    _tradesTimers[IdTradeOffer].remain = remain;
    link.html(i18next.t('tradeoffers.cancel') + ' (' + (remain < 10 ? '0' : '') + remain + ')');
  }
};

var TradeRefuseTimerTick = function (IdTradeOffer) {
  if (!_tradesTimers[IdTradeOffer]) return;

  var remain = _tradesTimers[IdTradeOffer].remain;
  var link = $('.tradeoffer[data-id="' + IdTradeOffer + '"]').find('.refuse-bt');

  if (remain == 0) {
    link.html('Refusing...');
    link.prop('disabled', true);
    window.clearInterval(_tradesTimers[IdTradeOffer].timer);
    RefuseTradeOffer(IdTradeOffer);
  } else {
    remain--;
    _tradesTimers[IdTradeOffer].remain = remain;
    link.html(i18next.t('tradeoffers.cancel') + ' (' + (remain < 10 ? '0' : '') + remain + ')');
  }
};

var AcceptTradeOffer = function (IdTradeOffer) {
  window.open('https://steamcommunity.com/tradeoffer/' + IdTradeOffer + '/?sihaccept=' + sessionID, 'HiddenTradeOffer' + IdTradeOffer, 'height=10,width=10,resize=yes,scrollbars=yes');
  return;
};

var RefuseTradeOffer = function (IdTradeOffer) {
  window.open('https://steamcommunity.com/tradeoffer/' + IdTradeOffer + '/?sihrefuse=' + sessionID, 'HiddenTradeOffer' + IdTradeOffer, 'height=10,width=10,resize=yes,scrollbars=yes');
  return;
};

var DeclineTradeOffer = function (tradeOfferID, g_sessionID) {
  var strAction = 'decline';
  var request;
  if (window._apikey.length) {
    request = $.ajax({
      method: 'POST',
      url: 'https://api.steampowered.com/IEconService/DeclineTradeOffer/v1/',
      data: {
        tradeofferid: tradeOfferID,
        key: window._apikey || apiKey
      }
    });
  } else {
    request = $.ajax({
      url: 'https://steamcommunity.com/tradeoffer/' + tradeOfferID + '/' + strAction,
      data: { sessionid: g_sessionID },
      type: 'POST',
      crossDomain: true,
      xhrFields: { withCredentials: true }
    });
  }
  request.done(function (data) {
    $('[data-id=' + tradeOfferID + ']').remove();
    var num = $('.tradeoffer[data-id]').length;
    if (num) {
      $('#countoffers #title').text(i18next.t('tradeoffers.countoffers', { NUMBERS: "" + num }));
    } else {
      $('#countoffers').text(i18next.t('tradeoffers.nooffers'));
    }
    chrome.browserAction.setBadgeText({ text: num ? '' + num : '' });
  }).fail(function (err) {
    console.log(err);
  });
};

var openAll = function () {
  lastleft = 0;
  lasttop = 0;

  $('.tradeoffer[data-id]').each(function () {
    var idoffer = $(this).data('id');
    chrome.windows.create({
      'url': `https://steamcommunity.com/tradeoffer/${idoffer}/`,
      'type': 'popup'
    });
  });
};

var declineAll = function () {
  $('.tradeoffer[data-id]').each(function () {
    var idoffer = $(this).data('id');
    DeclineTradeOffer(idoffer, sessionID);
  });
};

function getTrades(userUrl) {
  //TODO: MAKE FOR APIKEY
  // if (window._apikey.length) {
    // console.log('We have API key');
    // getTradesByAPI();
  // } else {
    // console.log('We haven\'t API key');
    getTradesByParsing(userUrl);
  // }
}

function userSignedOut() {
  $('#Div_Offers').html('').append(i18next.t('tradeoffers.signedout'));
  // Clear badge text of the extension when user signed out
  chrome.browserAction.setBadgeText({ text: '' });
}

function getTradesByParsing(userUrl) {

  var offersDivBlock = $('#Div_Offers').html('');
  var tradeURL = 'http:' + userUrl + 'tradeoffers/';
  $.ajax({
    method: "GET",
    url: tradeURL,
    cache: false
  }).done(function (response, textStatus, jqXHR) {
    // Если отправляем запрос по https, то ничего не возвращается в ответе, если пользователь незалогинен, только статус 429.
    // Запрос по http будет перенаправлен на страницу логина, если пользователь незалогинен
    if ($(response).find('.login_bottom_row_item').length) {
      userSignedOut();
    } else {
      chrome.runtime.sendMessage(window.SIHID, {type: 'BACKGROUND_TRADEOFFER_THROUGH_PARSING', data: {endPoint: null, txtResponse: null}})
    }
  }).error(function (response) {
    var errorMessage = '';
    var msg = '';
    if (response.status === 429 && response.responseText === '') {
      userSignedOut();
    } else if (response.status === 429 && response.responseText) {
      var fatal = $(response.responseText).find('.profile_fatalerror');
      if (fatal.length) {
        msg = fatal.find('.profile_fatalerror_message').detach();
        fatal.find('.profile_fatalerror_links').remove();
        msg.find('button').click(function () {
          var captcha_entry = msg.find('#captcha_entry').val()
          $.ajax({
            method: 'POST',
            url: tradeURL,
            data: {
              captcha_entry: captcha_entry
            }
          }).done(function () {
            console.log('sended');
          });
        })
        // errorMessage = fatal;
        // fatal.find('[class^=profile_fatalerror]').remove();
        errorMessage = fatal.text().replace(/\s{2,100}/g, ' ').trim() + '<br/>';
        offersDivBlock.append(errorMessage).append(msg);
      } else {
        errorMessage = 'Oops. We are sorry, but something went wrong';
        offersDivBlock.append('Steam: ' + errorMessage + '<br /><a href="' + tradeURL + '" target="_blank">Please, check your trade offers page.</a>');
      }
    } else {
      errorMessage = 'Oops. We are sorry, but something went wrong';
      offersDivBlock.append('Steam: ' + errorMessage + '<br /><a href="' + tradeURL + '" target="_blank">Please, check your trade offers page.</a>');
    }
  });
}

function getTradesByAPI() {
  var offersDivBlock = $('#Div_Offers').html('');
  $.ajax({
    url: 'https://api.steampowered.com/IEconService/GetTradeOffers/v1/',
    data: {
      get_descriptions: 1,
      active_only: 1,
      get_received_offers: 1,
      key: window._apikey || apiKey
    }
  }).done(function (data) {
    var response = data.response;
    var active_offers = [];
    if (response && response.hasOwnProperty('trade_offers_received') && response.trade_offers_received.length) {
      var offers = response.trade_offers_received;
      var descriptions = response.descriptions;
      active_offers = offers.filter(function (offer) {
        return offer.trade_offer_state == g_tradeOfferState.Active;
      });
      active_offers.forEach(function (offer) {
        $.ajax({
          method: 'GET',
          url: 'https://steamcommunity.com/profiles/' + getSteamId(offer.accountid_other) + '/',
          dataType: 'xml',
          data: {
            xml: 1
          }
        }).done(function (response) {
          var name = $(response).find('profile > steamID')[0];
          var avatar = $(response).find('profile > avatarIcon')[0];
          var tradeofferdiv;
          if (name !== undefined && avatar !== undefined) {
            var header = i18next.t('tradeoffers.offerfrom', { USERNAME: name.textContent }) + (offer.message.length ? ': ' + offer.message : '');
            tradeofferdiv = nofSteam(offer.tradeofferid, avatar.textContent, header);
          } else {
            tradeofferdiv = nofSteam(offer.tradeofferid, chrome.runtime.getURL("assets/icon128.png"), 'You have offer');
          }

          var imgTheirs = [];  // items_to_give
          if (offer.hasOwnProperty('items_to_give')) {
            offer.items_to_give.forEach(function (offerItem) {
              var img = document.createElement('img');
              descriptions.forEach(function (desc) {
                if (desc.classid == offerItem.classid && desc.instanceid == offerItem.instanceid) {
                  img.src = 'https://steamcommunity-a.akamaihd.net/economy/image/' + desc.icon_url + '/48fx48f'
                }
              });
              imgTheirs.push(img);
            });
          }

          var imgYours = [];  // items_to_receive
          if (offer.hasOwnProperty('items_to_receive')) {
            offer.items_to_receive.forEach(function (offerItem) {
              var img = document.createElement('img');
              descriptions.forEach(function (desc) {
                if (desc.classid == offerItem.classid && desc.instanceid == offerItem.instanceid) {
                  img.src = 'https://steamcommunity-a.akamaihd.net/economy/image/' + desc.icon_url + '/32fx32f'
                }
              });
              imgYours.push(img);
            });
          }

          tradeofferdiv.addClass('offer-' + offer.tradeofferid);
          tradeofferdiv.find('.offer-theirs').append(imgTheirs);
          tradeofferdiv.find('.offer-yours').append(imgYours);
          offersDivBlock.append(tradeofferdiv);

          if (window.offertotalprice) {
            getTradeCost(offer.tradeofferid);
          }
        }).fail(function () {
          console.log('Cant get Steam profile');
        });
      });

      if (active_offers.length) {
        offersDivBlock.prepend('<div style="margin-bottom:20px;" id="countoffers"><span id="title">' + i18next.t('tradeoffers.countoffers', { NUMBERS: "" + active_offers.length }) + '</span><br /> <a href="#" id="lnk_openall">' + i18next.t('tradeoffers.openall') + '</a> <a href="#" id="lnk_declineall">' + i18next.t('tradeoffers.declineall') + '</a> </div>');
        $('#lnk_openall').click(function () {
          openAll();
          return false;
        });
        $('#lnk_declineall').click(function () {
          if (confirm('Are you sure?')) {
            declineAll();
          }
          return false;
        });
      } else {
        offersDivBlock.prepend('<div style="margin-bottom:20px;">' + i18next.t('tradeoffers.nooffers') + '</div>');
      }
    } else {
      offersDivBlock.prepend('<div style="margin-bottom:20px;">' + i18next.t('tradeoffers.nooffers') + '</div>');
    }
    chrome.browserAction.setBadgeText({ text: active_offers.length ? '' + active_offers.length : '' });
  }).fail(function (result) {
    offersDivBlock.append('Oops. We are sorry, but something went wrong (Steam Web API).');
  });
}

function getTradeCost(offerId) {
  $.ajax({
    method: 'GET',
    url: 'https://api.steampowered.com/IEconService/GetTradeOffer/v1/',
    data: {
      key: window._apikey,
      get_descriptions: 1,
      tradeofferid: offerId,
    },
    success: function (response) {
      var descriptions = response.response.descriptions;
      var itemsToReceive = collectItems(response.response.offer.items_to_receive || [], descriptions);
      var itemsToGive = collectItems(response.response.offer.items_to_give || [], descriptions);
      var receivePrice = 0, givePrice = 0;

      if (itemsToReceive.length) {
        $('.offer-' + offerId + ' div:first').append('<span class="offer-price">' + i18next.t('tradeoffers.theirprice') + ': <span class="price-theirs-' + offerId + '"></span></span>');
      }
      if (itemsToGive.length) {
        $('.offer-' + offerId + ' div:first').append('<span class="offer-price">' + i18next.t('tradeoffers.yourprice') + ': <span class="price-yours-' + offerId + '"></span></span>');
      }

      for (var i in descriptions) {
        if (descriptions[i].appid === undefined) return true;

        var item = descriptions[i];
        var id = [item.appid, item.classid, item.instanceid].join('_');
        var itemLink = 'https://steamcommunity.com/market/priceoverview/?appid=' + item.appid
          + '&country=US&currency=1'
          + '&market_hash_name=' + encodeURIComponent(item.market_hash_name);
        PriceQueue.GetPrice({
          method: 'GET',
          url: itemLink,
          success: function (response) {
            if (response.success && response.lowest_price) {
              var price = getNumber(response.lowest_price);
              // Это hotfix. Может неправильно считаться сумма если в "его" и "твоих" списках на обмен будут одиннаковые предметы
              // TODO: Надо будет переделать функцию на classid и instanceid
              if (itemsToReceive.indexOf(response.hashName) !== -1) {
                receivePrice += parseFloat(price);
                $('.price-theirs-' + offerId).text(v_currencyformat(receivePrice, 'USD'));
              }
              if (itemsToGive.indexOf(response.hashName) !== -1) {
                givePrice += parseFloat(price);
                $('.price-yours-' + offerId).text(v_currencyformat(givePrice, 'USD'));
              }
            }
          },
          error: function () {
          }
        });
      }
    },
    error: function () {
    }
  });
}

function collectItems(elements, description) {
  var data = elements.map((elem) => {
    const elemDesc = description.find(desc => desc.classid == elem.classid && desc.instanceid == elem.instanceid);
    return elemDesc.market_hash_name;
  });
  return data;
}

async function registerSIHInstallationReferrer() {
  const iframe = document.getElementById(SIH_REFERRER_IFRAME_ID)

  if (!iframe) {
    console.log(`Referrer tracking iframe "${SIH_REFERRER_IFRAME_ID}" not found`)
    return
  } else {
    const bus = new IframeMessageBus(iframe)

    const referrers = await bus.get(SIH_REFERRER_KEY_NAME) || [UNKNOWN_REFERRER]

    if (referrers.length) {
      chrome.runtime.sendMessage(chrome.runtime.id, { type: 'REGISTER_SIH_REFERRER', data: referrers }, (res) => {});
    }
  }
}

class IframeMessageBus {
  constructor (iframe) {
    this.iframe = iframe
    try { this.window = this.iframe.contentWindow; } catch (e) { this.window = this.iframe.contentWindow; }
  }

  async _sendMessageWithResponse (body) {
    const requestId = Date.now()
    body.requestId = requestId

    return new Promise(async (resolve) => {
      window.onmessage = function (e) {
        if (e?.data?.requestId === requestId) resolve(JSON.parse(e?.data?.payload?.data || 'null'))
      };

      this.window.postMessage(JSON.stringify(body), "*")
    });
  }

  async get(key) {
    return await this._sendMessageWithResponse({ method: 'get', payload: { key } });
  }
}
