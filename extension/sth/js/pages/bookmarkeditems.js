const g_rgWalletInfo = {
  wallet_fee: 1,
  wallet_fee_base: 0,
  wallet_fee_minimum: 1,
  wallet_fee_percent: 0.05,
  wallet_publisher_fee_percent_default: 0.10,
  wallet_currency: 1
};

const getPriceValueAsInt = (strAmount) => {
  if (!strAmount) {
    return 0;
  }

  // strip the currency symbol, set commas to periods, set .-- to .00
  strAmount = strAmount
    .replace(
      GetCurrencySymbol(
        GetCurrencyCode(g_rgWalletInfo['wallet_currency'])
      ),
      ''
    )
    .replace(',', '.')
    .replace('.--', '.00');

  const flAmount = parseFloat(strAmount) * 100;
  const nAmount = Math.floor(isNaN(flAmount) ? 0 : flAmount + 0.000001); // round down

  return Math.max(nAmount, 0);
}

const getCategories = () => {
  return new Promise((resolve) => chrome.storage.sync.get({
    bookmarkscategories: {},
    lang: '',
    currency: ''
  }, resolve));
};

const getBookmarks = () => {
  return new Promise((resolve) => chrome.storage.local.get({
    bookmarks: null
  }, ({bookmarks}) => resolve(bookmarks)));
};

const renderCategoriesSelector = ($container, categoriesData) => {
  const $selectBlock = $(`
        <label for="cb_bookmarkscategories" data-i18n="bookmarks.selectcat">Select category</label>
        <select id="cb_bookmarkscategories">
        </select>
        <a href="${chrome.runtime.getURL('/html/bookmarks.html')}" target="_blank" data-i18n="bookmarks.manage">Manage categories</a>
        <!--
        <button
            id="sih-export"
            style="float: right; margin-right: 0px;"
            class="custom-button green import-export-button"
            data-i18n="bookmarks.export"
        >
            Export
        </button>
        <button
            id="sih-import"
            style="float: right; margin-right: 5px;"
            class="custom-button green import-export-button"
            data-i18n="bookmarks.import"
        >
            Import
        </button>
        -->
        <input type="file" id="sih-import-input" accept=".json" style="display:none"/>
    `);
  $container.append($selectBlock);

  renderCategoriesSelectOptions(
    $('#cb_bookmarkscategories'),
    categoriesData.bookmarkscategories
  );

  return $selectBlock;
};

const renderCategoriesSelectOptions = ($select, categories) => {
  $select.find('option').remove();
  $select.append(`<option value="all" data-i18n="controls:market.all">All</option>`)
  $select.append(`<option value="all" data-i18n="controls:market.general">General</option>`)
  Object
    .keys(categories)
    .forEach(key => $select.append(`<option value="${key}">${categories[key]}</option>`));
};

const getItemPrice = (url, $row) => {
  return new Promise((success, error) => {
    PriceQueue.GetPrice({
      method: 'GET', url, innerDiv: $row, success, error
    });
  });
};

const renderPrice = ({success, lowest_price, median_price, volume}, $row) => {
  if (success) {
    $row.find('.bookmark-lowest-price').html(lowest_price || '');
    $row.find('.bookmark-median-price').html(median_price || '');

    var inputValue = getPriceValueAsInt(lowest_price);
    var nAmount = inputValue;
    var priceWithoutFee = null;
    if (inputValue > 0 && nAmount == parseInt(nAmount)) {
      var feeInfo = CalculateFeeAmount(nAmount, g_rgWalletInfo['wallet_publisher_fee_percent_default']);
      nAmount = nAmount - feeInfo.fees;
      priceWithoutFee = v_currencyformat(nAmount, GetCurrencyCode(g_rgWalletInfo['wallet_currency']));
    }

    $row.find('.bookmark-seller-price').html((priceWithoutFee ? `(${priceWithoutFee})` : ''));

    var volume = volume ? volume : '';
    $row.find('.bookmark-volume').html(volume);
  }
};

const renderItem = ($container, item) => {
  console.log(item)
  const name = (item.name || '').toLocaleLowerCase().indexOf('script') === -1 ? item.name : 'No item';

  var $row = $('<div class="bookmark-row" data-cat="' + (item.cat || '') + '" data-hash="' + item.url + '" />');
  $row.append('<div class="name">' +
    '<img src="' + item.img.replace('360fx360f', '38fx38f') + '" style="border-color: ' + item.color + '; width: 38px; height: 38px;" class="market_listing_item_img" alt="">' +
    '<span style="color: ' + item.color + ';"><a href="' + item.url + '" title="' + name + '" target="_blank">' + name + '</a></span><br>' +
    '<span>' + (item.gamename || '---') + '</span></div>');
  $row.append('<div class="volume"><span class="bookmark-volume">Loading...</span><br /><span class="bookmark-median-price"></span></div>');
  $row.append('<div class="price"><span class="bookmark-lowest-price">Loading...</span><br /><span class="bookmark-seller-price"></span></div>');
  $row.append('<div class="remove"><span data-hash="' + item.hashmarket + '" class="remove-bookmark" title="Remove">x</span></div>');

  $container.append($row);

  return $row;
};

const createItemUrl = ({appid, hashmarket}, currency) => {
  const name = decodeURIComponent(hashmarket.substring(hashmarket.indexOf('/') + 1));
  return `https://steamcommunity.com/market/priceoverview/?appid=${appid}&country=US&currency=${currency}&market_hash_name=${name}`;
};

const importBookmarks = ($importInput) => {
  return new Promise((resolve) => {
    $importInput.on('change', (event) => {
      const {files} = event.target;
      const reader = new FileReader();
      reader.onload = function () {
        resolve(this.result);
        $importInput.val('');
      };

      reader.readAsText(files[0]);
    });

    $importInput.click();
  });
};

const exportBookmarks = (data) => {
  const textData = JSON.stringify(data, null, 2);
  const vLink = document.createElement('a'),
    vBlob = new Blob([textData], {type: 'octet/stream'}),
    vName = 'SIH-Bookmarks.json',
    vUrl = window.URL.createObjectURL(vBlob);
  vLink.setAttribute('href', vUrl);
  vLink.setAttribute('download', vName);
  vLink.click();
};

const renderBookmarks = (bookmarks, currency) => {
  $('#div_Cnt .bookmark-row').remove();

  $.each(bookmarks, async (_, item) => {
    if (!item || !item.hashmarket || !item.img) return;

    const $row = renderItem($('#div_Cnt'), item);
    const url = createItemUrl(item, currency);
    renderPrice(await getItemPrice(url, $row), $row);
  });
};

(async () => {
  const categoriesData = await getCategories();
  let currency = 1;
  if (categoriesData.currency != '') {
    g_rgWalletInfo.wallet_currency = currency = categoriesData.currency;
  }
  const $categoriesPanel = $('#div_Categories');
  const $selectBlock = renderCategoriesSelector($categoriesPanel, categoriesData);
  $selectBlock.change((e) => {
    const category = e.target.value;
    $('#div_Cnt .bookmark-row').each((_, elem) => {
      if (category == 'all') $(elem).show();
      else if ($(elem).data('cat') == category) $(elem).show();
      else $(elem).hide();
    })
  });

  const bookmarks = await getBookmarks();

  if (bookmarks) {
    renderBookmarks(bookmarks, currency);
  }

  const $exportButton = $('#sih-export');
  const $importInput = $('#sih-import-input');
  const $importButton = $('#sih-import');

  $exportButton.on('click', () => exportBookmarks({
    bookmarks: bookmarks || {},
    categories: categoriesData.bookmarkscategories || {}
  }));

  $importButton.on('click', async () => {
    const data = await importBookmarks($importInput);
    const {bookmarks, categories} = JSON.parse(data);

    if (!bookmarks || !categories) {
      return console.error('Import: file format error');
    }

    chrome.storage.sync.set({bookmarkscategories: categories});
    chrome.storage.local.set({bookmarks});

    renderBookmarks(bookmarks, currency);
    renderCategoriesSelectOptions($('#cb_bookmarkscategories'), categories);
  });
})();

$('#div_Cnt').on('click', '.remove-bookmark', function () {
  var hashmarket = $(this).data('hash');
  $(this).parents('.bookmark-row').hide(200);

  chrome.storage.local.get({
    bookmarks: null
  }, function (items) {
    var bookmarks = items.bookmarks || {};
    if (bookmarks[hashmarket]) {
      delete bookmarks[hashmarket];
    }

    chrome.storage.local.set({
      bookmarks: bookmarks
    });
  });
});

$(function () {
  chrome.browserAction.setPopup({
    popup: "html/bookmarkeditems.html"
  });
});
