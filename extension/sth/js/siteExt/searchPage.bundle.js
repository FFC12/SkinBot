var SIH=function(a){function e(t){if(n[t])return n[t].exports;var r=n[t]={i:t,l:!1,exports:{}};return a[t].call(r.exports,r,r.exports,e),r.l=!0,r.exports}var n={};return e.m=a,e.c=n,e.i=function(a){return a},e.d=function(a,n,t){e.o(a,n)||Object.defineProperty(a,n,{configurable:!1,enumerable:!0,get:t})},e.n=function(a){var n=a&&a.__esModule?function(){return a.default}:function(){return a};return e.d(n,"a",n),n},e.o=function(a,e){return Object.prototype.hasOwnProperty.call(a,e)},e.p="",e(e.s=120)}({100:function(a,e,n){"use strict";function t(){c(),i(),r()}function r(){var a=s();$J(".responsive_search_name_combined").each(function(e,n){var t=$J(n).find(".search_price").text(),r=RegExp("[0-9]");if(t.match(r)){var c=$J(n).parent().attr("data-ds-appid");$J(n).children().hasClass("sih-cart")||$J(n).parent().children().hasClass("ds_incart_flag")||($J('\n              <a href="javascript:void(0)" class="sih-cart">\n                 <div class="sih-cart__checkbox"></div>\n              </a>\n          ').appendTo(n),a.forEach(function(a){for(var e in a)e===c&&$J(n).find(".sih-cart").children(".sih-cart__checkbox").addClass("checked")}),$J(n).find(".sih-cart").click($J.debounce(300,function(){$J(this).children(".sih-cart__checkbox").toggleClass("checked");var e=$J(n).parent().attr("href");$J.ajax({method:"GET",url:e}).done(function(e){var n=0;$J(e).find(".game_purchase_action").each(function(e,t){var r=$J(t).find(".btn_addtocart").children("a").attr("href");if(r.includes("javascript:addToCart")&&0===n){var i=r.match(/[0-9]+/g);if(a){var s=a.findIndex(function(a){return a[c]===i[0]});if(-1===s){var f;a.push((f={},f[c]=i[0],f)),o(a),d()}else a.splice(s,1),o(a),d()}n++}})})})))}}),Ajax.Responders.register({onComplete:function(){$J(".responsive_search_name_combined").each(function(e,n){var t=$J(n).find(".search_price").text(),r=RegExp("[0-9]");if(t.match(r)){var c=$J(n).parent().attr("data-ds-appid");$J(n).children().hasClass("sih-cart")||$J(n).parent().children().hasClass("ds_incart_flag")||($J('\n              <a href="javascript:void(0)" class="sih-cart">\n                 <div class="sih-cart__checkbox"></div>\n              </a>\n          ').appendTo(n),a.forEach(function(a){for(var e in a)e===c&&$J(n).find(".sih-cart").children(".sih-cart__checkbox").addClass("checked")}),$J(n).find(".sih-cart").click($J.debounce(300,function(){$J(this).children(".sih-cart__checkbox").toggleClass("checked");var e=$J(n).parent().attr("href");$J.ajax({method:"GET",url:e}).done(function(e){var n=0;$J(e).find(".game_purchase_action").each(function(e,t){var r=$J(t).find(".btn_addtocart").children("a").attr("href");if(r.includes("javascript:addToCart")&&0===n){var i=r.match(/[0-9]+/g);if(a){var s=a.findIndex(function(a){return a[c]===i[0]});if(-1===s){var f;a.push((f={},f[c]=i[0],f)),o(a),d()}else a.splice(s,1),o(a),d()}n++}})})})))}})}})}function c(){var a=s();if($J(".page_content").append('\n        <div class="row">\n            <a href="https://store.steampowered.com/cart/" class="sih-cart__button sih-cart__button_green cart-counter">'+SIHLang.cart.add_to_cart+' <span class="number">'+a.length+'</span></a>\n            <a href="javascript:void(0)" class="sih-cart__button sih-cart__button_red clear-cart_button">'+SIHLang.cart.clear_all+" </a>\n        </div>\n  "),window.outerWidth>1440){var e=+$J(".page_content").css("margin-left").replace(/px/g,"").trim()+ +$J(".page_content").css("width").replace(/px/g,"").trim();$J(".page_content").find(".row").css("left",e+20)}}function i(){var a=$J(".responsive_page_frame").find(".clear-cart_button");$J(a).click(function(){var a=s();a.length=0,o(a),window.location.reload()})}function s(){var a=localStorage.getItem("SIH_CART")||"[]";return JSON.parse(a)}function o(a){var e=JSON.stringify(a);localStorage.setItem("SIH_CART",e)}function d(){var a=s(),e=$J(".responsive_page_frame").find(".cart-counter"),n=""+a.length;$J(e).children(".number").text(n)}Object.defineProperty(e,"__esModule",{value:!0}),e.load=t;var f=n(160);n.n(f)},120:function(a,e,n){"use strict";Object.defineProperty(e,"__esModule",{value:!0});var t=n(100);n.d(e,"mainPage",function(){return t})},160:function(a,e){}});