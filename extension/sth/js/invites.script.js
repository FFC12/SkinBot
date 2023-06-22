$J(function () {
  // TODO: Переделать листенер для кнопки (переместить в бандл invite.js)
  SIH?.mainPage?.RequestListener();
  $J(document).ajaxComplete(function() {
    setTimeout(()=> {
      SIH?.mainPage?.RequestListener();
    }, 100);
  })
});
