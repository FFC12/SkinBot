
function loadDialogHTML() {
  let dialog =
    `<div id="group_inventory_dialog" class="newmodal" style="display: none; min-width: 600px">
  <div class="newmodal_header_border">
    <div class="newmodal_header">
      <span id="group_inventory_dialog_title"></span>
      <div id="group_inventory_dialog_cancel" class="newmodal_close"></div>
    </div>
  </div>
  <div class="newmodal_content_border">
    <div class="newmodal_content">
      <div id="group_inventory_dialog_content">
       <div class="sih-table">
  <div class="sih-table-row">
    <div class="sih-table-cell" style="width: 317px;text-align:center;padding: 10px;">
      <div class="sih-table">
        <div class="sih-table-row">
          <div class="sih-table-cell center" style="padding: 5px">
            <img id="group_inventory_dialog_icon">
          </div>
        </div>
        <div class="sih-table-row">
          <div class="sih-table-cell center inventory-name" style="padding: 5px">

          </div>
        </div>
        <div class="sih-table-row">
          <div class="sih-table-cell" style="padding: 5px">
            Steam Price: <span style="color: #FBFC55" class="inventory-price">---</span>
          </div>
        </div>
        <div class="sih-table-row">
          <div class="sih-table-cell" style="padding: 5px">
            Total inventory: <span style="color: #7BE9AC" class="inventory-total-trade-ban"></span>
          </div>
        </div>
      </div>
    </div>
    <div class="sih-table-cell" style="text-align:center;padding: 10px;">
      <div id="group_inventory_dialog_standard_inventory" style="width: 300px">
        <div id="group_inventory_dialog_standard_inventory_view" class="sih-table" style="width: 100%">
            <div class="sih-table-row">
          <div class="sih-table-cell center" style="padding: 10px;font-size: 16px">Trade ban</div>
        </div>
            <div class="sih-table-row">
          <div class="sih-table-cell">
            <div id="group_inventory_dialog_trage_ban_list">



            </div>
          </div>
        </div>
        </div>
        <div id="group_inventory_dialog_standard_inventory_sell" class="sih-table" style="width: 100%">
           <div class="sih-table">
            <div class="sih-table-row">
              <div class="sih-table-cell center title"></div>
            </div>
            <div class="sih-table-row">
              <div class="sih-table-cell center">
              <input type="number" class="inventory_number">
                </div>
            </div>
            <div class="sih-table-row">
              <div class="sih-table-cell center">
               <button class="selected_sell_btn"></button>
</div>
            </div>
          </div>
       </div>
      </div>
      <div id="group_inventory_dialog_unique_inventory"  style="width: 530px">
            <div class="sih-table inventory_table"></div>
      </div>
    </div>
  </div>
</div>
      </div>
    </div>
  </div>
</div>
`;

  $J('body').append(dialog);
}


if (IS_ENABLED_SIH) {
  setTimeout(function () {
    loadDialogHTML()
  }, 100)
}


const GroupInventoryDialog = {
  m_bInitialized: false,
  m_fnDocumentKeyHandler: null,
  m_modal: null,
  m_elDialogContent: null,
  m_rgItem: null,
  m_isWeapon: false,
  m_elem: null,
  m_isSell: false,

  Initialize: function () {
    if ($('group_inventory_dialog_cancel')) {
      $('group_inventory_dialog_cancel').observe('click', this.OnCancel.bindAsEventListener(this));
    }

    this.m_elDialogContent = $('group_inventory_dialog');
    this.m_elDialogContent.style.visibility = 'hidden';
    this.m_elDialogContent.show();
    this.m_elDialogContent.hide();
    this.m_elDialogContent.style.visibility = '';
    this.m_bInitialized = true;
  },

  Show: function (elem, isWeapon, isSell = false) {
    if (!this.m_bInitialized) {
      this.Initialize();
    }

    if (!elem.rgItem) {
      return
    }

    this.m_elem = elem;
    this.m_rgItem = elem.rgItem;
    this.m_isWeapon = isWeapon;
    this.m_isSell = isSell;

    this.m_fnDocumentKeyHandler = this.OnDocumentKeyPress.bindAsEventListener(this);
    $(document).observe('keydown', this.m_fnDocumentKeyHandler);

    this.OnReload({
      stop: function () {
      }
    });

    this.m_modal = new CModal($J(this.m_elDialogContent));
    this.m_modal.Show();
  },

  Dismiss: function () {
    $(document).stopObserving('keydown', this.m_fnDocumentKeyHandler);
    if (this.m_modal)
      this.m_modal.Dismiss();
  },

  OnCancel: function (event) {
    this.Dismiss();
    event.stop();
  },

  OnAccept: function (event) {
    event.stop();
  },

  OnReload: function (event) {
    const _this = this
    event.stop();
    const imageName = this.m_rgItem.description.icon_url_large ? this.m_rgItem.description.icon_url_large : this.m_rgItem.description.icon_url;
    const url = ImageURL(imageName, 330, 192);
    $J('#group_inventory_dialog_icon').attr('src', url);

    this.m_rgItem.groupInventories.sort((a, b) => ((a.profile.cacheExpiration.date || 0) < (b.profile.cacheExpiration.date || 0)) ? 1 : (((b.profile.cacheExpiration.date || 0) < (a.profile.cacheExpiration.date || 0)) ? -1 : 0));

    const $standardInventory = $J('#group_inventory_dialog_standard_inventory');
    const $uniqueInventory = $J('#group_inventory_dialog_unique_inventory');

    if (this.m_isWeapon) {
      $standardInventory.hide();
      $uniqueInventory.show()
      const $elem = $uniqueInventory.find('.inventory_table');
      $elem.show();

      const isBadge = this.m_rgItem.groupInventories.find(x => x.profile.cacheExpiration.badge) != null;
      $elem.empty();
      $elem.append(`<div class="sih-table-row head" >
            <div class="sih-table-cell center col_sort" col="float">Float
                <span class="market_sort_arrow asc" style="display: none">▲</span>
                <span class="market_sort_arrow desc" style="display: none;">▼</span>
            </div>
            <div class="sih-table-cell center col_sort" col="paint" >Paint
                <span class="market_sort_arrow asc" style="display: none;">▲</span>
                <span class="market_sort_arrow desc" style="display: none;">▼</span>
            </div>
            <div class="sih-table-cell center">Stickers</div>
            ${isBadge ? '<div class="sih-table-cell center">Trade ban</div>' : ''}
          </div>`);

      const getCountSelectedGroupInventory = () => this.m_rgItem.groupInventories.filter(x => x.isSelectedForSell).length;


      this.m_rgItem.groupInventories.forEach((item, ind) => {
        const {assetid, description: {actions}} = item;
        const actionLink = actions[0].link.replace('%assetid%', assetid).replace('%owner_steamid%', g_ActiveUser.strSteamId);
        const badge = item.profile.cacheExpiration.badge;


        const uiInd = `ui_${ind}`;
        $elem.append(`<div class="sih-table-row row ${uiInd}_row ${item.isSelectedForSell ? 'selected' : ''}" >
            <div class="sih-table-cell center float_${uiInd}" style="color: #FBFC55;vertical-align: middle;">---</div>
            <div class="sih-table-cell center paint_${uiInd}" style="color:#849AEF;vertical-align: middle;">---</div>
            <div class="sih-table-cell center stickers_${uiInd}" style="color:#849AEF;vertical-align: middle;">---</div>
            ${badge ? `<div class="sih-table-cell center" style="color:#B72D23;vertical-align: middle;">${badge}</div>` : ''}
          </div>`);

        $elem.find(`.${uiInd}_row`).click(function () {

          if ($J(this).hasClass('selected')) {
            $J(this).removeClass('selected');
          } else {
            $J(this).addClass('selected');
          }
          item.isSelectedForSell = $J(this).hasClass('selected');

          const $selectedSellCancelBtn = $uniqueInventory.find('.selected_sell_cancel_btn');
          if (_this.m_rgItem.groupInventories.find(x => x.isSelectedForSell)) {
            $selectedSellCancelBtn.show();
          } else {
            $selectedSellCancelBtn.hide();
          }

          $uniqueInventory.find('.selected_sell_btn').text(SIHLang.selectItemCount.replace('$1', getCountSelectedGroupInventory()));
        });

        const stickersHtml = (item.description.descriptions.find(x => x.value.indexOf('sticker_info') > -1) || {}).value;
        if (stickersHtml) {
          $elem.find(`.stickers_${uiInd}`).html(stickersHtml);
          const titles = ($elem.find(`.stickers_${uiInd} center`)[0].outerText || '').split(',');
          const $stickersHtml = $elem.find(`.stickers_${uiInd} img`);
          $elem.find(`.stickers_${uiInd}`).empty();

          let preTitle = '';
          $stickersHtml.each((ind, elem) => {
            $J(elem).removeAttr('width').removeAttr('height');
            if (titles.length > ind) {
              let title = titles[ind];
              if (title.indexOf(':') > -1) {
                preTitle = title.split(':')[0];
                title = title.split(':')[1];
              }
              $J(elem).attr('title', `${preTitle} | ${title.trim()}`);
            }
            $elem.find(`.stickers_${uiInd}`).append(`<div class="sticker_image"><div>${elem.outerHTML}</div></div>`)

          })

          $elem.find('.sticker_image div img').click(function () {
            const url = `https://steamcommunity.com/market/search?q=${$J(this).attr('title')}`;
            window.open(url, '_blank').focus();
          })

        }
        GetFloat(actionLink).then((data) => {
          $elem.find(`.float_${uiInd}`).html(data.iteminfo.floatvalue);
          $elem.find(`.float_${uiInd}`).attr('val', data.iteminfo.floatvalue)
          $elem.find(`.paint_${uiInd}`).html(data.iteminfo.paintseed);
          $elem.find(`.paint_${uiInd}`).attr('val', data.iteminfo.paintseed)
        })
      })

      $uniqueInventory.find('.sell_buttons').remove();
      if (this.m_isSell) {

        $uniqueInventory.append(`<div class="sell_buttons" >
                <button class="selected_sell_btn float_right">${SIHLang.selectItemCount.replace('$1', getCountSelectedGroupInventory())}</button>
                <button class="selected_sell_cancel_btn float_right">${SIHLang.cancel}</button>
          </div>`);
        const $selectedSellCancelBtn = $uniqueInventory.find('.selected_sell_cancel_btn');


        if (this.m_rgItem.groupInventories.find(x => x.isSelectedForSell)) {
          $selectedSellCancelBtn.show();
        } else {
          $selectedSellCancelBtn.hide();
        }


        $selectedSellCancelBtn.click(() => {
          $J(this.m_rgItem.element).parent().find('.selectedSell').remove();
          $J(this.m_rgItem.element).removeClass('group_inventory_master_selected_sell');
          $uniqueInventory.find('.inventory_table .selected').removeClass('selected');
          this.m_rgItem.groupInventories.forEach((item) => {
            item.isSelectedForSell = false;
          });
          sellBtn();
          $selectedSellCancelBtn.hide();
          $uniqueInventory.find('.selected_sell_btn').text(SIHLang.selectItemCount.replace('$1', getCountSelectedGroupInventory()));
          SIH?.inventoryGroup?.loadGroupInventoryDialog();
        });

        $uniqueInventory.find('.selected_sell_btn').click(() => {
          $J(this.m_rgItem.element).parent().find('.selectedSell').remove();

          if (this.m_rgItem.groupInventories.find(x => x.isSelectedForSell)) {
            $J(this.m_rgItem.element).addClass('group_inventory_master_selected_sell');
            for (let i = 0; i < this.m_rgItem.groupInventories.length; i++) {
              if (this.m_rgItem.groupInventories[i].isSelectedForSell) {
                addSell(this.m_rgItem.element, this.m_rgItem.groupInventories[i], i);
              }
            }
            $selectedSellCancelBtn.show();
          } else {
            $J(this.m_rgItem.element).removeClass('group_inventory_master_selected_sell');
            $selectedSellCancelBtn.hide();
          }
          sellBtn();
          $('group_inventory_dialog_cancel').click();
          SIH?.inventoryGroup?.loadGroupInventoryDialog();
        });
      }

      $elem.find('.sih-table-row.head .col_sort').click(function () {
        const col = $J(this).attr('col');

        let typeSort = $J(this).attr('type-sort')
        typeSort = typeSort === 'desc' ? 'asc' : 'desc';
        $J(this).attr('type-sort', typeSort);

        $elem.find('.head .col_sort .market_sort_arrow').hide();

        typeSort === 'asc' ? $J(this).find('.asc').show() : $J(this).find('.desc').show();


        let arr = $elem.find('.sih-table-row.row');
        arr.sort(function (a, b) {
          let aValue = $J(a).find(`div[class*=${col}_ui]`).attr('val') || 0;
          let bValue = $J(b).find(`div[class*=${col}_ui]`).attr('val') || 0;
          aValue = parseFloat(aValue);
          bValue = parseFloat(bValue);

          if ((typeSort === 'asc' && aValue > bValue) ||
            (typeSort === 'desc' && aValue < bValue)) {
            return 1;
          } else if ((typeSort === 'asc' && aValue < bValue) ||
            (typeSort === 'desc' && aValue > bValue)) {
            return -1;
          } else {
            return 0;
          }
        });
        $elem.append(arr);
      })

    } else {
      $uniqueInventory.hide();
      $standardInventory.show();
      if (this.m_isSell) {
        $J('#group_inventory_dialog_standard_inventory_view').hide();
        const $elem = $J('#group_inventory_dialog_standard_inventory_sell');
        $elem.show();
        $elem.find('.title').html(SIHLang.howManyDoYouWantToChoose);
        $elem.find('.selected_sell_btn').text(SIHLang.selectitem);

        const $selectedSell = $J(this.m_rgItem.element).parent().find('.selectedSell');
        $elem.find('.inventory_number').val($selectedSell.length || 1);

        $elem.find('.selected_sell_btn').click(() => {

          const number = $elem.find('.inventory_number').val();
          $J(this.m_rgItem.element).parent().find('.selectedSell').remove();
          $J(this.m_rgItem.element).removeClass('group_inventory_master_selected_sell');
          if (number > 0) {
            $J(this.m_rgItem.element).addClass('group_inventory_master_selected_sell');
          }
          this.m_rgItem.groupInventories.forEach((item) => {
            item.isSelectedForSell = false;
          })
          for (let i = 0; i < this.m_rgItem.groupInventories.length && i < number; i++) {
            this.m_rgItem.groupInventories[i].isSelectedForSell = true;
            addSell(this.m_rgItem.element, this.m_rgItem.groupInventories[i], i);
          }
          sellBtn();
          $('group_inventory_dialog_cancel').click();

          SIH?.inventoryGroup?.loadGroupInventoryDialog();
        })

      } else {
        $J('#group_inventory_dialog_standard_inventory_sell').hide();
        $J('#group_inventory_dialog_standard_inventory_view').show();
        const badge = {};
        this.m_rgItem.groupInventories.forEach((item) => {
          if (item.profile.cacheExpiration.badge) {
            badge[item.profile.cacheExpiration.badge] = (badge[item.profile.cacheExpiration.badge] || 0) + 1
          }
        })
        let arr = []
        for (const key in badge) {
          arr.push(
            `
        <div class="sih-inline-table trade-ban" >
        <div class="sih-table-row">
        <div class="sih-table-cell center" style="padding: 5px">
        <span>${key}</span>
        </div>
        </div>
        <div class="sih-table-row">
        <div class="sih-table-cell center"  style="padding: 5px">
        <span style="color: #7BE9AC">${badge[key]}</span>
        </div>
        </div>
        </div>
        `)
        }

        $J('#group_inventory_dialog_trage_ban_list').empty();
        $J('#group_inventory_dialog_trage_ban_list').append(arr.join(''));
      }
    }

    $J('#group_inventory_dialog_content').find('.inventory-name').html(this.m_rgItem.description.name);

    $J('#group_inventory_dialog_content').find('.inventory-total-trade-ban').html(this.m_rgItem.description.useCountMarketHashName);

    $J('#group_inventory_dialog_content').find('.inventory-price').html('---')
    loadPriceSteamInventory(this.m_rgItem.description.market_hash_name).done((data) => {
      let text = data.lowest_price;
      if (data.volume) {
        text += ` <span style="font-size: 12px;">(${data.volume} sold in the last 24 hours)</span>`
      }
      $J('#group_inventory_dialog_content').find('.inventory-price').html(text);
    })

  },

  OnDocumentKeyPress: function (event) {
    if (event.keyCode == Event.KEY_ESC) {
      this.Dismiss();
      event.stop();
    }
  }
};
