var profile=webpackJsonp_name_([5],{303:function(n,e,t){"use strict";function a(n){return function(){var e=n.apply(this,arguments);return new Promise(function(n,t){function a(i,r){try{var s=e[i](r),o=s.value}catch(n){return void t(n)}if(!s.done)return Promise.resolve(o).then(function(n){a("next",n)},function(n){a("throw",n)});n(o)}return a("next")})}}function i(n,e){if(!(n instanceof e))throw new TypeError("Cannot call a class as a function")}function r(n,e){if(!n)throw new ReferenceError("this hasn't been initialised - super() hasn't been called");return!e||"object"!=typeof e&&"function"!=typeof e?n:e}function s(n,e){if("function"!=typeof e&&null!==e)throw new TypeError("Super expression must either be null or a function, not "+typeof e);n.prototype=Object.create(e&&e.prototype,{constructor:{value:n,enumerable:!1,writable:!0,configurable:!0}}),e&&(Object.setPrototypeOf?Object.setPrototypeOf(n,e):n.__proto__=e)}Object.defineProperty(e,"__esModule",{value:!0});var o=t(11),c=t.n(o),l=t(4),p=t(14),d=t(9),f=t(23),u=(t(18),t(593)),m=t.n(u),_=t(564),v=(t.n(_),Object.assign||function(n){for(var e=1;e<arguments.length;e++){var t=arguments[e];for(var a in t)Object.prototype.hasOwnProperty.call(t,a)&&(n[a]=t[a])}return n}),h=function(n){function e(){return i(this,e),r(this,n.apply(this,arguments))}return s(e,n),e.prototype.onLoad=function(){function n(){return t.apply(this,arguments)}var t=a(regeneratorRuntime.mark(function n(){var t,a,i;return regeneratorRuntime.wrap(function(n){for(;;)switch(n.prev=n.next){case 0:return e.checkUser().then(function(){e.checkSihAppUser()}).catch(function(){e.checkUser()}),t=window.location.pathname.split("/").filter(function(n){return""!==n}),n.next=4,l.a.get({show_steamrep:p.a.show_steamrep,show_permalink:p.a.show_permalink,show_related_accounts:p.a.show_related_accounts,related_accounts:p.a.related_accounts});case 4:a=n.sent,e.renderBanTemplateBlock(a),a.show_steamrep&&2===t.length&&(i=d.a.getOtherSteamID(),e.addBanInfo(v({},{}[i]))),a.show_permalink&&e.addProfilePermalink(),e.addOtherProfileLinks(a.show_related_accounts,a.related_accounts);case 9:case"end":return n.stop()}},n,this)}));return n}(),e.getContainer=function(){var n=c()(".profile_rightcol");return n.find(".profile_in_game").length&&(n=n.find(".profile_in_game")),n},e.addProfilePermalink=function(){var n=e.getContainer();n&&n.find(".permalink .btn").click(function(){n.find("#profilelink").select(),document.execCommand("copy")})},e.setDataAboutFriend=function(){var n=c()(".profile_header"),e=c()(n).find(".playerAvatar").attr("data-miniprofile"),t="https://steamcommunity.com/tradeoffer/new/?partner="+e;c.a.ajax({url:t,method:"GET"}).done(function(n){var e=c()(n).find(".trade_partner_info_block");e&&c()(e).each(function(n,e){if(0===n){var t=c()(e).find(".trade_partner_info_text").text().trim(),a=c()(".ban-wrapper").find(".ban-info");c()(a).prepend('\n            <div class="ban-row text">\n              <span class="text_grey">'+i18next.t("controls:profile.about_friend")+':\n              </span>\n              <span class="text_grey">'+t+"\n              </span>\n          </div>\n          ")}})})},e.addOtherProfileLinks=function(n,e){var t=c()(".profile_item_links"),a=d.a.getOtherSteamID(),i=m.a.sort(function(n,e){return n.id<e.id?-1:n.id>e.id?1:0});i[0].title=""+i[0].title,n||(i=i.filter(function(n){return e[n.id]}));var r=i.map(function(n){return'\n      <div class="sih_profile_link profile_count_link ellipsis">\n        <a class="sih_icons sih_'+n.id+'_icon" href="'+n.link.replace("{{STEAM_ID}}",a)+'" target="_blank">\n          <span class="count_link_label">'+n.title+"</span>\n        </a>\n      </div>\n    "});t.append(r.join(""))},e.renderBanTemplateBlock=function(n){if(n.show_steamrep){var t=e.getContainer();if(t){var a=c()('\n       <div class="ban-wrapper ban-wrapper-template">\n        <div class="ban-info">\n        <div class="ban-row text">\n            <span class="text_grey">Joined Steam:\n            </span>\n            <span class="text">Unknown</span>\n          </div>\n          <div class="ban-row text">\n            <span class="text_grey">Community banned:\n            </span>\n            <span class="text">None</span>\n          </div>\n          <div class="ban-row text">\n            <span class="text_grey">Trade banned:\n            </span>\n             <span class="text">None</span>\n\n          </div>\n          <div class="ban-row text">\n            <span class="text_grey">VAC banned:\n            </span>\n            <span class="text">None</span>\n          </div>\n        </div>\n      ');a.append('\n           \x3c!-- <div class="rep-status">\n            <span class="text text_grey">\n              No special reputation.\n            </span>\n            <a href="javascript:void(0)"><img src="'+chrome.runtime.getURL("assets/icons/shield.svg")+'" alt="Rep status"></a>\n          </div> --\x3e\n\n          <div class="permalink">\n          <p class="title">Permanent link</p>\n          <div class="input-group">\n            <input id="profilelink" value="'+d.a.getProfileLink()+'" readonly>\n            <div class="input-group-append">\n              <button class="btn">\n                  <img src="'+chrome.runtime.getURL("assets/icons/clippy.svg")+'" alt="Copy to clipboard">\n              </button>\n            </div>\n          </div>\n        </div>\n        </div>\n'),t.append(a)}}},e.addBanInfo=function(){var n=arguments.length>0&&void 0!==arguments[0]?arguments[0]:{},a=n.CommunityBanned,i=void 0!==a&&a,r=n.EconomyBan,s=void 0!==r&&r,o=n.VACBanned,l=void 0!==o&&o,p=n.repStatus,f=void 0===p?null:p,u=e.getContainer();if(c()(u).find(".ban-wrapper.ban-wrapper-template").remove(),u){var m=c()('\n       <div class="ban-wrapper">\n        <div class="ban-info">\n         \x3c!-- <div class="ban-row text">\n            <span class="text_grey">'+i18next.t("controls:profile.communityban")+':\n            </span>\n            <span class="'+(t.i(d.j)(i)?"text_red":"text_green")+'">'+(t.i(d.j)(i)?"Banned":i18next.t("controls:profile.none"))+'\n            </span>\n          </div>\n          <div class="ban-row text">\n            <span class="text_grey">'+i18next.t("controls:profile.tradeban")+':\n            </span>\n            <span class="'+(t.i(d.j)(s)?"text_red":"text_green")+'">'+(t.i(d.j)(s)?s:i18next.t("controls:profile.none"))+'\n            </span>\n          </div>\n          <div class="ban-row text">\n            <span class="text_grey">'+i18next.t("controls:profile.vacban")+':\n            </span>\n            <span class="'+(t.i(d.j)(l)?"text_red":"text_green")+'">'+(t.i(d.j)(l)?"Banned":i18next.t("controls:profile.none"))+"\n            </span>\n          </div>--\x3e\n        </div>\n      ");null===f&&m.append('<div class="permalink">\n          <p class="title">Permanent link</p>\n          <div class="input-group">\n            <input id="profilelink" value="'+d.a.getProfileLink()+'" readonly>\n            <div class="input-group-append">\n              <button class="btn">\n                  <img src="'+chrome.runtime.getURL("assets/icons/clippy.svg")+'" alt="Copy to clipboard">\n              </button>\n            </div>\n          </div>\n        </div>\n        </div>\n\n'),u.append(m),e.setDataAboutFriend()}},e.checkUser=function(){return new Promise(function(n,e){if(d.a.getOtherSteamID()===d.a.getSteamID()){var t=c()("body").html();chrome.runtime.sendMessage(SIHID,{type:"BACKGROUND_CHECK_USER",data:t},function(t){t.success?n(t):e(t)})}})},e.checkSihAppUser=function(){chrome.storage.sync.get(function(n){n.sih_app_account&&chrome.storage.local.get({sihAppUserProfile:null},function(n){var e=n.sihAppUserProfile;e&&0!==Object.keys(e).length||chrome.runtime.sendMessage(chrome.runtime.id,{type:"BACKGROUND_LOGIN_SIH_APP"},function(n){})})})},e}(f.a);e.default=new h},564:function(n,e){},593:function(n,e){n.exports=[{id:"1_sih_icons_steamanalyst",link:"//csgo.steamanalyst.com/users/{{STEAM_ID}}",title:"SteamAnalyst.com",color:"#FFD700"},{id:"achievementstats",link:"//achievementstats.com/index.php?action=profile&playerId={{STEAM_ID}}",title:"AchievementStats",color:"#9ffc3a"},{id:"astats",link:"//astats.astats.nl/astats/User_Info.php?steamID64={{STEAM_ID}}",title:"AStats.nl",color:"#fc5d5d"},{id:"backpacktf",link:"//backpack.tf/profiles/{{STEAM_ID}}",title:"Backpack.tf",color:"#c63f62"},{id:"csgobackpack",link:"//csgobackpack.net/?nick={{STEAM_ID}}",title:"CSGOBackpack",color:"#f6a740"},{id:"steamdb",link:"//steamdb.info/calculator/?player={{STEAM_ID}}",title:"SteamDB",color:"#00cbe6"},{id:"steamrep",link:"//steamrep.com/profiles/{{STEAM_ID}}",title:"SteamRep",color:"#16a085"},{id:"steamtrades",link:"//www.steamtrades.com/user/{{STEAM_ID}}",title:"SteamTrades",color:"#f16421"},{id:"completionist",link:"//completionist.me/steam/profile/{{STEAM_ID}}",title:"Completionist.me",color:"#f6931c"},{id:"steamladder",link:"//steamladder.com/profile/{{STEAM_ID}}",title:"Steam Ladder",color:"#f9cf6b"}]},608:function(n,e,t){t(3),n.exports=t(303)}},[608]);