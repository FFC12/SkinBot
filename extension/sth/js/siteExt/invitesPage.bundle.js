var SIH=function(e){function n(i){if(t[i])return t[i].exports;var r=t[i]={i:i,l:!1,exports:{}};return e[i].call(r.exports,r,r.exports,n),r.l=!0,r.exports}var t={};return n.m=e,n.c=t,n.i=function(e){return e},n.d=function(e,t,i){n.o(e,t)||Object.defineProperty(e,t,{configurable:!1,enumerable:!0,get:i})},n.n=function(e){var t=e&&e.__esModule?function(){return e.default}:function(){return e};return n.d(t,"a",t),t},n.o=function(e,n){return Object.prototype.hasOwnProperty.call(e,n)},n.p="",n(n.s=104)}({104:function(e,n,t){"use strict";Object.defineProperty(n,"__esModule",{value:!0});var i=t(89);t.d(n,"mainPage",function(){return i})},126:function(e,n){},89:function(e,n,t){"use strict";function i(){o(),r()}function r(){$J(".pending_sent_invites").find(".decline-all-sent").click(function(){$J(".search_results_sentinvites").find(".actions").length>0&&($J(this).addClass("disabled"),c())})}function c(){var e=/\(([^)]+)\)/g,n=$J(".search_results_sentinvites");$J(n).find(".actions").children(".linkStandard").each(function(n,t){var i=$J(t).attr("onclick"),r=i.match(e),c=r[0].replace(/[(-)']/g,"").trim(),o=c.split(",");setTimeout(function(){ConfirmCancelInvite(o[0],o[1]),setTimeout(function(){$J(".btn_green_steamui.btn_medium").click()},500)},1e3*(n+1))}),$J(".pending_sent_invites").find(".decline-all-sent").removeClass("disabled")}function o(){window.location.href.includes("pending")||$J(".friends_header_bg").find(".sih_panel_mode").remove()}Object.defineProperty(n,"__esModule",{value:!0}),n.RequestListener=i;var s=t(126);t.n(s)}});