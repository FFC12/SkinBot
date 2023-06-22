window.PriceUtils = window.PriceUtils || (() => {

  /**
   * Calculate publisher fee
   * @param {object} rgItem steam object: inventory item
   * @param {object} g_rgWalletInfo steam object: user wallet info
   * @param {number} defaultFeeValue default fee value
   */
  const publisherFee = (rgItem, g_rgWalletInfo, defaultFeeValue = false) => {
    const { description, market_fee } = rgItem;
    const { wallet_publisher_fee_percent_default } = g_rgWalletInfo;

    return market_fee
      || (description && description.market_fee)
      || wallet_publisher_fee_percent_default
      || defaultFeeValue;
  };

  /**
   * Calculate iteam price for buyer (with according to Steam algorithm)
   * @param {number} receivedAmount seller price
   * @param {number} publisherFee publisher fee
   * @param {object} g_rgWalletInfo steam object: user wallet info
   */
  const steamBuyerPrice = (receivedAmount, publisherFee, g_rgWalletInfo) => {
    const { wallet_fee_percent, wallet_fee_minimum, wallet_fee_base } = g_rgWalletInfo;
    
    const nSteamFee = parseInt(
      Math.floor(
        Math.max(
          receivedAmount * parseFloat(wallet_fee_percent),
          wallet_fee_minimum
        )
        + parseInt(wallet_fee_base)
      )
    );
    const nPublisherFee = parseInt(
      Math.floor(
        publisherFee > 0
          ? Math.max(receivedAmount * publisherFee, 1)
          : 0
      )
    );

    return receivedAmount + nSteamFee + nPublisherFee;
  };

  return {
    publisherFee,
    steamBuyerPrice
  }
})();