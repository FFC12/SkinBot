/* global CreateMarketActionButton, $J, MergeWithAssetArray, bookmarkeditems */
var startPage = 0;
var assetList = new Map();
//TODO: REMOVE AFTER TEST 1.18.18
// var apps = {
//   'Counter-Strike: Global Offensive': 730,
//   'Dota 2': 570,
//   'Team Fortress 2': 440,
//   "PUBG: BATTLEGROUNDS": 578080,
//   'Steam': 753,
//   'Rust': 252490,
//   'Don\'t Starve Together': 322330,
//   'Unturned': 304930,
//   '!Anyway!': 866510,
//   'PAYDAY 2': 218620
// };
var $ACTIVE_LISTING_ROWS = null;
var COOKIE_ENABLED_SIH = 'enableSIH';
var IS_ENABLED_SIH = GetCookie(COOKIE_ENABLED_SIH);
IS_ENABLED_SIH = IS_ENABLED_SIH === null || IS_ENABLED_SIH === 'true';
$J('#myMarketTabs').append(`
    <div id="switchPanel">
        <span style="margin-right: 10px;">SIH - Steam Inventory Helper</span>
        <label class="switch">
            <input id="switcher" type="checkbox" ${IS_ENABLED_SIH ? 'checked' : ''}>
            <span class="slider round"></span>
        </label>
    </div>
`);
$J('#switchPanel #switcher').change((e) => {
  const {currentTarget} = e;
  SetCookie(COOKIE_ENABLED_SIH, currentTarget.checked, 365, '/market');
  window.location.reload();
});
// let buyProgressBarWidth = 0;


var orgLoadMarketHistory = null;
var orgRefreshMyMarketListings = null;
var removeLinkExp = /javascript:.*\('mylisting', '(\d+)', (\d+), '(\d+)', '(\d+)'\)/;
var FraudAlert = function () {
  $J('#sellListingRows .market_listing_row.market_recent_listing_row[id]').each(function () {
    var $row = $J(this);
    var idListing = $J(this).attr('id').replace('listing_sell_new_', '');
    var rgListing = g_rgListingInfo[idListing];
    var asset = null;
    if (rgListing) {
      asset = g_rgListingInfo[idListing].asset;
    } else {
      return;
    }
    var rgItem = g_rgAssets[asset.appid][asset.contextid][asset.id];

    //$J(this).find('.playerAvatar img').replaceWith(function () {
    //    return '<a href="http://steamcommunity.com/profiles/' + rgItem.owner + '" target="_blank">' + this.outerHTML + '</a>';
    //});

    if (rgItem.fraudwarnings && rgItem.fraudwarnings.length > 0) {
      var nameEl = $J(this).find('.market_listing_item_name');
      nameEl.html(nameEl.html() + ' <span style="color:red">(warning)</red>');
    }
    //if (rgListing['price'] > 0) {
    //    var quickBuyBt = $J('<a href="#" class="item_market_action_button item_market_action_button_green">' +
    //                '<span class="item_market_action_button_edge item_market_action_button_left"></span>' +
    //                '<span class="item_market_action_button_contents">' + SIHLang.quickbuy + '</span>' +
    //                '<span class="item_market_action_button_edge item_market_action_button_right"></span>' +
    //                '<span class="item_market_action_button_preload"></span></a>');
    //    quickBuyBt.click(function () {
    //        $J(this).hide();
    //        $row.find('.market_listing_buy_button').append('<img src="' + window.location.protocol + '//steamcommunity-a.akamaihd.net/public/images/login/throbber.gif" alt="Working...">');
    //        var Subtotal = rgListing['converted_price'];
    //        var FeeAmount = rgListing['converted_fee'];
    //        var Total = rgListing['converted_price'] + rgListing['converted_fee'];
    //        var data = {
    //            sessionid: g_sessionID,
    //            currency: g_rgWalletInfo['wallet_currency'],
    //            subtotal: Subtotal,
    //            fee: FeeAmount,
    //            total: Total,
    //            quantity: 1
    //        }
    //        $J.ajax({
    //            url: 'https://steamcommunity.com/market/buylisting/' + idListing,
    //            type: 'POST',
    //            data: data,
    //            crossDomain: true,
    //            xhrFields: { withCredentials: true }
    //        }).done(function (data) {
    //            if ($row.is(':visible'))
    //                $row.find('.market_listing_buy_button').html('Success');
    //            else
    //                alert('Success');
    //        }).fail(function (jqxhr) {
    //            $row.find('.market_listing_buy_button img').remove();
    //            var data = $J.parseJSON(jqxhr.responseText);
    //            if (data && data.message) {
    //                $row.find('.market_listing_buy_button').html(data.message);
    //                //BuyItemDialog.DisplayError(data.message);
    //            }

    //        });
    //        return false;
    //    });
    //    AddItemHoverToElement(quickBuyBt[0], rgItem);
    //    $J(this).find('.market_listing_buy_button .item_market_action_button.item_market_action_button_green').remove();
    //    $J(this).find('.market_listing_buy_button').append(quickBuyBt);
    //}
  });
  //$J('.market_listing_action_buttons').css({ width: '200px' });
};

var SetPhaseColors = function () {
  if (!window.show_phase_color_listing) return;

  // Colorize "My sell listing"
  $J('#tabContentsMyActiveMarketListingsRows')
    .find('.market_recent_listing_row')
    .each(function () {
      const $row = $J(this);
      const removeButtonHref = $row.find('a.item_market_action_button_edit').attr('href') || '';

      if (!removeButtonHref) return;

      const matches = removeButtonHref.match(/\((.+)\)/);

      if (!matches || !matches.length || matches.length < 1) {
        return;
      }

      const [, , appId, contextId, itemId] = matches[1].replace(/'/g, '').split(',').map(i => i.trim());
      const rgItem = g_rgAssets[appId][contextId][itemId];

      if (!rgItem) return;

      window.InventoryItemRarity.colorizeItem(rgItem, null, true, {
        disableBorderColorization: true,
        onBackGroundColor: ((row) => (color) => row.find('img.market_listing_item_img').css('background-color', `#${color}`))($row)
      });
    });

  // Colorize "My listings awaiting confirmation"
  $J('.my_listing_section.market_content_block.market_home_listing_table:not(#tabContentsMyActiveMarketListingsTable)')
    .find('a.market_listing_item_name_link')
    .each(async function () {
      try {
        const $itemImg = $J(this).parent().parent().parent().find('img.market_listing_item_img');
        const imageSrc = $itemImg.attr('src');
        const phaseColor = window.InventoryItemRarity.getPhaseColorByImageUrl(imageSrc);

        if (phaseColor) {
          $itemImg.css('background-color', `#${phaseColor}`);
        }
      } catch (error) {
        console.log('Market: listing item info loading error', error);
      }
    });
};

var removeListing = async function ($parent) {
  const cks = $parent.find('.market_listing_row .select-checkbox:checked').toArray();

  Promise.all(
    cks.map((item) => {
      const listingid_row = $J(item).parents('.market_recent_listing_row').attr('id');
      if (listingid_row.indexOf('mylisting') == 0) {
        const listingid = listingid_row.substring(10);
        $J(`#${listingid_row} .market_listing_edit_buttons.actual_content a`).html('Removing...');
        return new Promise((resolve, reject) =>
          $J.post(`//steamcommunity.com/market/removelisting/${listingid}`, {sessionid: g_sessionID}).then(resolve).fail(reject));
      } else if (listingid_row.indexOf('mybuyorder') == 0) {
        const buy_orderid = listingid_row.substring(11);
        $J(`#${listingid_row} .market_listing_edit_buttons.actual_content a`).html('Cancelling...');
        return new Promise((resolve, reject) =>
          $J.post('//steamcommunity.com/market/cancelbuyorder/', {
            sessionid: g_sessionID,
            buy_orderid
          }).then(resolve).fail(reject));
      }
    })
  ).then((respValues) => {
    cks.forEach((item) => {
      const $row = $J(item).parents('.market_recent_listing_row');
      $row.hide(300, function () {
        $row.remove();
      });
    });
    RefreshMyMarketListings();
  }).catch((reason) => {
    console.log(reason);
    cks.forEach((item) => {
      const $row = $J(item).parents('.market_recent_listing_row');
      $row.hide(300, function () {
        $row.remove();
      });
    });
    RefreshMyMarketListings();
  });
  return false;
};

var orgRemListingOnSuccess = RemoveListingDialog.OnSuccess;
RemoveListingDialog.OnSuccess = function (transport) {
  if (transport.responseJSON) {
    this.OnSuccessEffects();
    htmlListings = '';
    $ACTIVE_LISTING_ROWS = null;
    RefreshMyMarketListings();
  } else {
    this.OnFailureEffects();
    this.DisplayError('There was a problem removing your listing. Refresh the page and try again.');
  }
}

const parseListings = function () {
  let totalSelling = 0;
  let totalRecieve = 0;
  $ACTIVE_LISTING_ROWS.find('.market_listing_price').children('span').each(function (rowId, price) {
    let isBuyOrder = false;
    var $price = $J(price);
    if ($price.hasClass('market_listing_inline_buyorder_qty')) {
      isBuyOrder = true;
      $price = $price.parent();
    }
    // var buyerPrice = isBuyOrder ? /[+-]?([0-9]*[.,])?[0-9]+/.exec($price.text().split('@')[1])[0] : $price.find('span:first').text();
    var buyerPrice = isBuyOrder ? $price.text().split('@')[1] : $price.find('span:first').text();
    var pays = getPriceAsInt(buyerPrice);
    if (!isNaN(pays)) totalSelling += pays;

    var yourPrice = isBuyOrder ? '0.00' : $price.find('span:last').text();
    var recieve = getPriceAsInt(yourPrice.trim().replace('(', '').replace(')', ''));
    if (!isNaN(recieve)) totalRecieve += recieve;
  });
  const totalSellingStr = totalSelling ? `<span style="color: #fff">${formatNumber(totalSelling / 100)}</span>` : '';
  const totalRecieveStr = totalRecieve ? `<span style="color: #979797">(${formatNumber(totalRecieve / 100)})</span>` : '';
  $J('#totalRow0').find('.market_listing_right_cell.market_listing_edit_buttons').html(`
        <span style="display: inline-block">
            ${totalSellingStr}
            ${totalRecieveStr}
        </span>
    `);
};

var htmlListings = '';
const getOverallTotal = function (startCount) {
  const pageSize = 100;
  new Ajax.Request(`${window.location.protocol}//steamcommunity.com/market/mylistings`, {
    method: 'get',
    parameters: {
      start: startCount,
      count: pageSize
    },
    onSuccess: function (transport) {
      if (transport.responseJSON) {
        const response = transport.responseJSON;
        const total = response.total_count;
        htmlListings += response.results_html;
        if (total > startCount + pageSize) getOverallTotal(startCount + pageSize);
        else {
          $ACTIVE_LISTING_ROWS = $J($J.parseHTML(`<div>${htmlListings}</div>`)).find('#tabContentsMyActiveMarketListingsTable .market_listing_row[id^="mylisting_"]');
          parseListings();
        }
      }
    },
    onFailure: function (transport) {
      console.error('Something went wrong', transport);
    }
  });
};

var isReloading = false;
var ReloadListings = function () {
  if (isReloading) return;
  isReloading = true;
  $J('#tabContentsMyListings').html('<div style="text-align: center; padding: 20px"><img src="//steamcommunity-a.akamaihd.net/public/images/login/throbber.gif" alt="Working..."></div>');
  $J.ajax({
    url: '/market/mylistings/',
    success: function (res) {
      if (res.success && typeof (res.num_active_listings) != 'undefined') {
        clearCachePrices();
        MergeWithAssetArray(res.assets);
        $J('#tabContentsMyListings').html(res.results_html);
        $J('#my_market_activelistings_number').html(res.num_active_listings);
        eval(res.hovers);
        UpdateTotalListings();
        AddFilter();
      }
    },
    error: function () {
      $J('#tabContentsMyListings').html('<div style="text-align: center; padding: 20px">Error</div>');
    },
    complete: function () {
      isReloading = false;
      if (window.highlight) {
        FetchAllItemsPrices('sell_listings');
      }
      if (window.highlight_await) {
        FetchAllItemsPrices('await_listings');
      }

      addHideListingButton();
      addControlButtonsForAutoLoadPrices();
      if (window.highlight_buy) {
        getMaxPriceForBuyOrdersListing();
      }
    }
  });
};

var RemoveTotalAndFilter = function () {
  $J('div[id*="totalRow"]').remove();
  $J('.filter_ctn.inventory_filters').parent().remove();
  $J('.market_sort_arrow').hide();
}

var AddFilter = function () {
  var input = $J('<div style="clear:both; height: 32px"><div class="filter_ctn inventory_filters">' +
    '<div style="float:left; line-height: 29px; width: 100px" >Filter: </div>' +
    '<div class="filter_control_ctn">' +
    '<div id="filter_clear_btn" style="display: none;"></div>' +
    '<input class="selectableText filter_search_box" type="text" id="Txt_Filter" value="" placeholder="Start typing an item name here to filter items" name="filter" autocomplete="off">' +
    '</div></div></div>');
  // var btRemove = CreateMarketActionButton('green', 'javascript:void(0)', SIHLang.market.removeselected);
  var btRemove = $J(`<a class="btnControl" href="javascript:void(0)" title="${SIHLang.market.removeselected}">
      <span class="icon-trash"></span>
    </a>`);
  btRemove.click(async function () {
    const $parent = $J(this).parents('.my_listing_section');
    await removeListing($parent);
  });
  var div2 = $J('<div style="float: left; padding-left: 10px">');
  div2.append(btRemove);
  input.find('.filter_control_ctn').after(div2);

  input.find('#Txt_Filter').keyup(function () {
    const $parent = $J(this).parents('.my_listing_section');
    var cnt = $J(this).val().toUpperCase().split(' ').filter(function (ss) {
      return ss != '';
    });
    if (cnt.length == 0) {
      $parent.find('.market_listing_row:not([id^="totalRow"])').show();
      $J('#filter_clear_btn').hide();
    } else {
      var filter = '';
      for (var i = 0; i < cnt.length; i++) {
        filter += ':Contains("' + cnt[i] + '")';
      }
      $J('#filter_clear_btn').show();
      $parent.find('.market_listing_row:not([id^="totalRow"])').each(function () {
        if ($J(this).is(filter)) {
          $J(this).show();
        } else {
          $J(this).hide();
        }
      });
    }
  });
  input.find('#filter_clear_btn').click(function () {
    input.find('#Txt_Filter').val('');
    $J('#tabContentsMyListings .market_home_listing_table:has(div[id^="mylisting"]) .market_listing_row:not([id^="totalRow"])').show();
    $J('#filter_clear_btn').hide();
  });
  $J('#tabContentsMyListings .market_home_listing_table:has(div[id^="mylisting"]) .my_market_header').after(input);


  $J('#tabContentsMyListings .market_home_listing_table .market_listing_edit_buttons .market_listing_cancel_button').each((index, element) => {
    if ($J(element).find('.select-checkbox').length === 0) {
      $J(element).append(`<input type="checkbox" id="select-row-${index}" class="select-checkbox" /> <label class="fake-checkbox" for="select-row-${index}"></label>`)

    }
  })
  $J('#tabContentsMyListings .market_home_listing_table .market_listing_table_header .market_listing_edit_buttons').each((index,element) => {
    const ckAll = $J(`<input type="checkbox" id="select-all-${index}" class="select-checkbox" /> <label class="fake-checkbox fake-checkbox_all" for="select-all-${index}"></label>`)
    if ($J(element).find('.select-checkbox').length === 0) {
      $J(element).append(ckAll);
    }

    ckAll.click(function () {
      const ckprop = $J(this).prop('checked');
      const parent = $J(this).parents('.market_home_listing_table');
      parent.find('.market_listing_edit_buttons .market_listing_cancel_button .fake-checkbox:visible').prev('.select-checkbox').prop('checked', ckprop);
    });
  });

  //Buying lists

  var input_buying = $J('<div style="clear:both; height: 32px"><div class="filter_ctn inventory_filters">' +
    '<div style="float:left; line-height: 29px; width: 100px" >Filter: </div>' +
    '<div class="filter_control_ctn">' +
    '<div id="filter_clear_btn_buying" style="display: none;"></div>' +
    '<input class="selectableText filter_search_box" type="text" id="Txt_Filter_Buying" value="" placeholder="Start typing an item name here to filter items" name="filter" autocomplete="off">' +
    '</div></div></div>');

  // var btRemoveBuying = CreateMarketActionButton('green', 'javascript:void(0)', SIHLang.market.removeselected);
  var btRemoveBuying = $J(`<a class="btnControl" href="javascript:void(0)" alt="${SIHLang.market.removeselected}">
      <span class="icon-trash"></span>
    </a>`);
  btRemoveBuying.click(async function () {
    const $parent = $J(this).parents('.my_listing_section');
    await removeListing($parent);
  });

  var div2_buying = $J('<div style="float: left; padding-left: 10px">');
  div2_buying.append(btRemoveBuying);
  input_buying.find('.filter_control_ctn').after(div2_buying);

  input_buying.find('#Txt_Filter_Buying').keyup(function () {
    const $parent = $J(this).parents('.my_listing_section');
    var cnt = $J(this).val().toUpperCase().split(' ').filter(function (ss) {
      return ss != '';
    });
    if (cnt.length == 0) {
      $parent.find('.market_listing_row:not([id^="totalRow"])').show();
      $J('#filter_clear_btn_buying').hide();
    } else {
      var filter = '';
      for (var i = 0; i < cnt.length; i++) {
        filter += ':Contains("' + cnt[i] + '")';
      }
      $J('#filter_clear_btn_buying').show();
      $parent.find('.market_listing_row:not([id^="totalRow"])').each(function () {
        if ($J(this).is(filter)) {
          $J(this).show();
        } else {
          $J(this).hide();
        }
      });
    }
  });
  input_buying.find('#filter_clear_btn_buying').click(function () {
    input_buying.find('#Txt_Filter_Buying').val('');
    $J('#tabContentsMyListings .market_home_listing_table:has(div[id^="mybuyorder"]) .market_listing_row:not([id^="totalRow"])').show();
    $J('#filter_clear_btn_buying').hide();
  });
  $J('#tabContentsMyListings .market_home_listing_table:has(div[id^="mybuyorder"]) .my_market_header').after(input_buying);
  // $J('#tabContentsMyListings .market_home_listing_table:eq(1) .my_market_header').after(input_buying);
};

var AddSelectedAllOverpricesButton = function (table) {
  $J('#tabContentsMyListings .market_home_listing_table').each(function () {
    const sectionId = getListingSectionType($J(this));

    //TODO Clear progress bar
    // const headerBlockEl = $J(this).find(`#${sectionId}`);
    // if (headerBlockEl.length > 0 && sectionId === 'buy_orders') {
    //   $J(this).find('.filter_ctn.inventory_filters .btnControl').click(function () {
    //     buyProgressBarWidth = 0;
    //   })
    // }

      const button = CreateMarketActionButton('green', 'javascript:void(0)', SIHLang.market.selectoverpriced);
      $J(button).click(function () {
        const $parent = $J(this).parents('.my_listing_section');
        $parent.find('.red-bg .market_listing_edit_buttons .market_listing_cancel_button .fake-checkbox:visible').prev('.select-checkbox').prop('checked', true);
      });
      $J(button).css({marginRight: '10px'});
      if (table === "buy_orders" && sectionId === table) {
        if ($J(this).find('.filter_ctn.inventory_filters .item_market_action_button').length === 0 && $J(this).find('.red-bg').length >= 1) {
          $J(this).find('.filter_ctn.inventory_filters .btnControl').before(button);
        }
      }
      else if (table === "sell_listings" && sectionId === table){
        if ($J(this).find('.filter_ctn.inventory_filters .item_market_action_button').length === 0) {
          $J(this).find('.filter_ctn.inventory_filters .btnControl').before(button);
        }
      }
      else if (table === "await_listings" && sectionId === table){
        if ($J(this).find('.filter_ctn.inventory_filters .item_market_action_button').length === 0 && $J(this).find('.red-bg').length >= 1) {
          $J(this).find('.filter_ctn.inventory_filters .btnControl').before(button);
        }
      }

  });

}

var AddSortableColumns = function (jheader) {
  // var jheader = $J('#tabContentsMyListings .market_content_block.my_listing_section.market_home_listing_table:first .market_listing_table_header');
  jheader.find('> span').each(function () {
    if ($J(this).hasClass('market_listing_minimum') || $J(this).hasClass('market_listing_edit_buttons') || $J(this).hasClass('market_listing_listed_date')) return;
    $J(this).addClass('market_sortable_column');
    $J(this).css('display', 'block');
    $J(this).append('<span class="market_sort_arrow" style="display:none"></span>');
    if ($J(this).hasClass('market_listing_buyorder_qty')) {
      var $parent = $J(this);
      $J(this).click(function () {
        jheader.find('.market_sort_arrow').hide();
        var oder = 1;
        if ($parent.find('.market_sort_arrow').is(':contains("▲")')) {
          oder = -1;
          $parent.find('.market_sort_arrow').text('▼');
        } else {
          $parent.find('.market_sort_arrow').text('▲');
        }

        $parent.find('.market_sort_arrow').show();
        var $rows = jheader.parent('.market_home_listing_table');
        if ($rows.find('#tabContentsMyActiveMarketListingsRows').length) $rows = $rows.find('#tabContentsMyActiveMarketListingsRows');
        var $rowsli = $rows.children('.market_listing_row:not([id^="totalRow"])');

        $rowsli.sort(function (a, b) {
          var an = parseFloat(getPriceAsInt($J(a).find('.market_listing_my_price.market_listing_buyorder_qty').text())),
            bn = parseFloat(getPriceAsInt($J(b).find('.market_listing_my_price.market_listing_buyorder_qty').text()));
          if (an == bn) {
            an = $J(a).find('.market_listing_item_name_link').text();
            bn = $J(b).find('.market_listing_item_name_link').text();
          }

          if (an > bn) {
            return 1 * oder;
          }
          if (an < bn) {
            return -1 * oder;
          }
          return 0;
        });

        $rowsli.detach().appendTo($rows);
      });
    } else if ($J(this).hasClass('market_listing_my_price')) {
      var $parent = $J(this);
      $J(this).click(function () {
        jheader.find('.market_sort_arrow').hide();
        var oder = 1;
        if ($parent.find('.market_sort_arrow').is(':contains("▲")')) {
          oder = -1;
          $parent.find('.market_sort_arrow').text('▼');
        } else {
          $parent.find('.market_sort_arrow').text('▲');
        }

        $parent.find('.market_sort_arrow').show();
        var $rows = jheader.parent('.market_home_listing_table');
        if ($rows.find('#tabContentsMyActiveMarketListingsRows').length) $rows = $rows.find('#tabContentsMyActiveMarketListingsRows');
        var $rowsli = $rows.children('.market_listing_row:not([id^="totalRow"])');

        $rowsli.sort(function (a, b) {
          // var an = parseFloat(/[\d\.]+/.exec($J(a).find('[title="This is the price the buyer pays."]').text())[0]),
          // bn = parseFloat(/[\d\.]+/.exec($J(b).find('[title="This is the price the buyer pays."]').text())[0]);
          const extractPrice = function (row) {
            let isBuyOrder = false;
            var aprice = $J(row).find('.market_listing_price').children('span:first');
            if (aprice.hasClass('market_listing_inline_buyorder_qty')) {
              isBuyOrder = true;
              aprice = aprice.parent();
            }
            aprice = isBuyOrder ? aprice.text().split('@')[1] : aprice.find('span:first').text();
            return getPriceAsInt(aprice);
          };

          var an = extractPrice(a);
          var bn = extractPrice(b);
          if (an == bn) {
            an = $J(a).find('.market_listing_item_name_link').text();
            bn = $J(b).find('.market_listing_item_name_link').text();
          }

          if (an > bn) {
            return 1 * oder;
          }
          if (an < bn) {
            return -1 * oder;
          }
          return 0;
        });

        $rowsli.detach().appendTo($rows);
      });
    } else {
      var $parent = $J(this);
      $J(this).click(function () {
        jheader.find('.market_sort_arrow').hide();
        var oder = 1;
        if ($parent.find('.market_sort_arrow').is(':contains("▲")')) {
          oder = -1;
          $parent.find('.market_sort_arrow').text('▼');
        } else {
          $parent.find('.market_sort_arrow').text('▲');
        }

        $parent.find('.market_sort_arrow').show();
        var $rows = jheader.parent('.market_home_listing_table');
        if ($rows.find('#tabContentsMyActiveMarketListingsRows').length) $rows = $rows.find('#tabContentsMyActiveMarketListingsRows');
        var $rowsli = $rows.children('.market_listing_row:not([id^="totalRow"])');

        $rowsli.sort(function (a, b) {
          var an = $J(a).find('.market_listing_item_name_link').text(),
            bn = $J(b).find('.market_listing_item_name_link').text();

          if (an > bn) {
            return 1 * oder;
          }
          if (an < bn) {
            return -1 * oder;
          }
          return 0;
        });

        $rowsli.detach().appendTo($rows);
      });

      // if ($J(this).is(":contains('PRICE')")) {
    }
  });
}

var UpdateTotalListings = function () {
  if (typeof (window.totalrow) === 'undefined' || window.totalrow) {
    $J('#myListings .market_content_block.my_listing_section.market_home_listing_table').each(function (idx, listingsTable) {
      var totalSelling = 0;
      var totalRecieve = 0;
      const $listingsTable = $J(listingsTable);
      $listingsTable.find('.market_listing_price').children('span').each(function (rowId, price) {
        let isBuyOrder = false;
        var $price = $J(price);
        if ($price.hasClass('market_listing_inline_buyorder_qty')) {
          isBuyOrder = true;
          $price = $price.parent();
        }
        // var buyerPrice = isBuyOrder ? /[+-]?([0-9]*[.,])?[0-9]+/.exec($price.text().split('@')[1])[0] : $price.find('span:first').text();
        let buyerPrice;
        let qty = 1;
        if (isBuyOrder) {
          [qty, buyerPrice] = $price.text().split('@');
        } else {
          buyerPrice = $price.find('span:first').text();
        }
        var pays = getPriceAsInt(buyerPrice);
        if (!isNaN(pays)) totalSelling += qty * pays;

        var yourPrice = isBuyOrder ? '0.00' : $price.find('span:last').text();
        var recieve = getPriceAsInt(yourPrice.trim().replace('(', '').replace(')', ''));
        if (!isNaN(recieve)) totalRecieve += recieve;
      });

      var priceDiv = $J('<div id="totalRow' + idx + '" class="market_listing_row market_recent_listing_row"><div class="market_listing_right_cell market_listing_edit_buttons">&nbsp;</div>' +
        '<div class="market_listing_right_cell market_listing_my_price">' +
        '<span class="market_table_value">' +
        '<span class="market_listing_price">' +
        '<span style="display: inline-block">' +
        (totalSelling ? '<span>' + formatNumber(totalSelling / 100) + '</span><br />' : '') +
        (totalRecieve ? '<span style="color: #979797; font-size: 12px" >(' + formatNumber(totalRecieve / 100) + ')</span>' : '') +
        '<span></span></span></div>' +
        '<div class="market_listing_item_name_block">' +
        `<span style="color: #D2D2D2; font-weight: bold; padding-left:50px">${SIHLang.market.total}</a></span><br>` +
        '</div><div style="clear: both"></div></div>');
      $listingsTable.find('.market_listing_table_header').after(priceDiv);
    });

    if (window.overallsum) {
      if ($ACTIVE_LISTING_ROWS === null) getOverallTotal(0);
      else parseListings();
    }
  }
  //$J('#myListings .market_listing_table_header .market_listing_my_price').html((parseInt(totalSelling * 100) / 100) + ' (' + (parseInt(totalRecieve * 100) / 100) + ')');
};

const rowIdsArr = [];

var FetchAllItemsPrices = function (tableId) {
  const tablePromise = [];
  let listings;
  let buttonLoadPricesEl;
  if (tableId === 'sell_listings') {
    tablePromise.push(new Promise((resolve, reject) => {
      listings = $J('#tabContentsMyActiveMarketListingsRows .market_listing_row[id^="mylisting"] .market_listing_cancel_button a:not([done])');
      buttonLoadPricesEl = $J('#myListings .market_listing_row[id^="mylisting"]').parent().parent().find('#load_sell_overprices');
      resolve();
    }))
  }
  else if (tableId === 'await_listings') {

      tablePromise.push(new Promise((resolve, reject) => {
        setTimeout(()=> {
          const awaitTable = $J('#await_listings').parent();
          listings = $J(awaitTable).find('.market_listing_row[id^="mylisting"] .market_listing_cancel_button a:not([done])');
          buttonLoadPricesEl = $J('#myListings .market_listing_row[id^="mylisting"]').parent().parent().find('#load_await_overprices');
          resolve();
        }, 500)
      }));

  }
  else {
    tablePromise.push(new Promise((resolve, reject) => {
      listings = $J('#myListings .market_listing_row[id^="mylisting"] .market_listing_cancel_button a:not([done])');
      resolve();
    }));
  }

  Promise.all(tablePromise).then(() => {
    if (listings.length <= 0) {
      if ($J(buttonLoadPricesEl).hasClass('animated-background')) {
        $J(buttonLoadPricesEl).removeClass('animated-background');
      }
      return;
    }
    if (!$J(buttonLoadPricesEl).hasClass('animated-background') && listings.length > 0) {
      $J(buttonLoadPricesEl).addClass('animated-background');
    }
    const element = listings[0];
    $J(element).attr('done', 'true');
    const link = decodeURIComponent(element.href);
    const m = removeLinkExp.exec(link);
    if (!m) return;
    const rgItem = g_rgAssets[m[2]][m[3]][m[4]];
    if (!rgItem) return;
    element.rgItem = rgItem;
    getLowestPriceHandler(element.rgItem, '', function (item) {
      const row = $J(element).parent().parent().parent();
      const p = row.find('.market_listing_price span span:nth-child(1)');
      const recieve = getPriceAsInt(p.text());
      const lowest = getPriceAsInt(item.lowestPrice);
      if (row.find('.market_listing_minimum').length === 0) {
        $J(`<div class="market_listing_right_cell market_listing_minimum" style="width: 120px; color: #979797;">
          ${item.lowestPrice}
        </div>`).insertAfter(row.find('.market_listing_my_price'));
      }
      if (lowest < recieve) {
        row.addClass('red-bg');
        const rowId = row.attr('id').replace(/mylisting_/g, '').trim();
        if (rowIdsArr && !rowIdsArr.includes(rowId)) {
          rowIdsArr.push(rowId);
        }
        AddSelectedAllOverpricesButton(tableId);
      }
      FetchAllItemsPrices(tableId);
    });
  })
};

var bookmarksLoaded = false;
var ShowBookmarks = function () {
  bookmarksLoaded = true;
  if (bookmarkeditems) {
    $J('#tabContentsMyBookmarks').html('<div class="my_listing_section market_home_listing_table">' +
      '<div class="market_listing_table_header">' +
      '<span class="market_listing_right_cell market_listing_edit_buttons"></span>' +
      '<span class="market_listing_right_cell market_listing_my_price market_sortable_column" style="display: block;">PRICE<span class="market_sort_arrow" style="display:none"></span></span>' +
      '<span class="market_listing_right_cell market_listing_listed_date market_sortable_column">VOLUME<span class="market_sort_arrow" style="display:none"></span></span>' +
      '<span class="market_sortable_column" style="display: block;"><span class="market_listing_header_namespacer"></span>NAME<span class="market_sort_arrow" style="display:none"></span></span>' +
      '</div></div>');

    if (bookmarkscategories) {
      var divCats = $J(`
                <div class="bookmark-categories">
                    <a href="#" class="category active" data-cat="all">${SIHLang.market.all}</a>
                    <a href="#" class="category" data-cat="">${SIHLang.market.general}</a>
                </div>`);
      for (var i in bookmarkscategories) {
        var cat = bookmarkscategories[i];
        divCats.append('<a href="#" class="category" data-cat="' + i + '">' + cat + '</a>')
      }

      divCats.prependTo('#tabContentsMyBookmarks');
      divCats.find('a.category').click(function (e) {
        $J('.category.active').removeClass('active');
        $J(this).addClass('active');
        var cat = $J(this).data('cat');
        if (cat === 'all') {
          $J('#tabContentsMyBookmarks .market_listing_row').show();
        } else {
          $J('#tabContentsMyBookmarks .market_listing_row').hide();
          $J('#tabContentsMyBookmarks .market_listing_row[data-cat="' + cat + '"]').show();
        }
        e.preventDefault();
      });
    }

    $J.each(bookmarkeditems, function (idex, item) {
      if (!item || !item.img || !item.hashmarket) return true;

      var divItem = '<div class="market_listing_row market_recent_listing_row" data-cat="' + (item.cat || '') + '" data-hash="' + item.hashmarket + '" data-appid="' + item.appid + '">' +
        '<img src="' + item.img.replace('360fx360f', '38fx38f') + '" style="border-color: ' + item.color + ';" class="market_listing_item_img" alt="">' +
        '<div class="market_listing_right_cell market_listing_edit_buttons">' +
        '<div class="market_listing_cancel_button">' +
        '<a href="javascript:void(0)" data-hash="' + item.hashmarket + '" class="item_market_action_button item_market_action_button_edit nodisable remove-bookmark">' +
        '<span class="item_market_action_button_edge item_market_action_button_left"></span>' +
        '<span class="item_market_action_button_contents">' + SIHLang.market.remove + '</span>' +
        '<span class="item_market_action_button_edge item_market_action_button_right"></span>' +
        '<span class="item_market_action_button_preload"></span>' +
        '</a>' +
        '</div>' +
        '</div>' +
        '<div class="market_listing_right_cell market_listing_my_price">' +
        '<span class="market_table_value">' +
        '<span class="market_listing_price">' +
        '<span style="display: inline-block">' +
        '<span title="This is the lowest price." class="bookmark-price">loading</span><br>' +
        '<span title="This is the seller price." class="bookmark-seller-price" style="color: #979797"></span>' +
        '</span>' +
        '</span>' +
        '</span>' +
        '</div>' +
        '<div class="market_listing_right_cell market_listing_my_price">' +
        '<span class="market_table_value">' +
        '<span class="market_listing_price">' +
        '<span style="display: inline-block">' +
        '<span class="bookmark-volume" title="Number of this item sold in the last 24 hours">loading</span><br />' +
        '<span title="This is the median price." class="bookmark-median-price" style="color: #979797"></span>' +
        '</span>' +
        '</span>' +
        '</span>' +
        '</div>' +
        '<div class="market_listing_item_name_block">' +
        '<span class="market_listing_item_name" style="color: ' + item.color + ';"><a class="market_listing_item_name_link" href="' + item.url + '">' + item.name + '</a></span><br>' +
        '<span class="market_listing_game_name">' + item.gamename + '</span>' +
        '</div>' +
        '<div style="clear: both"></div>' +
        '</div>';

      var $div = $J(divItem);
      if (item.cat) {
        $div.data('cat', item.cat);
      }
      $J('#tabContentsMyBookmarks .my_listing_section').append($div);

      var itemLink = "//steamcommunity.com/market/priceoverview/?appid=" + item.appid
        + "&country=" + countryCode + "&currency=" + currencyId
        + "&market_hash_name=" + decodeURIComponent(item.hashmarket.substring(item.hashmarket.indexOf('/') + 1));

      PriceQueue.GetPrice({
        method: 'GET',
        url: itemLink,
        innerDiv: $div,
        success: function (response) {
          if (response.success) {
            $div.find('.bookmark-price').html(response.lowest_price);
            $div.find('.bookmark-median-price').html(response.median_price);

            var inputValue = getPriceAsInt(response.lowest_price);
            var nAmount = inputValue;
            var priceWithoutFee = null;
            if (inputValue > 0 && nAmount == parseInt(nAmount)) {
              var feeInfo = CalculateFeeAmount(nAmount, g_rgWalletInfo['wallet_publisher_fee_percent_default']);
              nAmount = nAmount - feeInfo.fees;
              priceWithoutFee = v_currencyformat(nAmount, GetCurrencyCode(g_rgWalletInfo['wallet_currency']));
            }

            $div.find('.bookmark-seller-price').html('(' + priceWithoutFee + ')');
            var volume = (response.volume) ? response.volume : '';
            $div.find('.bookmark-volume').html(volume);
          }
        },
        error: function () {
        }
      });
    });
  }
  // if (bookmarkTimer) window.clearTimeout(bookmarkTimer);
  // bookmarkTimer = window.setTimeout(UpdateBookmarksPrices, 10000);
};

var bookmarkTimer = null;
var UpdateBookmarksPrices = function () {
  if (bookmarkTimer) window.clearTimeout(bookmarkTimer);

  var date = new Date();
  var strTime = date.toLocaleTimeString();
  $J('#tabContentsMyBookmarks .my_listing_section .market_listing_table_header .market_listing_right_cell.market_listing_edit_buttons').text(strTime);
  $J('#tabContentsMyBookmarks .my_listing_section .market_listing_row.market_recent_listing_row').each(function (idx) {
    var $div = $J(this);
    var data = $div.data();
    var itemLink = '//steamcommunity.com/market/priceoverview/?appid=' + data.appid
      + '&country=' + countryCode + '&currency=' + currencyId
      + '&market_hash_name=' + decodeURIComponent(data.hash.substring(data.hash.indexOf('/') + 1));

    PriceQueue.GetPrice({
      method: 'GET',
      url: itemLink,
      innerDiv: $div,
      success: function (response) {
        if (response.success) {
          var priceSpan = $div.find('.bookmark-price');
          var oldPrice = priceSpan.text();
          priceSpan.text(response.lowest_price);
          $div.find('.bookmark-median-price').html(response.median_price);
          if (oldPrice != priceSpan.text()) {
            BlinkElement(priceSpan);
          }

          var inputValue = getPriceAsInt(response.lowest_price);
          var nAmount = inputValue;
          var priceWithoutFee = null;
          if (inputValue > 0 && nAmount == parseInt(nAmount)) {
            var feeInfo = CalculateFeeAmount(nAmount, g_rgWalletInfo['wallet_publisher_fee_percent_default']);
            nAmount = nAmount - feeInfo.fees;
            priceWithoutFee = v_currencyformat(nAmount, GetCurrencyCode(g_rgWalletInfo['wallet_currency']));
          }

          $div.find('.bookmark-seller-price').html('(' + priceWithoutFee + ')');
          var volume = (response.volume) ? response.volume : '';
          $div.find('.bookmark-volume').html(volume);
        }
      },
      error: function () {
      }
    });
  });

  if ($J('#tabMyBookmarks').is('.market_tab_well_tab_active')) {
    // If all price of bookmark was loaded clean cache and update prices
    if (Object.keys(bookmarkeditems).length == Object.keys(PriceQueue._cache).length) {
      PriceQueue._cache = {};
    }
    bookmarkTimer = window.setTimeout(UpdateBookmarksPrices, 10000);
  }
};

var oder = -1;
var BlinkElement = function (el) {
  $J(el).css({backgroundColor: 'rgba(255,0,0,1)'}).animate({backgroundColor: 'rgba(255,0,0,0)'}, 1000);
};

var GetActualItemPrice = function (self) {
  const $itemRowBlock = $J(self).parent().parent().parent();
  const name = $itemRowBlock.find('.market_listing_item_name').text();

  let iconUrl = '';
  const iconSrc =  $itemRowBlock.find('img').attr('src');
  if (iconSrc) {
    iconUrl = iconSrc.match(/image\/(.*)\//)[1];
  }

  const assetItemObj = assetList.get(iconUrl);

  if (assetItemObj && assetItemObj[name].market_hash_name && assetItemObj[name].appid) {
    $J(self).text('...');
    $J.ajax({
      url: '//steamcommunity.com/market/priceoverview/',
      method: 'get',
      data: {currency: currencyId, appid: assetItemObj[name].appid, market_hash_name: assetItemObj[name].market_hash_name}
    }).done(function (res) {
      $J(self).text(res.lowest_price);
    }).fail(function () {
      $J(self).text('Check price');
    });
  }
};

var RenderPriceButtons = function () {
  var $tableRows = $J('#tabContentsMyMarketHistoryRows .market_listing_row');
  $J.each($tableRows, function (i, element) {
    const $itemRowBlock = $J(element);
    const name = $itemRowBlock.find('.market_listing_item_name').text();
    const price = $J(element).find('.market_listing_price').text().trim();

    let iconUrl = '';
    const iconSrc =  $itemRowBlock.find('img').attr('src');
    if (iconSrc) {
      iconUrl = iconSrc.match(/image\/(.*)\//)[1];
    }

    const assetItemObj = assetList.get(iconUrl);

    if (price && assetItemObj[name] && assetItemObj[name].market_hash_name && assetItemObj[name].appid && !$itemRowBlock.find('.price-label').length) {
      var html = '<span class="price-label"><span class="label" onclick="GetActualItemPrice(this); return false;">Check price</span></span>';
      $J(element).find('.market_listing_their_price').append(html);
    }
  });
};

const getListingSectionType = function (section) {
  if (section.find('#tabContentsMyActiveMarketListingsRows').length > 0) {
    return 'sell_listings';
  } else if (section.find('div[id^="mybuyorder_"]').length > 0) {
    return 'buy_orders';
  } else {
    return 'await_listings';
  }
};

var addHideListingButton = function () {
  $J('#tabContentsMyListings .market_home_listing_table').each(function () {
    const sectionId = getListingSectionType($J(this));
    const HIDE_LISTINGS = GetCookie(sectionId) || 'false';
    const btnPanel = `
            <a href="javascript:void(0);" id="${sectionId}" data-hidden="${HIDE_LISTINGS}" class="hide_listing item_market_action_button sih_item_market_action_button_grey" style="float: right; right: 15px; position: relative;">
                <span class="item_market_action_button_contents" style="min-width: 80px;">${HIDE_LISTINGS === 'true' ? SIHLang.market.showlistings : SIHLang.market.hidelistings}</span>
            </a>`;
    $J(this).prepend(btnPanel);
    if (HIDE_LISTINGS === 'true') $J(this).children('div').hide();
    $J(this).find('.hide_listing').click(function () {
      const $elem = $J(this);
      const sectionId = $elem.attr('id');
      const isHidden = $elem.data('hidden');
      if (isHidden) {
        $elem.find('.item_market_action_button_contents').text(SIHLang.market.hidelistings);
        $elem.parent().children('div').show();
      } else {
        $elem.find('.item_market_action_button_contents').text(SIHLang.market.showlistings);
        $elem.parent().children('div').hide();
      }
      SetCookie(sectionId, !isHidden, 7, '/market');
      $elem.data('hidden', !isHidden);
    });
  });
};

var addControlButtonsForAutoLoadPrices = function () {
  $J('#tabContentsMyListings .market_home_listing_table').each(function () {
    const sectionId = getListingSectionType($J(this));
    const headerBlockEl = $J(this).find(`#${sectionId}`);



    const btnOverPricesSell = `
      <span class="row row_autoload-price">
        <a href="javascript:void(0);" id="sell_overprices" data-hidden="${window.highlight}" class="load_price_auto ${window.highlight ? 'on' : ''}" title="${SIHLang.market.tooltip1}"></a>
        <a id="load_sell_overprices" class="column column_autoload-price load_price_manual" title="${SIHLang.market.tooltip2}">
            <span class="text text_white">${SIHLang.market.requestPrice}</span>
            <span class="text text_small text_${window.highlight ? 'green' : 'white'}">${window.highlight ? `${SIHLang.market.auto}` : `${SIHLang.market.manual}`}</span>
        </a>
      </span>`;

    const btnOverPricesAwait = `
    <span class="row row_autoload-price">
      <a href="javascript:void(0);" id="await_overprices" data-hidden="${window.highlight_await}" class="load_price_auto ${window.highlight_await ? 'on' : ''}" title="${SIHLang.market.tooltip1}"></a>
      <a id="load_await_overprices" class="column column_autoload-price load_price_manual" title="${SIHLang.market.tooltip2}">
        <span class="text text_white">${SIHLang.market.requestPrice}</span>
        <span class="text text_small text_${window.highlight_await ? 'green' : 'white'}">${window.highlight_await ? `${SIHLang.market.auto}` : `${SIHLang.market.manual}`}</span>
      </a>
    </span>`;

    const btnLowerPricesBuy = `
    <span class="row row_autoload-price">
      <a href="javascript:void(0);" id="buy_lowerprices" data-hidden="${window.highlight_buy}" class="load_price_auto ${window.highlight_buy ? 'on' : ''}" title="${SIHLang.market.tooltip1}"></a>
      <a id="load_buy_lowerprices" class="column column_autoload-price load_price_manual ${window.highlight_buy ? 'disabled' : ''}" title="${SIHLang.market.tooltip2}">
        <span class="text text_white">${SIHLang.market.requestPrice}</span>
        <span class="text text_small text_${window.highlight_buy ? 'green' : 'white'}">${window.highlight_buy ? `${SIHLang.market.auto}` : `${SIHLang.market.manual}`}</span>
        <span class="progress_after"></span>
      </a>
    </span>`;

    if (sectionId === 'sell_listings') {
      $J(headerBlockEl).after(btnOverPricesSell)
    }
    if (sectionId === 'await_listings') {
      $J(headerBlockEl).after(btnOverPricesAwait);
    }
    else if (sectionId === 'buy_orders') {
      $J(headerBlockEl).after(btnLowerPricesBuy)
    }

    // Add tooltips
    addTooltipForLoadPricesButton('load_price_auto');
    addTooltipForLoadPricesButton('load_price_manual');

    // Autoload overprices for sell
    buttonListenerAutoLoadPrices(this, 'sell_overprices');
    // Autoload overprices for sell
    buttonListenerAutoLoadPrices(this, 'await_overprices');
    // Autoload overprices for buy
    buttonListenerAutoLoadPrices(this, 'buy_lowerprices');

    //Load overprices handle
    $J(this).find('#load_sell_overprices').click(function () {
      FetchAllItemsPrices('sell_listings');
    })
    //Load overprices handle
    $J(this).find('#load_await_overprices').click(function () {
      FetchAllItemsPrices('await_listings');
    })

    //Load lowerprices handle
    $J(this).find('#load_buy_lowerprices').click(function () {
      const buttonEl = this;
      if (!$J(buttonEl).hasClass('disabled')) {
        $J(buttonEl).addClass('disabled');
      }
      getMaxPriceForBuyOrdersListing();
    });
  });
}

var buttonListenerAutoLoadPrices = function (block, idName) {
  $J(block).find(`#${idName}`).click(function () {
    const button = $J(this);
    const isHidden = $J(button).data('hidden');
    $J(button).toggleClass('on');
    $J(button).data('hidden', !isHidden);
    if (isHidden) {
      $J(button).parent().find('.text_small').text(`${SIHLang.market.manual}`);
      $J(button).parent().find('.text_small').removeClass('text_green');
      $J(button).parent().find('.text_small').addClass('text_white');
    }
    else {
      $J(button).parent().find('.text_small').text(`${SIHLang.market.auto}`);
      $J(button).parent().find('.text_small').removeClass('text_white');
      $J(button).parent().find('.text_small').addClass('text_green');
    }
    if (idName === 'sell_overprices') {
      chrome.runtime.sendMessage(window.SIHID, {type: 'BACKGROUND_HIGHLIGHT_OVERPRICED', data: !isHidden});
    }
    if (idName === 'await_overprices') {
      chrome.runtime.sendMessage(window.SIHID, {type: 'BACKGROUND_HIGHLIGHT_OVERPRICED_AWAIT', data: !isHidden});
    }
    if (idName === 'buy_lowerprices') {
      chrome.runtime.sendMessage(window.SIHID, {type: 'BACKGROUND_HIGHLIGHT_LOWERPRICED_BUY', data: !isHidden});
    }

  });
}

var addTooltipForLoadPricesButton = function (className) {
  $J(`.${className}`).tooltip({
    position: {
      my: "left bottom",
      at: "left top-10"
    },
    open: function (event, ui) {},
    show: {
      delay: 500,
      duration: 0
    }
  });
}

var loadProgress = function (button, lengthRows) {
  if (button.length > 0 && !$J(button).hasClass('progress')) {
      $J(button).addClass('progress');
    }
  if (button.length > 0) {
    const maxWidth = Number($J(button).css('padding-left').replace(/px/g, '').trim()) + Number($J(button).css('padding-right').replace(/px/g, '').trim()) +
      Number($J(button).css('width').replace(/px/g, '').trim());
    const oneStep = maxWidth / lengthRows;
    if ($J(button).is('#load_buy_lowerprices')) {
      // buyProgressBarWidth += oneStep;
      $J(button).find('.progress_after').width(Math.ceil(buyProgressBarWidth));
    }
  }
}

var getMaxPriceForBuyOrdersListing = function () {
  const listings = $J('#myListings .market_listing_row[id^="mybuyorder"] .market_listing_item_name_link');
  const headerBuyOrders = $J('.my_listing_section.market_content_block.market_home_listing_table');
  const steamLang = GetCookie('Steam_Language') || 'english';
  let buttonLoadPricesForBuy;
  $J(headerBuyOrders).each((idx, table) => {
    if ($J(table).find('#buy_orders').length > 0) {
      const tableHeader = $J(table).find('.market_listing_table_header');
      $J(tableHeader).find('.market_listing_buyorder_qty').before(
        `<span class="market_listing_right_cell market_listing_my_price market_listing_maximum" style="display: block;">${SIHLang.market.maximum}<span class="market_sort_arrow" style="display:none"></span></span>`);

      buttonLoadPricesForBuy = $J(table).find('#load_buy_lowerprices');
      if (!$J(buttonLoadPricesForBuy).hasClass('animated-background')) {
        $J(buttonLoadPricesForBuy).addClass('animated-background');
      }
    }
  })

  $J(listings).each((index, element) => {
    const link = element.href;
    setTimeout(()=> {
      $J.ajax({
        url: link,
        method: "GET",
        crossDomain: true,
        xhrFields: {withCredentials: true},
        success: function (response) {
          const appId = link.replace(/https:\/\//, '').split('/')[3];
          const marketHashName = link.replace(/https:\/\//, '').split('/')[4]
          const nameid = response.match(/Market_LoadOrderSpread\( (\d+)/)[1];
          const marketHashNameLocalized =  $J(element).text();
          const encodedName = encodeURIComponent(marketHashNameLocalized).replace(/\(/g, '%28').replace(/\)/g, '%29');
          chrome.runtime.sendMessage(SIHID, {type: 'BACKGROUND_GET_ORDER_HISTOGRAM', data: {
              g_strCountryCode,
              steamLang,
              g_rgWalletInfo,
              nameid,
              appId,
              encodedName
            }}, (data) => {
            if (data) {
              if (data.success && data.buy_order_graph) {
                const highPrice = data.buy_order_graph[0][0];
                const priceFormatted = SIH?.global?.Currency?.getPriceFromCurrency(highPrice, currencyId, currencyId).text;
                const rowBlock = $J(element).parent().parent().parent();

                $J(rowBlock).find('.market_listing_my_price.market_listing_buyorder_qty').before(`
              <div class="market_listing_right_cell market_listing_my_price market_listing_buyorder_max">
                  <span class="market_table_value">
                    <span class="market_listing_price">
                      ${priceFormatted}
                    </span>
                  </span>
              </div>`
                );
                $J(rowBlock).find('.market_listing_edit_buttons.placeholder').each((idx, elem) => {
                  const currentBuyPriceEl = $J(elem).next().find('.market_listing_price');
                  if ($J(currentBuyPriceEl).find('.market_listing_inline_buyorder_qty').length > 0) {
                    $J(currentBuyPriceEl).find('.market_listing_inline_buyorder_qty').remove();
                  }
                  const currentPrice = $J(currentBuyPriceEl).text().replace(/,/g, '.').trim().match(new RegExp(/\d+[0-9,.]?\d*/g));
                  if (Number(currentPrice) < Number(highPrice)) {
                    $J(rowBlock).addClass('red-bg');
                  }
                });
                $J(element).attr('done', true);
                const listingsNotDone = $J('#myListings .market_listing_row[id^="mybuyorder"] .market_listing_item_name_link:not([done])');
                AddSelectedAllOverpricesButton('buy_orders');
                // loadProgress(buttonLoadPricesForBuy, listings.length);
                if (listingsNotDone.length === 0) {
                  $J(buttonLoadPricesForBuy).removeClass('animated-background');
                }
              }

              if (data.success && data.sell_order_graph) {
                SIH?.global?.SihUserPrices?.sendItemData(data, +appId, marketHashName, +currencyId);
              }
            }
            else {
              console.log('Error! Many request');
            }

          })
        },
        error: function (XMLHttpRequest, textStatus, errorThrown) {
          console.log(textStatus);
        }
      })
    }, 3000*(index+1))

  })
}

var FindLoadedPriceForRow = function (tableId) {
  if (tableId === 'sell_listings') {
      const listings = $J('#tabContentsMyActiveMarketListingsRows .market_listing_row[id^="mylisting"]');
      let loadFlag = false;
      $J(listings).each((index, element) => {
        const currentRowId = $J(element).attr('id').replace(/mylisting_/g, '').trim();
        $J(rowIdsArr).each((idx, id) => {
          if (id === currentRowId) {
            loadFlag = true;
          }
        })
      })
      if (loadFlag) {
        setTimeout(()=> {
          FetchAllItemsPrices(tableId);
        }, 500)

      }
  }


}


var statMarketPage = statMarketPage || (() => {
  const register = () => {
    const timeout = setTimeout(() => {
      clearTimeout(timeout)

      const data = {
        adId: 5,
        partner: 'sih',
        action: 'show',
        adLocation: 'market-page'
      };

      chrome.runtime.sendMessage(SIHID, {type: "AD_HIT_STORE", data});
    }, 500)
  }

  return {register}
})();

var marketHistoryButton = marketHistoryButton || (() => {
  const register = () => {
    const timeout = setTimeout(() => {
      clearTimeout(timeout)

      const data = {
        adId: 6,
        partner: 'sih',
        action: 'click',
        adLocation: 'market-history-button'
      };

      chrome.runtime.sendMessage(SIHID, {type: "AD_HIT_STORE", data});
    }, 500)
  }

  return {register}
})();

function loadButtonUp() {
  $J('body').append('<div id="button_up"></div>');

  $J(document).ready(function () {
    const button = $J('#button_up');
    $J(window).scroll(function () {
      if ($J(this).scrollTop() > 300) {
        button.fadeIn();
      } else {
        button.fadeOut();
      }
    });
    button.on('click', function () {
      $J('body, html').animate({
        scrollTop: 0
      }, 800);
      return false;
    });
  });
}

var ImprovedMyMarketHistoryNav = ImprovedMyMarketHistoryNav || (() => {
  const renderControls = () => {

    const controls = $J('#tabContentsMyMarketHistory_ctn');

    controls.find('#pageinput_index').remove();
    controls.find('#pagebtn_page').remove();

    controls.find('#tabContentsMyMarketHistory_controls').after(`<div class="market_paging_controls" style="margin-right: 24px;">
            <input id="pageinput_index" min="1" value="${(g_oMyHistory.m_iCurrentPage || 0) + 1}" max="${g_oMyHistory.m_cMaxPages || 1}" class="selectableText filter_search_box nav-page-index" type="number" style="height: 16px;width: 30px;margin-top: -1px;"></input>
            <a id="pagebtn_page" class="pagebtn" style="margin-left: 3px;">Go</a>
            </div>
        `);

    const pageButton = controls.find('#pagebtn_page');
    const pageIndexInput = controls.find('#pageinput_index');

    return {
      controls,
      pageButton,
      pageIndexInput
    };
  };

  const addEventListeners = ({pageButton, pageIndexInput}) => {
    pageButton.click(() => {
      const page = pageIndexInput.val() - 1;
      g_oMyHistory.GoToPage(page)
    });
  };

  const init = () => {
    try {
      const $controls = renderControls();
      addEventListeners($controls);
    } catch (error) {
      console.error(error)
    }
  }

  return {
    init
  }
})();

function linkInventory() {
  $J(`.market_listing_row.market_recent_listing_row[id*=history_row]`).each((ind, elm) => {

    const $itemRowBlock = $J(elm);
    const name = $itemRowBlock.find('.market_listing_item_name').text();

    let iconUrl = '';
    const iconSrc =  $itemRowBlock.find('img').attr('src');
    if (iconSrc) {
      iconUrl = iconSrc.match(/image\/(.*)\//)[1];
    }

    const assetItemObj = assetList.get(iconUrl);

    const link = $itemRowBlock.find('.market_listing_item_name').find('a');

    if (assetItemObj && assetItemObj[name].market_hash_name && assetItemObj[name].appid && link.length === 0) {

      const marketLink = `${window.location.protocol}//steamcommunity.com/market/listings/${assetItemObj[name].appid}/${encodeURIComponent(assetItemObj[name].market_hash_name)}`;

      $itemRowBlock.find('.market_listing_item_name').html(`<a href="${marketLink}" target="_blank">${name}</a>`);

    }
  })
}

function marketMyHistoryRequestOnSuccessAfter(url, data, transport) {

  const assets = transport.responseJSON.assets;
  for (const appId in assets) {
    const items = assets[appId][1] || assets[appId][2] || assets[appId][6];

    for (const key in items) {
      // icon_url key is need for exterior weapons
      const assetItemObj = assetList.get(items[key].icon_url);
      const shortName = items[key].name;

      if (assetItemObj && !assetItemObj[shortName]) {
        const obj = Object.assign(assetItemObj,  { [items[key].name] : {appid: items[key].appid, market_hash_name : items[key].market_hash_name}})
        assetList.set(items[key].icon_url, obj);
      }
      else {
        const obj = Object.assign({},  { [items[key].name] : {appid: items[key].appid, market_hash_name : items[key].market_hash_name}})
        assetList.set(items[key].icon_url, obj);
      }

    }
  }

  RenderPriceButtons();
  linkInventory()
}

if (IS_ENABLED_SIH) {
  $J(function () {

    SIH?.filterMarketHistory?.selectTabMarket();
    loadButtonUp();

    $J('#tabMyMarketHistory').click(function () {
      marketHistoryButton.register();
    });

    // var btReload = CreateMarketActionButton('green', 'javascript:void(0)', SIHLang.market.reloadlistings);
    // $J(btReload).attr('accesskey', 'r');
    var btReload = $J(`<a class="btnControl" href="javascript:void(0)" accesskey="r" title="${SIHLang.market.reloadlistings}">
          <span class="icon-reload"></span>
        </a>`);
    btReload.click(function () {
      // ReloadListings();
      htmlListings = '';
      $ACTIVE_LISTING_ROWS = null;
      RefreshMyMarketListings();
      // buyProgressBarWidth = 0;
    });
    $J('.pick_and_sell_button .item_market_action_button_contents').css({minWidth: '80px'});
    if ($J('#tabContentsMyListings #tabContentsMyActiveMarketListingsTable:not(:has(.market_listing_table_message))').length) {
      $J('.pick_and_sell_button').prepend(btReload);
    }

    jQuery.expr[":"].Contains = jQuery.expr.createPseudo(function (arg) {
      return function (elem) {
        return jQuery(elem).text().toUpperCase().indexOf(arg.toUpperCase()) >= 0;
      };
    });

    if (window.bookmarkeditems) {
      var bookmarkcount = 0;
      if (window.bookmarkeditems) {
        for (var i in window.bookmarkeditems)
          bookmarkcount++;
      }
      if (bookmarkcount) {
        var ftab = $J('<a id="tabMyBookmarks" class="market_tab_well_tab market_tab_well_tab_inactive" href="#">' +
          '<span class="market_tab_well_tab_left"></span>' +
          '<span class="market_tab_well_tab_contents">' + SIHLang.market.mybookmarks + '<span class="my_market_header_count">(<span id="my_market_activelistings_number">' + bookmarkcount + '</span>)</span>' +
          '</span>' +
          '<span class="market_tab_well_tab_right"></span>' +
          '<span class="market_tab_well_tab_preload"></span>' +
          '</a>');

        $J('#myMarketTabs .market_tab_well_tabs').append('&nbsp;').append(ftab);

        var fdiv = $J('<div id="tabContentsMyBookmarks" class="my_listing_section market_content_block" style="display:none">' +
          '<div style="text-align: center"><img src="//steamcommunity-a.akamaihd.net/public/images/login/throbber.gif" alt="Loading"></div></div>');
        $J('#tabContentsMyMarketHistory').after(fdiv);
        ftab.click(function (e) {
          $J('#tabContentsMyListings, #tabContentsMyMarketHistory').hide();
          $J('#tabContentsMyBookmarks').show();
          $J('#tabMyListings, #tabMyMarketHistory').removeClass('market_tab_well_tab_active').addClass('market_tab_well_tab_inactive');
          $J('#tabMyBookmarks').removeClass('market_tab_well_tab_inactive').addClass('market_tab_well_tab_active');
          if (bookmarksLoaded) {
            UpdateBookmarksPrices();
          } else {
            ShowBookmarks();
          }
          e.preventDefault();
        });

        $J('#tabMyListings, #tabMyMarketHistory').click(function () {
          $J('#tabContentsMyBookmarks').hide();
          $J('#tabMyBookmarks').removeClass('market_tab_well_tab_active').addClass('market_tab_well_tab_inactive');
        });

        var sortByName = function (a, b) {
          var an = $J(a).find('.market_listing_item_name_link').text(),
            bn = $J(b).find('.market_listing_item_name_link').text();

          if (an > bn) {
            return 1 * oder;
          }
          if (an < bn) {
            return -1 * oder;
          }
          return 0;
        };

        var sortByPrice = function (a, b) {
          var an = getPriceAsInt($J(a).find('.bookmark-price').text()),
            bn = getPriceAsInt($J(b).find('.bookmark-price').text());

          if (an == bn) {
            an = $J(a).find('.market_listing_item_name_link').text(),
              bn = $J(b).find('.market_listing_item_name_link').text();
          }

          if (an > bn) {
            return 1 * oder;
          }
          if (an < bn) {
            return -1 * oder;
          }
          return 0;
        };

        var sortByVolume = function (a, b) {
          var an = parseInt(getPriceAsInt($J(a).find('.bookmark-volume').text())),
            bn = parseInt(getPriceAsInt($J(b).find('.bookmark-volume').text()));

          if (an == bn) {
            an = $J(a).find('.market_listing_item_name_link').text(),
              bn = $J(b).find('.market_listing_item_name_link').text();
          }

          if (an > bn) {
            return 1 * oder;
          }
          if (an < bn) {
            return -1 * oder;
          }
          return 0;
        };

        $J('#tabContentsMyBookmarks').on('click', '.market_sortable_column', function () {
          var $parent = $J(this);
          var sortFunc = sortByName;
          if ($J(this).text().startsWith('PRICE')) {
            sortFunc = sortByPrice;
          } else if ($J(this).text().startsWith('VOLUME')) {
            sortFunc = sortByVolume;
          }

          $J('#tabContentsMyBookmarks .market_sortable_column').find('.market_sort_arrow').hide();
          oder = 1;
          if ($parent.find('.market_sort_arrow').is(':contains("▲")')) {
            oder = -1;
            $parent.find('.market_sort_arrow').text('▼');
          } else {
            $parent.find('.market_sort_arrow').text('▲');
          }

          $parent.find('.market_sort_arrow').show();
          var $rows = $J('#tabContentsMyBookmarks').find('.market_home_listing_table'),
            $rowsli = $rows.children('.market_listing_row');

          $rowsli.sort(sortFunc);

          $rowsli.detach().appendTo($rows);
        });
      }
    }

    $J('.my_listing_section.market_home_listing_table .market_listing_table_header').each(function () {
      const $header = $J(this);
      if ($header.parent().has('div[id^="mylisting"]').length > 0) {
        $J(`<span class="market_listing_right_cell market_listing_minimum can_combine" style="width: 120px;">${SIHLang.market.minimum}</span>`).insertAfter($header.find('.market_listing_my_price'));
      }
      AddSortableColumns($header);
    });
    // UpdateTotalListings();
    // AddFilter();
    if (LoadRecentListings) {
      LoadRecentListings = function (type, rows) {
        if (g_bBusyLoadingMore) {
          return;
        }

        var elRows = $(rows);

        elRows.update();

        g_bBusyLoadingMore = true;
        new Ajax.Request('//steamcommunity.com/market/recent', {
          method: 'get',
          parameters: {
            country: g_strCountryCode,
            language: g_strLanguage,
            currency: typeof (g_rgWalletInfo) != 'undefined' ? g_rgWalletInfo['wallet_currency'] : 1      //time: g_rgRecents[type]['time'],
            //listing: g_rgRecents[type]['listing']
          },
          onSuccess: function (transport) {
            if (transport.responseJSON) {
              var response = transport.responseJSON;

              if (response.assets.length != 0) {
                g_rgRecents[type]['time'] = response.last_time;
                g_rgRecents[type]['listing'] = response.last_listing;

                elRows.update(response.results_html);

                MergeWithAssetArray(response.assets);
                MergeWithListingInfoArray(response.listinginfo);
                MergeWithAppDataArray(response.app_data);
                eval(response.hovers);
              }
            }
          },
          onComplete: function () {
            g_bBusyLoadingMore = false;
            FraudAlert();
          }
        });
      }
    }

    // tabContentsMyListings
    // tabContentsMyActiveMarketListingsTable
    // tabContentsMyActiveMarketListingsRows
    // g_bBusyLoadingMyMarketListings
    // g_oMyListings
    // RefreshMyMarketListings
    orgRefreshMyMarketListings = RefreshMyMarketListings;
    RefreshMyMarketListings = function (bScrollIntoView) {
      if (g_bBusyLoadingMyMarketListings) {
        return;
      }

      g_bBusyLoadingMyMarketListings = true;
      var elMyMarketListings = $('tabContentsMyListings');
      new Ajax.Request('//steamcommunity.com/market/mylistings', {
        method: 'get',
        parameters: {
          count: g_nMySellListingsPageSize
        },
        onSuccess: function (transport) {
          if (transport.responseJSON) {
            var response = transport.responseJSON;

            elMyMarketListings.innerHTML = response.results_html;
            $('my_market_activelistings_number').update(response.num_active_listings);

            MergeWithAssetArray(response.assets);
            eval(response.hovers);
            RemoveTotalAndFilter();
            $J('.my_listing_section.market_home_listing_table .market_listing_table_header').each(function () {
              const $header = $J(this);
              if ($header.parent().has('div[id^="mylisting"]').length > 0) {
                $J(`<span class="market_listing_right_cell market_listing_minimum can_combine" style="width: 120px;">${SIHLang.market.minimum}</span>`).insertAfter($header.find('.market_listing_my_price'));
              }
              AddSortableColumns($header);
            });
            UpdateTotalListings();
            AddFilter();
            if (window.highlight) {
              FetchAllItemsPrices('sell_listings');
            }
            if (window.highlight_await) {
              FetchAllItemsPrices('await_listings');
            }

            if (response.total_count > response.pagesize) {
              g_oMyListings = new CAjaxPagingControls(
                {
                  query: '',
                  total_count: response.total_count,
                  pagesize: response.pagesize,
                  prefix: 'tabContentsMyActiveMarketListings',
                  class_prefix: 'market'
                }, '//steamcommunity.com/market/mylistings/'
              );

              g_oMyListings.SetResponseHandler(function (response) {
                MergeWithAssetArray(response.assets);
                eval(response.hovers);
                FindLoadedPriceForRow('sell_listings');
                setTimeout(()=> {
                  AddSelectedAllOverpricesButton('buy_orders');
                  AddSelectedAllOverpricesButton('await_listings');
                }, 500)
                if (window.highlight) {
                  FetchAllItemsPrices('sell_listings');
                }
                if (window.highlight_await) {
                  FetchAllItemsPrices('await_listings');
                }


                RemoveTotalAndFilter();
                UpdateTotalListings();
                AddFilter();
              });

              g_nMySellListingsPageSize = response.pagesize;
              $J('#my_listing_pagesize_10').addClass('whiteLink').removeClass('disabled');
              $J('#my_listing_pagesize_30').addClass('whiteLink').removeClass('disabled');
              $J('#my_listing_pagesize_100').addClass('whiteLink').removeClass('disabled');
              $J('#my_listing_pagesize_' + g_nMySellListingsPageSize).removeClass('whiteLink').addClass('disabled');

              if (bScrollIntoView) {
                var elTable = $J('#tabContentsMyActiveMarketListingsTable').get(0);
                if (typeof elTable.scrollIntoView !== 'undefined') {
                  elTable.scrollIntoView();
                }
              }
            }
          }
        },
        onComplete: function () {
          g_bBusyLoadingMyMarketListings = false;
          addHideListingButton();
          addControlButtonsForAutoLoadPrices();
          if (window.highlight_buy) {
            getMaxPriceForBuyOrdersListing();
          }
          SetPhaseColors();
        }
      });
    };
    Market_SetActiveLisitingsPerPage(g_nMySellListingsPageSize);

    if (typeof (window.historypagesize) !== 'undefined' && window.historypagesize != 10) {
      orgLoadMarketHistory = LoadMarketHistory;
      LoadMarketHistory = function () {
        if (g_bBusyLoadingMarketHistory) {
          return;
        }

        g_bBusyLoadingMarketHistory = true;
        var elMyHistoryContents = $('tabContentsMyMarketHistory');
        new Ajax.Request('//steamcommunity.com/market/myhistory', {
          method: 'get',
          parameters: {
            count: window.historypagesize
          },
          onSuccess: function (transport) {
            if (transport.responseJSON) {
              var response = transport.responseJSON;

              elMyHistoryContents.innerHTML = response.results_html;

              MergeWithAssetArray(response.assets);
              eval(response.hovers);

              g_oMyHistory = new CAjaxPagingControls(
                {
                  query: '',
                  total_count: response.total_count,
                  pagesize: response.pagesize,
                  prefix: 'tabContentsMyMarketHistory',
                  class_prefix: 'market'
                }, '//steamcommunity.com/market/myhistory/'
              );

              g_oMyHistory.SetResponseHandler(function (response) {
                MergeWithAssetArray(response.assets);
                eval(response.hovers);
              });
            }
          },
          onComplete: function () {
            g_bBusyLoadingMarketHistory = false;
          }
        });
      }
    }
    //$J('#sellListingsMore').html('Show more (alt + S)');
    //$J('#sellListingsMore').attr('accesskey', 's');
    if (window.highlight) {
      FetchAllItemsPrices('sell_listings');
    }
    if (window.highlight_await) {
      FetchAllItemsPrices('await_listings');
    }
    $J('#mainContents')
      .on('click', '#tabContentsMyMarketHistory_links .market_paging_pagelink', function () {
        startPage = (parseInt($J(this).text()) - 1) * window.historypagesize;
      })
      .on('click', '#tabContentsMyMarketHistory_btn_next', function () {
        startPage += window.historypagesize;
      })
      .on('click', '#tabContentsMyMarketHistory_btn_prev', function () {
        startPage -= window.historypagesize;
      });

    statMarketPage.register();
  });


  // Prototype Steam

  let AjaxRequestMaster = Ajax.Request;
  Ajax.Request = function (url, data) {
    data.sihData = data.sihData || {}

    const onSuccess = data.onSuccess;
    data.onSuccess = function (transport) {

      if (url.indexOf('/market/myhistory') > -1) {
        SIH?.filterMarketHistory?.marketMyHistoryRequestOnSuccessBefore();
      }

      onSuccess(transport)

      if (url.indexOf('/market/myhistory') > -1) {
        SIH?.filterMarketHistory?.marketMyHistoryRequestOnSuccessAfter(url, data, transport)
        marketMyHistoryRequestOnSuccessAfter(url, data, transport)

      }
    }

    const onFailure = data.onFailure;
    data.onFailure = function (transport) {
      if (url.indexOf('/market/myhistory') > -1) {
        SIH?.filterMarketHistory?.marketMyHistoryRequestOnFailureBefore(url, data, transport)
      }
      onFailure(transport);
    }

    if (url.indexOf('/market/myhistory') > -1) {
      SIH?.filterMarketHistory?.marketMyHistoryRequestBefore(url, data);
      SIH?.filterMarketHistory?.marketMyHistoryRequestOnSuccessBefore();
    }

    new AjaxRequestMaster(url, data);
  }
  Ajax.Request.__proto__ = AjaxRequestMaster;
}

//------------------------------------------------------------------------ Market graphs

var cacheHist = {lastIdx: -1, lastCount: -1};
var missingIdx = [];
var cacheSales = {plus: {}, minus: {}};
var _maxSize = 1000;
var totalPlus = 0, totalMinus = 0;
var regHis = /<div class="market_listing_left_cell market_listing_gainorloss">\s+?([\+\-])\s+?<\/div>[\s\S]+?<span class="market_listing_price">([\s\S]+?)<\/span>[\s\S]+?<div class="market_listing_right_cell market_listing_listed_date">([\s\S]+?)<\/div>/gmi;
var ProcessPriceData = function (res) {
  var m;
  var htmlres = res.results_html;
  while (m = regHis.exec(htmlres)) {
    var sign = m[1].trim(), price = m[2].trim(), date = m[3].trim();

    var pp = /([\d\.,]+)/.exec(price.replace(/\&#.+?;/g, '').replace(' p&#1091;&#1073;.', '').replace(/\s/, ''));

    if (pp) {
      pp = pp[1].replace(/,(\d\d)$/g, '.$1').replace(/.(\d\d\d)/g, '$1');
    } else {
      pp = 0;
    }

    if (sign === '-') {
      totalMinus += parseFloat(pp);
    } else {
      totalPlus += parseFloat(pp);
    }
  }
  totalMinus = parseFloat(totalMinus.toFixed(2));
  totalPlus = parseFloat(totalPlus.toFixed(2));

  setTimeout(function () {
    GetPriceHistory(cacheHist.lastIdx + _maxSize);
  }, 5000);
};

var GetPriceHistory = function (startIdx) {
  if (typeof (startIdx) != 'undefined') {
    var count = (cacheHist.lastCount - startIdx < _maxSize ? cacheHist.lastCount - startIdx : _maxSize),
      start = cacheHist.lastCount - startIdx - count;
    if (count <= 0) return;
    $J.ajax({
      url: '//steamcommunity.com/market/myhistory/render/',
      data: {start: start, count: count},
      success: function (res) {
        if (res.success) {
          cacheHist.lastCount = res.total_count;
          cacheHist.lastIdx = startIdx;
          ProcessPriceData(res);
          //setTimeout(function () {
          //    GetPriceHistory(0);
          //});
        } else {
          setTimeout(function () {
            GetPriceHistory(startIdx);
          }, 500);
        }
      }
    });
  } else {
    totalPlus = 0, totalMinus = 0;
    $J.ajax({
      url: '//steamcommunity.com/market/myhistory/render/?start=0&count=1',
      success: function (res) {
        if (res.success) {
          cacheHist.lastCount = res.total_count;
          setTimeout(function () {
            GetPriceHistory(0);
          }, 500);
        } else {

        }
      }
    });
  }
};
