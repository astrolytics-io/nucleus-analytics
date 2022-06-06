!function(e,i){"object"==typeof exports&&"undefined"!=typeof module?module.exports=i():"function"==typeof define&&define.amd?define(i):(e="undefined"!=typeof globalThis?globalThis:e||self).Nucleus=i()}(this,(function(){"use strict";function e(e,i){return i.forEach((function(i){i&&"string"!=typeof i&&!Array.isArray(i)&&Object.keys(i).forEach((function(n){if("default"!==n&&!(n in e)){var t=Object.getOwnPropertyDescriptor(i,n);Object.defineProperty(e,n,t.get?t:{enumerable:!0,get:function(){return i[n]}})}}))})),Object.freeze(e)}const i=()=>{if("undefined"!=typeof process)try{const e=1===parseInt(process.env.ELECTRON_IS_DEV,10);return"ELECTRON_IS_DEV"in process.env?e:process.defaultApp||/node_modules[\\/]electron[\\/]/.test(process.execPath)}catch(e){}else if("undefined"!=typeof window)return"localhost"===window.location.hostname||"file:"===window.location.protocol;return!1},n=(e,i,n)=>{var t;return function(){var o=this,r=arguments,a=function(){t=null,n||e.apply(o,r)},s=n&&!t;clearTimeout(t),t=setTimeout(a,i),s&&e.apply(o,r)}},t=()=>Math.floor(1e6*Math.random())+1,o=()=>{const e={};return"undefined"!=typeof sessionStorage?sessionStorage.getItem("nuc-sId")?(e.sessionId=sessionStorage.getItem("nuc-sId"),e.existingSession=!0):(e.sessionId=t(),sessionStorage.setItem("nuc-sId",e.sessionId)):e.sessionId=t(),e};var r="undefined"!=typeof globalThis?globalThis:"undefined"!=typeof window?window:"undefined"!=typeof global?global:"undefined"!=typeof self?self:{};function a(e){return e&&e.__esModule&&Object.prototype.hasOwnProperty.call(e,"default")?e.default:e}var s={exports:{}};!function(e,i){function n(e,i,n){void 0===n&&(n=!1),n&&(i/=e,e=1);var t,o=[],r=0,a=0,s=function(){var n=r+i,u=Date.now();if(u<n)return void 0!==t&&clearTimeout(t),void(t=setTimeout(s,n-u));r=u,a=0;for(var l=0,c=o.splice(0,e);l<c.length;l++){var d=c[l];a++,d()}t=o.length?setTimeout(s,i):void 0};return function(n){return new Promise((function(u,l){var c=function(){return Promise.resolve().then(n).then(u).catch(l)},d=Date.now();void 0===t&&d-r>i&&(r=d,a=0),a++<e?c():(o.push(c),void 0===t&&(t=setTimeout(s,r+i-d)))}))}}Object.defineProperty(i,"__esModule",{value:!0}),e.exports=n,i.default=n}(s,s.exports);const u=a(s.exports)(20,1e3),l="undefined"!=typeof WebSocket?WebSocket:require("ws"),c=(()=>{try{const e=require("conf"),i={encryptionKey:"s0meR1nd0mK3y",configName:"nucleus"};try{const{remote:e,app:n}=require("electron"),t=(e?e.app:n).getPath("userData");i.cwd=t}catch(e){}return new e(i)}catch(e){return"undefined"!=typeof localStorage?{get:e=>JSON.parse(localStorage.getItem(e)),set:(e,i)=>{localStorage.setItem(e,JSON.stringify(i))}}:(console.warn("Nucleus: could not find a way to store cache. Offline events and persistance won't work!"),{get:()=>{},set:()=>{}})}})();let d="wss://app.nucleus.sh",p=!0,f=!1,m=!1,g=20,b=null,w={},h=!1;const v={queue:c.get("nucleus-queue")||[],props:c.get("nucleus-props")||{},userId:c.get("nucleus-userId")||null,anonId:c.get("nucleus-anonId")||null},y={init:function(e,n={}){if(p=!n.disableInDev,f=!!n.debug,m=!!n.disableTracking,n.endpoint&&(d=n.endpoint),n.reportInterval&&(g=n.reportInterval),!e)return console.error("Nucleus: missing app ID");v.anonId||C("anonId",((e=21)=>crypto.getRandomValues(new Uint8Array(e)).reduce(((e,i)=>e+((i&=63)<36?i.toString(36):i<62?(i-26).toString(36).toUpperCase():i>62?"-":"_")),""))(12)),w={...o(),appId:e},w.existingSession||(this.track(null,null,"init"),h=!0),n.disableErrorReports||"undefined"==typeof process||(process.on("uncaughtException",(e=>{this.trackError("uncaughtException",e)})),process.on("unhandledRejection",(e=>{this.trackError("unhandledRejection",e)}))),"undefined"!=typeof window&&(n.disableErrorReports||(window.onerror=(e,i,n,t,o)=>{this.trackError("windowError",o)}),window.addEventListener("online",k)),(async()=>{const e={deviceId:null,version:"0.0.0",locale:null,platform:null,osVersion:null};try{const{remote:e,app:i}=await Promise.resolve().then((function(){return T})),n=e?e.app:i;localData.version=isDevMode()?"0.0.0":n.getVersion()}catch(e){}if("undefined"!=typeof process){const i=await import("os"),n=await Promise.resolve().then((function(){return T})),t=i.userInfo().username,o=await n.default.machineId(),r=await Promise.resolve().then((function(){return T}));e.platform=i.type(),e.osVersion=i.release(),e.locale=r.sync(),e.deviceId=o+t}else if("undefined"!=typeof navigator){const{ClientJS:i}=await Promise.resolve().then((function(){return B})),n=new i,t=n.getFingerprint(),o="MacIntel"===navigator.platform&&navigator.maxTouchPoints>0||"iPad"===navigator.platform;e.platform=o?"iPadOS":n.getOS(),e.osVersion=o?n.getBrowserVersion():n.getOSVersion(),e.locale=n.getLanguage(),e.deviceId=t.toString(),e.browser=n.getBrowser()}return e})().then((e=>{w={...w,...e};const n=Object.keys(w).filter((e=>!w[e]));if(n.length&&P(`Some properties couldn't be detected: ${n.join(",")}. Set them manually or data will be missing in the dashboard.`),i()&&!p)return M("in dev mode, not reporting data anything");setInterval(k,1e3*g),k()}))},track:(e,n,t="event")=>u((()=>{if(!e&&!t)return;if(m||i()&&!p)return;M("adding to queue: "+(e||t));const o=Math.floor(1e6*Math.random())+1;"init"===t&&v.props&&(n=v.props);const r="init"===t?new Date-1e3:(new Date).getTime(),{sessionId:a}=w,s={type:t,name:e,id:o,date:r,payload:n,sessionId:a};C("queue",[...v.queue,s])})),trackError:function(e,i){if(!i)return;const n={stack:i.stack||i,message:i.message||i};this.track(e,n,"error")},setUserId:function(e){if(!e||""===e.trim())return!1;M("user id set to "+e),C("userId",e),h&&this.track(null,null,"userid")},setProps:function(e,i){for(const i in e)w[i]&&(w[i]=e[i],e[i]=null);C("props",i?e:Object.assign(v.props,e)),h&&this.track(null,v.props,"props")},identify:function(e,i){this.setUserId(e),i&&this.setProps(i,!0)},page:function(e,i){if(!e||""===e.trim()){if("undefined"==typeof window)return!1;e=window.location.pathname}M("viewing screen "+e),this.track(e,i,"nucleus:view")},screen:function(e,i){this.page(e,i)},disableTracking:()=>{m=!0,M("tracking disabled")},enableTracking:()=>{m=!1,M("tracking enabled")}},S=()=>{if(!b||b.readyState!==l.OPEN)return;M(`sending stored events (${v.queue.length})`);const e=v.queue.length?queue.map((e=>{const{type:i}=e,{deviceId:n}=w,{userId:t,anonId:o}=v;let r={...e,userId:t,anonId:o,deviceId:n};if(i&&["init","error"].includes(i)){const{platform:e,osVersion:i,version:n,locale:t,moduleVersion:o}=w,a={client:"js",platform:e,osVersion:i,version:n,locale:t,moduleVersion:o};r={...r,...a}}return r})):[{type:"heartbeat",deviceId:w.deviceId,anonId:v.anonId}];const i=JSON.stringify({data:e});M(i),b.send(i)},k=()=>{const e=(new Date).getTime()-1728e5;C("queue",v.queue.filter((i=>new Date(i.date).getTime()>e))),m||(b&&b.readyState===l.OPEN||(M("No connection to server. Opening it."),b=new l(`${d}/app/${w.appId}/track`),b.onerror=e=>{P(`ws ${e.code}: ${e.reason}`)},b.onclose=e=>{P(`ws ${e.code}: ${e.reason}`)},b.onmessage=x,b.onopen=S),S())},x=e=>{let i={};M("server said "+e.data);try{i=JSON.parse(e.data)}catch(e){return void P("Could not parse message from server.")}i.anonId&&(M("anonId received from server "+i.anonId),C("anonId",i.anonId)),(i.reportedIds||i.confirmation)&&(M("Server successfully registered our data."),i.reportedIds?C("queue",v.queue.filter((e=>!i.reportedIds.includes(e.id)))):i.confirmation&&C("queue",[]))},C=(e,i)=>{v[e]=i,n(c.set("nucleus-"+e,i),500,!0)},M=e=>{f&&console.log("Nucleus: "+e)},P=e=>{f&&console.warn("Nucleus warning: "+e)};var T=Object.freeze({__proto__:null,default:{}}),I={exports:{}};!function(e,i){e.exports=function(e){var i={};function n(t){if(i[t])return i[t].exports;var o=i[t]={i:t,l:!1,exports:{}};return e[t].call(o.exports,o,o.exports,n),o.l=!0,o.exports}return n.m=e,n.c=i,n.d=function(e,i,t){n.o(e,i)||Object.defineProperty(e,i,{enumerable:!0,get:t})},n.r=function(e){"undefined"!=typeof Symbol&&Symbol.toStringTag&&Object.defineProperty(e,Symbol.toStringTag,{value:"Module"}),Object.defineProperty(e,"__esModule",{value:!0})},n.t=function(e,i){if(1&i&&(e=n(e)),8&i)return e;if(4&i&&"object"==typeof e&&e&&e.__esModule)return e;var t=Object.create(null);if(n.r(t),Object.defineProperty(t,"default",{enumerable:!0,value:e}),2&i&&"string"!=typeof e)for(var o in e)n.d(t,o,function(i){return e[i]}.bind(null,o));return t},n.n=function(e){var i=e&&e.__esModule?function(){return e.default}:function(){return e};return n.d(i,"a",i),i},n.o=function(e,i){return Object.prototype.hasOwnProperty.call(e,i)},n.p="",n(n.s=0)}([function(e,i,n){var t,o,r=n(1)(),a=n(3),s=n(4),u=n(6),l=function(){var e=new s;return t=e.getResult(),o=new u,this};l.prototype={getSoftwareVersion:function(){return"0.1.11"},getBrowserData:function(){return t},getFingerprint:function(){var e="|",i=t.ua,n=this.getScreenPrint(),o=this.getPlugins(),r=this.getFonts(),s=this.isLocalStorage(),u=this.isSessionStorage(),l=this.getTimeZone(),c=this.getLanguage(),d=this.getSystemLanguage(),p=this.isCookie(),f=this.getCanvasPrint();return a(i+e+n+e+o+e+r+e+s+e+u+e+l+e+c+e+d+e+p+e+f,256)},getCustomFingerprint:function(){for(var e="|",i="",n=0;n<arguments.length;n++)i+=arguments[n]+e;return a(i,256)},getUserAgent:function(){return t.ua},getUserAgentLowerCase:function(){return t.ua.toLowerCase()},getBrowser:function(){return t.browser.name},getBrowserVersion:function(){return t.browser.version},getBrowserMajorVersion:function(){return t.browser.major},isIE:function(){return/IE/i.test(t.browser.name)},isChrome:function(){return/Chrome/i.test(t.browser.name)},isFirefox:function(){return/Firefox/i.test(t.browser.name)},isSafari:function(){return/Safari/i.test(t.browser.name)},isMobileSafari:function(){return/Mobile\sSafari/i.test(t.browser.name)},isOpera:function(){return/Opera/i.test(t.browser.name)},getEngine:function(){return t.engine.name},getEngineVersion:function(){return t.engine.version},getOS:function(){return t.os.name},getOSVersion:function(){return t.os.version},isWindows:function(){return/Windows/i.test(t.os.name)},isMac:function(){return/Mac/i.test(t.os.name)},isLinux:function(){return/Linux/i.test(t.os.name)},isUbuntu:function(){return/Ubuntu/i.test(t.os.name)},isSolaris:function(){return/Solaris/i.test(t.os.name)},getDevice:function(){return t.device.model},getDeviceType:function(){return t.device.type},getDeviceVendor:function(){return t.device.vendor},getCPU:function(){return t.cpu.architecture},isMobile:function(){var e=t.ua||navigator.vendor||window.opera;return/(android|bb\d+|meego).+mobile|avantgo|bada\/|blackberry|blazer|compal|elaine|fennec|hiptop|iemobile|ip(hone|od)|iris|kindle|lge |maemo|midp|mmp|mobile.+firefox|netfront|opera m(ob|in)i|palm( os)?|phone|p(ixi|re)\/|plucker|pocket|psp|series(4|6)0|symbian|treo|up\.(browser|link)|vodafone|wap|windows (ce|phone)|xda|xiino/i.test(e)||/1207|6310|6590|3gso|4thp|50[1-6]i|770s|802s|a wa|abac|ac(er|oo|s\-)|ai(ko|rn)|al(av|ca|co)|amoi|an(ex|ny|yw)|aptu|ar(ch|go)|as(te|us)|attw|au(di|\-m|r |s )|avan|be(ck|ll|nq)|bi(lb|rd)|bl(ac|az)|br(e|v)w|bumb|bw\-(n|u)|c55\/|capi|ccwa|cdm\-|cell|chtm|cldc|cmd\-|co(mp|nd)|craw|da(it|ll|ng)|dbte|dc\-s|devi|dica|dmob|do(c|p)o|ds(12|\-d)|el(49|ai)|em(l2|ul)|er(ic|k0)|esl8|ez([4-7]0|os|wa|ze)|fetc|fly(\-|_)|g1 u|g560|gene|gf\-5|g\-mo|go(\.w|od)|gr(ad|un)|haie|hcit|hd\-(m|p|t)|hei\-|hi(pt|ta)|hp( i|ip)|hs\-c|ht(c(\-| |_|a|g|p|s|t)|tp)|hu(aw|tc)|i\-(20|go|ma)|i230|iac( |\-|\/)|ibro|idea|ig01|ikom|im1k|inno|ipaq|iris|ja(t|v)a|jbro|jemu|jigs|kddi|keji|kgt( |\/)|klon|kpt |kwc\-|kyo(c|k)|le(no|xi)|lg( g|\/(k|l|u)|50|54|\-[a-w])|libw|lynx|m1\-w|m3ga|m50\/|ma(te|ui|xo)|mc(01|21|ca)|m\-cr|me(rc|ri)|mi(o8|oa|ts)|mmef|mo(01|02|bi|de|do|t(\-| |o|v)|zz)|mt(50|p1|v )|mwbp|mywa|n10[0-2]|n20[2-3]|n30(0|2)|n50(0|2|5)|n7(0(0|1)|10)|ne((c|m)\-|on|tf|wf|wg|wt)|nok(6|i)|nzph|o2im|op(ti|wv)|oran|owg1|p800|pan(a|d|t)|pdxg|pg(13|\-([1-8]|c))|phil|pire|pl(ay|uc)|pn\-2|po(ck|rt|se)|prox|psio|pt\-g|qa\-a|qc(07|12|21|32|60|\-[2-7]|i\-)|qtek|r380|r600|raks|rim9|ro(ve|zo)|s55\/|sa(ge|ma|mm|ms|ny|va)|sc(01|h\-|oo|p\-)|sdk\/|se(c(\-|0|1)|47|mc|nd|ri)|sgh\-|shar|sie(\-|m)|sk\-0|sl(45|id)|sm(al|ar|b3|it|t5)|so(ft|ny)|sp(01|h\-|v\-|v )|sy(01|mb)|t2(18|50)|t6(00|10|18)|ta(gt|lk)|tcl\-|tdg\-|tel(i|m)|tim\-|t\-mo|to(pl|sh)|ts(70|m\-|m3|m5)|tx\-9|up(\.b|g1|si)|utst|v400|v750|veri|vi(rg|te)|vk(40|5[0-3]|\-v)|vm40|voda|vulc|vx(52|53|60|61|70|80|81|83|85|98)|w3c(\-| )|webc|whit|wi(g |nc|nw)|wmlb|wonu|x700|yas\-|your|zeto|zte\-/i.test(e.substr(0,4))},isMobileMajor:function(){return this.isMobileAndroid()||this.isMobileBlackBerry()||this.isMobileIOS()||this.isMobileOpera()||this.isMobileWindows()},isMobileAndroid:function(){return!!t.ua.match(/Android/i)},isMobileOpera:function(){return!!t.ua.match(/Opera Mini/i)},isMobileWindows:function(){return!!t.ua.match(/IEMobile/i)},isMobileBlackBerry:function(){return!!t.ua.match(/BlackBerry/i)},isMobileIOS:function(){return!!t.ua.match(/iPhone|iPad|iPod/i)},isIphone:function(){return!!t.ua.match(/iPhone/i)},isIpad:function(){return!!t.ua.match(/iPad/i)},isIpod:function(){return!!t.ua.match(/iPod/i)},getScreenPrint:function(){return"Current Resolution: "+this.getCurrentResolution()+", Available Resolution: "+this.getAvailableResolution()+", Color Depth: "+this.getColorDepth()+", Device XDPI: "+this.getDeviceXDPI()+", Device YDPI: "+this.getDeviceYDPI()},getColorDepth:function(){return screen.colorDepth},getCurrentResolution:function(){return screen.width+"x"+screen.height},getAvailableResolution:function(){return screen.availWidth+"x"+screen.availHeight},getDeviceXDPI:function(){return screen.deviceXDPI},getDeviceYDPI:function(){return screen.deviceYDPI},getPlugins:function(){for(var e="",i=0;i<navigator.plugins.length;i++)i==navigator.plugins.length-1?e+=navigator.plugins[i].name:e+=navigator.plugins[i].name+", ";return e},isJava:function(){return navigator.javaEnabled()},getJavaVersion:function(){throw new Error("Please use client.java.js or client.js if you need this functionality!")},isFlash:function(){return!!navigator.plugins["Shockwave Flash"]},getFlashVersion:function(){throw new Error("Please use client.flash.js or client.js if you need this functionality!")},isSilverlight:function(){return!!navigator.plugins["Silverlight Plug-In"]},getSilverlightVersion:function(){return this.isSilverlight()?navigator.plugins["Silverlight Plug-In"].description:""},isMimeTypes:function(){return!(!navigator.mimeTypes||!navigator.mimeTypes.length)},getMimeTypes:function(){var e="";if(navigator.mimeTypes)for(var i=0;i<navigator.mimeTypes.length;i++)i==navigator.mimeTypes.length-1?e+=navigator.mimeTypes[i].description:e+=navigator.mimeTypes[i].description+", ";return e},isFont:function(e){return o.detect(e)},getFonts:function(){for(var e=["Abadi MT Condensed Light","Adobe Fangsong Std","Adobe Hebrew","Adobe Ming Std","Agency FB","Aharoni","Andalus","Angsana New","AngsanaUPC","Aparajita","Arab","Arabic Transparent","Arabic Typesetting","Arial Baltic","Arial Black","Arial CE","Arial CYR","Arial Greek","Arial TUR","Arial","Batang","BatangChe","Bauhaus 93","Bell MT","Bitstream Vera Serif","Bodoni MT","Bookman Old Style","Braggadocio","Broadway","Browallia New","BrowalliaUPC","Calibri Light","Calibri","Californian FB","Cambria Math","Cambria","Candara","Castellar","Casual","Centaur","Century Gothic","Chalkduster","Colonna MT","Comic Sans MS","Consolas","Constantia","Copperplate Gothic Light","Corbel","Cordia New","CordiaUPC","Courier New Baltic","Courier New CE","Courier New CYR","Courier New Greek","Courier New TUR","Courier New","DFKai-SB","DaunPenh","David","DejaVu LGC Sans Mono","Desdemona","DilleniaUPC","DokChampa","Dotum","DotumChe","Ebrima","Engravers MT","Eras Bold ITC","Estrangelo Edessa","EucrosiaUPC","Euphemia","Eurostile","FangSong","Forte","FrankRuehl","Franklin Gothic Heavy","Franklin Gothic Medium","FreesiaUPC","French Script MT","Gabriola","Gautami","Georgia","Gigi","Gisha","Goudy Old Style","Gulim","GulimChe","GungSeo","Gungsuh","GungsuhChe","Haettenschweiler","Harrington","Hei S","HeiT","Heisei Kaku Gothic","Hiragino Sans GB","Impact","Informal Roman","IrisUPC","Iskoola Pota","JasmineUPC","KacstOne","KaiTi","Kalinga","Kartika","Khmer UI","Kino MT","KodchiangUPC","Kokila","Kozuka Gothic Pr6N","Lao UI","Latha","Leelawadee","Levenim MT","LilyUPC","Lohit Gujarati","Loma","Lucida Bright","Lucida Console","Lucida Fax","Lucida Sans Unicode","MS Gothic","MS Mincho","MS PGothic","MS PMincho","MS Reference Sans Serif","MS UI Gothic","MV Boli","Magneto","Malgun Gothic","Mangal","Marlett","Matura MT Script Capitals","Meiryo UI","Meiryo","Menlo","Microsoft Himalaya","Microsoft JhengHei","Microsoft New Tai Lue","Microsoft PhagsPa","Microsoft Sans Serif","Microsoft Tai Le","Microsoft Uighur","Microsoft YaHei","Microsoft Yi Baiti","MingLiU","MingLiU-ExtB","MingLiU_HKSCS","MingLiU_HKSCS-ExtB","Miriam Fixed","Miriam","Mongolian Baiti","MoolBoran","NSimSun","Narkisim","News Gothic MT","Niagara Solid","Nyala","PMingLiU","PMingLiU-ExtB","Palace Script MT","Palatino Linotype","Papyrus","Perpetua","Plantagenet Cherokee","Playbill","Prelude Bold","Prelude Condensed Bold","Prelude Condensed Medium","Prelude Medium","PreludeCompressedWGL Black","PreludeCompressedWGL Bold","PreludeCompressedWGL Light","PreludeCompressedWGL Medium","PreludeCondensedWGL Black","PreludeCondensedWGL Bold","PreludeCondensedWGL Light","PreludeCondensedWGL Medium","PreludeWGL Black","PreludeWGL Bold","PreludeWGL Light","PreludeWGL Medium","Raavi","Rachana","Rockwell","Rod","Sakkal Majalla","Sawasdee","Script MT Bold","Segoe Print","Segoe Script","Segoe UI Light","Segoe UI Semibold","Segoe UI Symbol","Segoe UI","Shonar Bangla","Showcard Gothic","Shruti","SimHei","SimSun","SimSun-ExtB","Simplified Arabic Fixed","Simplified Arabic","Snap ITC","Sylfaen","Symbol","Tahoma","Times New Roman Baltic","Times New Roman CE","Times New Roman CYR","Times New Roman Greek","Times New Roman TUR","Times New Roman","TlwgMono","Traditional Arabic","Trebuchet MS","Tunga","Tw Cen MT Condensed Extra Bold","Ubuntu","Umpush","Univers","Utopia","Utsaah","Vani","Verdana","Vijaya","Vladimir Script","Vrinda","Webdings","Wide Latin","Wingdings"],i="",n=0;n<e.length;n++)o.detect(e[n])&&(i+=n==e.length-1?e[n]:e[n]+", ");return i},isLocalStorage:function(){try{return!!r.localStorage}catch(e){return!0}},isSessionStorage:function(){try{return!!r.sessionStorage}catch(e){return!0}},isCookie:function(){return navigator.cookieEnabled},getTimeZone:function(){var e,i;return e=new Date,(i=String(-e.getTimezoneOffset()/60))<0?"-"+("0"+(i*=-1)).slice(-2):"+"+("0"+i).slice(-2)},getLanguage:function(){return navigator.language},getSystemLanguage:function(){return navigator.systemLanguage||window.navigator.language},isCanvas:function(){var e=document.createElement("canvas");try{return!(!e.getContext||!e.getContext("2d"))}catch(e){return!1}},getCanvasPrint:function(){var e,i=document.createElement("canvas");try{e=i.getContext("2d")}catch(e){return""}var n="ClientJS,org <canvas> 1.0";return e.textBaseline="top",e.font="14px 'Arial'",e.textBaseline="alphabetic",e.fillStyle="#f60",e.fillRect(125,1,62,20),e.fillStyle="#069",e.fillText(n,2,15),e.fillStyle="rgba(102, 204, 0, 0.7)",e.fillText(n,4,17),i.toDataURL()}},i.ClientJS=l},function(e,i,n){var t=n(2);e.exports=function(){return"object"==typeof r&&r&&r.Math===Math&&r.Array===Array?r:t}},function(e,i,n){"undefined"!=typeof self?e.exports=self:"undefined"!=typeof window?e.exports=window:e.exports=Function("return this")()},function(e,i,n){e.exports=function(e,i){var n,t,o,r,a,s,u,l;for(n=3&e.length,t=e.length-n,o=i,a=3432918353,s=461845907,l=0;l<t;)u=255&e.charCodeAt(l)|(255&e.charCodeAt(++l))<<8|(255&e.charCodeAt(++l))<<16|(255&e.charCodeAt(++l))<<24,++l,o=27492+(65535&(r=5*(65535&(o=(o^=u=(65535&(u=(u=(65535&u)*a+(((u>>>16)*a&65535)<<16)&4294967295)<<15|u>>>17))*s+(((u>>>16)*s&65535)<<16)&4294967295)<<13|o>>>19))+((5*(o>>>16)&65535)<<16)&4294967295))+((58964+(r>>>16)&65535)<<16);switch(u=0,n){case 3:u^=(255&e.charCodeAt(l+2))<<16;case 2:u^=(255&e.charCodeAt(l+1))<<8;case 1:o^=u=(65535&(u=(u=(65535&(u^=255&e.charCodeAt(l)))*a+(((u>>>16)*a&65535)<<16)&4294967295)<<15|u>>>17))*s+(((u>>>16)*s&65535)<<16)&4294967295}return o^=e.length,o=2246822507*(65535&(o^=o>>>16))+((2246822507*(o>>>16)&65535)<<16)&4294967295,o=3266489909*(65535&(o^=o>>>13))+((3266489909*(o>>>16)&65535)<<16)&4294967295,(o^=o>>>16)>>>0}},function(e,i,n){var t;!function(o,r){var a="function",s="undefined",u="object",l="string",c="model",d="name",p="type",f="vendor",m="version",g="architecture",b="console",w="mobile",h="tablet",v="smarttv",y="wearable",S="embedded",k="Amazon",x="Apple",C="ASUS",M="BlackBerry",P="Google",T="Huawei",I="LG",B="Microsoft",E="Motorola",A="Samsung",L="Sony",O="Xiaomi",N="Zebra",_="Facebook",U=function(e){var i={};for(var n in e)i[e[n].toUpperCase()]=e[n];return i},j=function(e,i){return typeof e===l&&-1!==D(i).indexOf(D(e))},D=function(e){return e.toLowerCase()},R=function(e,i){if(typeof e===l)return e=e.replace(/^\s\s*/,"").replace(/\s\s*$/,""),typeof i===s?e:e.substring(0,255)},G=function(e,i){for(var n,t,o,s,l,c,d=0;d<i.length&&!l;){var p=i[d],f=i[d+1];for(n=t=0;n<p.length&&!l;)if(l=p[n++].exec(e))for(o=0;o<f.length;o++)c=l[++t],typeof(s=f[o])===u&&s.length>0?2==s.length?typeof s[1]==a?this[s[0]]=s[1].call(this,c):this[s[0]]=s[1]:3==s.length?typeof s[1]!==a||s[1].exec&&s[1].test?this[s[0]]=c?c.replace(s[1],s[2]):r:this[s[0]]=c?s[1].call(this,c,s[2]):r:4==s.length&&(this[s[0]]=c?s[3].call(this,c.replace(s[1],s[2])):r):this[s]=c||r;d+=2}},q=function(e,i){for(var n in i)if(typeof i[n]===u&&i[n].length>0){for(var t=0;t<i[n].length;t++)if(j(i[n][t],e))return"?"===n?r:n}else if(j(i[n],e))return"?"===n?r:n;return e},V={ME:"4.90","NT 3.11":"NT3.51","NT 4.0":"NT4.0",2e3:"NT 5.0",XP:["NT 5.1","NT 5.2"],Vista:"NT 6.0",7:"NT 6.1",8:"NT 6.2",8.1:"NT 6.3",10:["NT 6.4","NT 10.0"],RT:"ARM"},z={browser:[[/\b(?:crmo|crios)\/([\w\.]+)/i],[m,[d,"Chrome"]],[/edg(?:e|ios|a)?\/([\w\.]+)/i],[m,[d,"Edge"]],[/(opera mini)\/([-\w\.]+)/i,/(opera [mobiletab]{3,6})\b.+version\/([-\w\.]+)/i,/(opera)(?:.+version\/|[\/ ]+)([\w\.]+)/i],[d,m],[/opios[\/ ]+([\w\.]+)/i],[m,[d,"Opera Mini"]],[/\bopr\/([\w\.]+)/i],[m,[d,"Opera"]],[/(kindle)\/([\w\.]+)/i,/(lunascape|maxthon|netfront|jasmine|blazer)[\/ ]?([\w\.]*)/i,/(avant |iemobile|slim)(?:browser)?[\/ ]?([\w\.]*)/i,/(ba?idubrowser)[\/ ]?([\w\.]+)/i,/(?:ms|\()(ie) ([\w\.]+)/i,/(flock|rockmelt|midori|epiphany|silk|skyfire|ovibrowser|bolt|iron|vivaldi|iridium|phantomjs|bowser|quark|qupzilla|falkon|rekonq|puffin|brave|whale|qqbrowserlite|qq)\/([-\w\.]+)/i,/(weibo)__([\d\.]+)/i],[d,m],[/(?:\buc? ?browser|(?:juc.+)ucweb)[\/ ]?([\w\.]+)/i],[m,[d,"UCBrowser"]],[/\bqbcore\/([\w\.]+)/i],[m,[d,"WeChat(Win) Desktop"]],[/micromessenger\/([\w\.]+)/i],[m,[d,"WeChat"]],[/konqueror\/([\w\.]+)/i],[m,[d,"Konqueror"]],[/trident.+rv[: ]([\w\.]{1,9})\b.+like gecko/i],[m,[d,"IE"]],[/yabrowser\/([\w\.]+)/i],[m,[d,"Yandex"]],[/(avast|avg)\/([\w\.]+)/i],[[d,/(.+)/,"$1 Secure Browser"],m],[/\bfocus\/([\w\.]+)/i],[m,[d,"Firefox Focus"]],[/\bopt\/([\w\.]+)/i],[m,[d,"Opera Touch"]],[/coc_coc\w+\/([\w\.]+)/i],[m,[d,"Coc Coc"]],[/dolfin\/([\w\.]+)/i],[m,[d,"Dolphin"]],[/coast\/([\w\.]+)/i],[m,[d,"Opera Coast"]],[/miuibrowser\/([\w\.]+)/i],[m,[d,"MIUI Browser"]],[/fxios\/([-\w\.]+)/i],[m,[d,"Firefox"]],[/\bqihu|(qi?ho?o?|360)browser/i],[[d,"360 Browser"]],[/(oculus|samsung|sailfish)browser\/([\w\.]+)/i],[[d,/(.+)/,"$1 Browser"],m],[/(comodo_dragon)\/([\w\.]+)/i],[[d,/_/g," "],m],[/(electron)\/([\w\.]+) safari/i,/(tesla)(?: qtcarbrowser|\/(20\d\d\.[-\w\.]+))/i,/m?(qqbrowser|baiduboxapp|2345Explorer)[\/ ]?([\w\.]+)/i],[d,m],[/(metasr)[\/ ]?([\w\.]+)/i,/(lbbrowser)/i],[d],[/((?:fban\/fbios|fb_iab\/fb4a)(?!.+fbav)|;fbav\/([\w\.]+);)/i],[[d,_],m],[/safari (line)\/([\w\.]+)/i,/\b(line)\/([\w\.]+)\/iab/i,/(chromium|instagram)[\/ ]([-\w\.]+)/i],[d,m],[/\bgsa\/([\w\.]+) .*safari\//i],[m,[d,"GSA"]],[/headlesschrome(?:\/([\w\.]+)| )/i],[m,[d,"Chrome Headless"]],[/ wv\).+(chrome)\/([\w\.]+)/i],[[d,"Chrome WebView"],m],[/droid.+ version\/([\w\.]+)\b.+(?:mobile safari|safari)/i],[m,[d,"Android Browser"]],[/(chrome|omniweb|arora|[tizenoka]{5} ?browser)\/v?([\w\.]+)/i],[d,m],[/version\/([\w\.]+) .*mobile\/\w+ (safari)/i],[m,[d,"Mobile Safari"]],[/version\/([\w\.]+) .*(mobile ?safari|safari)/i],[m,d],[/webkit.+?(mobile ?safari|safari)(\/[\w\.]+)/i],[d,[m,q,{"1.0":"/8",1.2:"/1",1.3:"/3","2.0":"/412","2.0.2":"/416","2.0.3":"/417","2.0.4":"/419","?":"/"}]],[/(webkit|khtml)\/([\w\.]+)/i],[d,m],[/(navigator|netscape\d?)\/([-\w\.]+)/i],[[d,"Netscape"],m],[/mobile vr; rv:([\w\.]+)\).+firefox/i],[m,[d,"Firefox Reality"]],[/ekiohf.+(flow)\/([\w\.]+)/i,/(swiftfox)/i,/(icedragon|iceweasel|camino|chimera|fennec|maemo browser|minimo|conkeror|klar)[\/ ]?([\w\.\+]+)/i,/(seamonkey|k-meleon|icecat|iceape|firebird|phoenix|palemoon|basilisk|waterfox)\/([-\w\.]+)$/i,/(firefox)\/([\w\.]+)/i,/(mozilla)\/([\w\.]+) .+rv\:.+gecko\/\d+/i,/(polaris|lynx|dillo|icab|doris|amaya|w3m|netsurf|sleipnir|obigo|mosaic|(?:go|ice|up)[\. ]?browser)[-\/ ]?v?([\w\.]+)/i,/(links) \(([\w\.]+)/i],[d,m]],cpu:[[/(?:(amd|x(?:(?:86|64)[-_])?|wow|win)64)[;\)]/i],[[g,"amd64"]],[/(ia32(?=;))/i],[[g,D]],[/((?:i[346]|x)86)[;\)]/i],[[g,"ia32"]],[/\b(aarch64|arm(v?8e?l?|_?64))\b/i],[[g,"arm64"]],[/\b(arm(?:v[67])?ht?n?[fl]p?)\b/i],[[g,"armhf"]],[/windows (ce|mobile); ppc;/i],[[g,"arm"]],[/((?:ppc|powerpc)(?:64)?)(?: mac|;|\))/i],[[g,/ower/,"",D]],[/(sun4\w)[;\)]/i],[[g,"sparc"]],[/((?:avr32|ia64(?=;))|68k(?=\))|\barm(?=v(?:[1-7]|[5-7]1)l?|;|eabi)|(?=atmel )avr|(?:irix|mips|sparc)(?:64)?\b|pa-risc)/i],[[g,D]]],device:[[/\b(sch-i[89]0\d|shw-m380s|sm-[pt]\w{2,4}|gt-[pn]\d{2,4}|sgh-t8[56]9|nexus 10)/i],[c,[f,A],[p,h]],[/\b((?:s[cgp]h|gt|sm)-\w+|galaxy nexus)/i,/samsung[- ]([-\w]+)/i,/sec-(sgh\w+)/i],[c,[f,A],[p,w]],[/\((ip(?:hone|od)[\w ]*);/i],[c,[f,x],[p,w]],[/\((ipad);[-\w\),; ]+apple/i,/applecoremedia\/[\w\.]+ \((ipad)/i,/\b(ipad)\d\d?,\d\d?[;\]].+ios/i],[c,[f,x],[p,h]],[/\b((?:ag[rs][23]?|bah2?|sht?|btv)-a?[lw]\d{2})\b(?!.+d\/s)/i],[c,[f,T],[p,h]],[/(?:huawei|honor)([-\w ]+)[;\)]/i,/\b(nexus 6p|\w{2,4}-[atu]?[ln][01259x][012359][an]?)\b(?!.+d\/s)/i],[c,[f,T],[p,w]],[/\b(poco[\w ]+)(?: bui|\))/i,/\b; (\w+) build\/hm\1/i,/\b(hm[-_ ]?note?[_ ]?(?:\d\w)?) bui/i,/\b(redmi[\-_ ]?(?:note|k)?[\w_ ]+)(?: bui|\))/i,/\b(mi[-_ ]?(?:a\d|one|one[_ ]plus|note lte|max)?[_ ]?(?:\d?\w?)[_ ]?(?:plus|se|lite)?)(?: bui|\))/i],[[c,/_/g," "],[f,O],[p,w]],[/\b(mi[-_ ]?(?:pad)(?:[\w_ ]+))(?: bui|\))/i],[[c,/_/g," "],[f,O],[p,h]],[/; (\w+) bui.+ oppo/i,/\b(cph[12]\d{3}|p(?:af|c[al]|d\w|e[ar])[mt]\d0|x9007)\b/i],[c,[f,"OPPO"],[p,w]],[/vivo (\w+)(?: bui|\))/i,/\b(v[12]\d{3}\w?[at])(?: bui|;)/i],[c,[f,"Vivo"],[p,w]],[/\b(rmx[12]\d{3})(?: bui|;|\))/i],[c,[f,"Realme"],[p,w]],[/\b(milestone|droid(?:[2-4x]| (?:bionic|x2|pro|razr))?:?( 4g)?)\b[\w ]+build\//i,/\bmot(?:orola)?[- ](\w*)/i,/((?:moto[\w\(\) ]+|xt\d{3,4}|nexus 6)(?= bui|\)))/i],[c,[f,E],[p,w]],[/\b(mz60\d|xoom[2 ]{0,2}) build\//i],[c,[f,E],[p,h]],[/((?=lg)?[vl]k\-?\d{3}) bui| 3\.[-\w; ]{10}lg?-([06cv9]{3,4})/i],[c,[f,I],[p,h]],[/(lm(?:-?f100[nv]?|-[\w\.]+)(?= bui|\))|nexus [45])/i,/\blg[-e;\/ ]+((?!browser|netcast|android tv)\w+)/i,/\blg-?([\d\w]+) bui/i],[c,[f,I],[p,w]],[/(ideatab[-\w ]+)/i,/lenovo ?(s[56]000[-\w]+|tab(?:[\w ]+)|yt[-\d\w]{6}|tb[-\d\w]{6})/i],[c,[f,"Lenovo"],[p,h]],[/(?:maemo|nokia).*(n900|lumia \d+)/i,/nokia[-_ ]?([-\w\.]*)/i],[[c,/_/g," "],[f,"Nokia"],[p,w]],[/(pixel c)\b/i],[c,[f,P],[p,h]],[/droid.+; (pixel[\daxl ]{0,6})(?: bui|\))/i],[c,[f,P],[p,w]],[/droid.+ ([c-g]\d{4}|so[-gl]\w+|xq-a\w[4-7][12])(?= bui|\).+chrome\/(?![1-6]{0,1}\d\.))/i],[c,[f,L],[p,w]],[/sony tablet [ps]/i,/\b(?:sony)?sgp\w+(?: bui|\))/i],[[c,"Xperia Tablet"],[f,L],[p,h]],[/ (kb2005|in20[12]5|be20[12][59])\b/i,/(?:one)?(?:plus)? (a\d0\d\d)(?: b|\))/i],[c,[f,"OnePlus"],[p,w]],[/(alexa)webm/i,/(kf[a-z]{2}wi)( bui|\))/i,/(kf[a-z]+)( bui|\)).+silk\//i],[c,[f,k],[p,h]],[/((?:sd|kf)[0349hijorstuw]+)( bui|\)).+silk\//i],[[c,/(.+)/g,"Fire Phone $1"],[f,k],[p,w]],[/(playbook);[-\w\),; ]+(rim)/i],[c,f,[p,h]],[/\b((?:bb[a-f]|st[hv])100-\d)/i,/\(bb10; (\w+)/i],[c,[f,M],[p,w]],[/(?:\b|asus_)(transfo[prime ]{4,10} \w+|eeepc|slider \w+|nexus 7|padfone|p00[cj])/i],[c,[f,C],[p,h]],[/ (z[bes]6[027][012][km][ls]|zenfone \d\w?)\b/i],[c,[f,C],[p,w]],[/(nexus 9)/i],[c,[f,"HTC"],[p,h]],[/(htc)[-;_ ]{1,2}([\w ]+(?=\)| bui)|\w+)/i,/(zte)[- ]([\w ]+?)(?: bui|\/|\))/i,/(alcatel|geeksphone|nexian|panasonic|sony)[-_ ]?([-\w]*)/i],[f,[c,/_/g," "],[p,w]],[/droid.+; ([ab][1-7]-?[0178a]\d\d?)/i],[c,[f,"Acer"],[p,h]],[/droid.+; (m[1-5] note) bui/i,/\bmz-([-\w]{2,})/i],[c,[f,"Meizu"],[p,w]],[/\b(sh-?[altvz]?\d\d[a-ekm]?)/i],[c,[f,"Sharp"],[p,w]],[/(blackberry|benq|palm(?=\-)|sonyericsson|acer|asus|dell|meizu|motorola|polytron)[-_ ]?([-\w]*)/i,/(hp) ([\w ]+\w)/i,/(asus)-?(\w+)/i,/(microsoft); (lumia[\w ]+)/i,/(lenovo)[-_ ]?([-\w]+)/i,/(jolla)/i,/(oppo) ?([\w ]+) bui/i],[f,c,[p,w]],[/(archos) (gamepad2?)/i,/(hp).+(touchpad(?!.+tablet)|tablet)/i,/(kindle)\/([\w\.]+)/i,/(nook)[\w ]+build\/(\w+)/i,/(dell) (strea[kpr\d ]*[\dko])/i,/(le[- ]+pan)[- ]+(\w{1,9}) bui/i,/(trinity)[- ]*(t\d{3}) bui/i,/(gigaset)[- ]+(q\w{1,9}) bui/i,/(vodafone) ([\w ]+)(?:\)| bui)/i],[f,c,[p,h]],[/(surface duo)/i],[c,[f,B],[p,h]],[/droid [\d\.]+; (fp\du?)(?: b|\))/i],[c,[f,"Fairphone"],[p,w]],[/(u304aa)/i],[c,[f,"AT&T"],[p,w]],[/\bsie-(\w*)/i],[c,[f,"Siemens"],[p,w]],[/\b(rct\w+) b/i],[c,[f,"RCA"],[p,h]],[/\b(venue[\d ]{2,7}) b/i],[c,[f,"Dell"],[p,h]],[/\b(q(?:mv|ta)\w+) b/i],[c,[f,"Verizon"],[p,h]],[/\b(?:barnes[& ]+noble |bn[rt])([\w\+ ]*) b/i],[c,[f,"Barnes & Noble"],[p,h]],[/\b(tm\d{3}\w+) b/i],[c,[f,"NuVision"],[p,h]],[/\b(k88) b/i],[c,[f,"ZTE"],[p,h]],[/\b(nx\d{3}j) b/i],[c,[f,"ZTE"],[p,w]],[/\b(gen\d{3}) b.+49h/i],[c,[f,"Swiss"],[p,w]],[/\b(zur\d{3}) b/i],[c,[f,"Swiss"],[p,h]],[/\b((zeki)?tb.*\b) b/i],[c,[f,"Zeki"],[p,h]],[/\b([yr]\d{2}) b/i,/\b(dragon[- ]+touch |dt)(\w{5}) b/i],[[f,"Dragon Touch"],c,[p,h]],[/\b(ns-?\w{0,9}) b/i],[c,[f,"Insignia"],[p,h]],[/\b((nxa|next)-?\w{0,9}) b/i],[c,[f,"NextBook"],[p,h]],[/\b(xtreme\_)?(v(1[045]|2[015]|[3469]0|7[05])) b/i],[[f,"Voice"],c,[p,w]],[/\b(lvtel\-)?(v1[12]) b/i],[[f,"LvTel"],c,[p,w]],[/\b(ph-1) /i],[c,[f,"Essential"],[p,w]],[/\b(v(100md|700na|7011|917g).*\b) b/i],[c,[f,"Envizen"],[p,h]],[/\b(trio[-\w\. ]+) b/i],[c,[f,"MachSpeed"],[p,h]],[/\btu_(1491) b/i],[c,[f,"Rotor"],[p,h]],[/(shield[\w ]+) b/i],[c,[f,"Nvidia"],[p,h]],[/(sprint) (\w+)/i],[f,c,[p,w]],[/(kin\.[onetw]{3})/i],[[c,/\./g," "],[f,B],[p,w]],[/droid.+; (cc6666?|et5[16]|mc[239][23]x?|vc8[03]x?)\)/i],[c,[f,N],[p,h]],[/droid.+; (ec30|ps20|tc[2-8]\d[kx])\)/i],[c,[f,N],[p,w]],[/(ouya)/i,/(nintendo) ([wids3utch]+)/i],[f,c,[p,b]],[/droid.+; (shield) bui/i],[c,[f,"Nvidia"],[p,b]],[/(playstation [345portablevi]+)/i],[c,[f,L],[p,b]],[/\b(xbox(?: one)?(?!; xbox))[\); ]/i],[c,[f,B],[p,b]],[/smart-tv.+(samsung)/i],[f,[p,v]],[/hbbtv.+maple;(\d+)/i],[[c,/^/,"SmartTV"],[f,A],[p,v]],[/(nux; netcast.+smarttv|lg (netcast\.tv-201\d|android tv))/i],[[f,I],[p,v]],[/(apple) ?tv/i],[f,[c,"Apple TV"],[p,v]],[/crkey/i],[[c,"Chromecast"],[f,P],[p,v]],[/droid.+aft(\w)( bui|\))/i],[c,[f,k],[p,v]],[/\(dtv[\);].+(aquos)/i],[c,[f,"Sharp"],[p,v]],[/\b(roku)[\dx]*[\)\/]((?:dvp-)?[\d\.]*)/i,/hbbtv\/\d+\.\d+\.\d+ +\([\w ]*; *(\w[^;]*);([^;]*)/i],[[f,R],[c,R],[p,v]],[/\b(android tv|smart[- ]?tv|opera tv|tv; rv:)\b/i],[[p,v]],[/((pebble))app/i],[f,c,[p,y]],[/droid.+; (glass) \d/i],[c,[f,P],[p,y]],[/droid.+; (wt63?0{2,3})\)/i],[c,[f,N],[p,y]],[/(quest( 2)?)/i],[c,[f,_],[p,y]],[/(tesla)(?: qtcarbrowser|\/[-\w\.]+)/i],[f,[p,S]],[/droid .+?; ([^;]+?)(?: bui|\) applew).+? mobile safari/i],[c,[p,w]],[/droid .+?; ([^;]+?)(?: bui|\) applew).+?(?! mobile) safari/i],[c,[p,h]],[/\b((tablet|tab)[;\/]|focus\/\d(?!.+mobile))/i],[[p,h]],[/(phone|mobile(?:[;\/]| safari)|pda(?=.+windows ce))/i],[[p,w]],[/(android[-\w\. ]{0,9});.+buil/i],[c,[f,"Generic"]]],engine:[[/windows.+ edge\/([\w\.]+)/i],[m,[d,"EdgeHTML"]],[/webkit\/537\.36.+chrome\/(?!27)([\w\.]+)/i],[m,[d,"Blink"]],[/(presto)\/([\w\.]+)/i,/(webkit|trident|netfront|netsurf|amaya|lynx|w3m|goanna)\/([\w\.]+)/i,/ekioh(flow)\/([\w\.]+)/i,/(khtml|tasman|links)[\/ ]\(?([\w\.]+)/i,/(icab)[\/ ]([23]\.[\d\.]+)/i],[d,m],[/rv\:([\w\.]{1,9})\b.+(gecko)/i],[m,d]],os:[[/microsoft (windows) (vista|xp)/i],[d,m],[/(windows) nt 6\.2; (arm)/i,/(windows (?:phone(?: os)?|mobile))[\/ ]?([\d\.\w ]*)/i,/(windows)[\/ ]?([ntce\d\. ]+\w)(?!.+xbox)/i],[d,[m,q,V]],[/(win(?=3|9|n)|win 9x )([nt\d\.]+)/i],[[d,"Windows"],[m,q,V]],[/ip[honead]{2,4}\b(?:.*os ([\w]+) like mac|; opera)/i,/cfnetwork\/.+darwin/i],[[m,/_/g,"."],[d,"iOS"]],[/(mac os x) ?([\w\. ]*)/i,/(macintosh|mac_powerpc\b)(?!.+haiku)/i],[[d,"Mac OS"],[m,/_/g,"."]],[/droid ([\w\.]+)\b.+(android[- ]x86)/i],[m,d],[/(android|webos|qnx|bada|rim tablet os|maemo|meego|sailfish)[-\/ ]?([\w\.]*)/i,/(blackberry)\w*\/([\w\.]*)/i,/(tizen|kaios)[\/ ]([\w\.]+)/i,/\((series40);/i],[d,m],[/\(bb(10);/i],[m,[d,M]],[/(?:symbian ?os|symbos|s60(?=;)|series60)[-\/ ]?([\w\.]*)/i],[m,[d,"Symbian"]],[/mozilla\/[\d\.]+ \((?:mobile|tablet|tv|mobile; [\w ]+); rv:.+ gecko\/([\w\.]+)/i],[m,[d,"Firefox OS"]],[/web0s;.+rt(tv)/i,/\b(?:hp)?wos(?:browser)?\/([\w\.]+)/i],[m,[d,"webOS"]],[/crkey\/([\d\.]+)/i],[m,[d,"Chromecast"]],[/(cros) [\w]+ ([\w\.]+\w)/i],[[d,"Chromium OS"],m],[/(nintendo|playstation) ([wids345portablevuch]+)/i,/(xbox); +xbox ([^\);]+)/i,/\b(joli|palm)\b ?(?:os)?\/?([\w\.]*)/i,/(mint)[\/\(\) ]?(\w*)/i,/(mageia|vectorlinux)[; ]/i,/([kxln]?ubuntu|debian|suse|opensuse|gentoo|arch(?= linux)|slackware|fedora|mandriva|centos|pclinuxos|red ?hat|zenwalk|linpus|raspbian|plan 9|minix|risc os|contiki|deepin|manjaro|elementary os|sabayon|linspire)(?: gnu\/linux)?(?: enterprise)?(?:[- ]linux)?(?:-gnu)?[-\/ ]?(?!chrom|package)([-\w\.]*)/i,/(hurd|linux) ?([\w\.]*)/i,/(gnu) ?([\w\.]*)/i,/\b([-frentopcghs]{0,5}bsd|dragonfly)[\/ ]?(?!amd|[ix346]{1,2}86)([\w\.]*)/i,/(haiku) (\w+)/i],[d,m],[/(sunos) ?([\w\.\d]*)/i],[[d,"Solaris"],m],[/((?:open)?solaris)[-\/ ]?([\w\.]*)/i,/(aix) ((\d)(?=\.|\)| )[\w\.])*/i,/\b(beos|os\/2|amigaos|morphos|openvms|fuchsia|hp-ux)/i,/(unix) ?([\w\.]*)/i],[d,m]]},F=function(e,i){if(typeof e===u&&(i=e,e=r),!(this instanceof F))return new F(e,i).getResult();var n=e||(typeof o!==s&&o.navigator&&o.navigator.userAgent?o.navigator.userAgent:""),t=i?function(e,i){var n={};for(var t in e)i[t]&&i[t].length%2==0?n[t]=i[t].concat(e[t]):n[t]=e[t];return n}(z,i):z;return this.getBrowser=function(){var e,i={};return i.name=r,i.version=r,G.call(i,n,t.browser),i.major=typeof(e=i.version)===l?e.replace(/[^\d\.]/g,"").split(".")[0]:r,i},this.getCPU=function(){var e={};return e.architecture=r,G.call(e,n,t.cpu),e},this.getDevice=function(){var e={};return e.vendor=r,e.model=r,e.type=r,G.call(e,n,t.device),e},this.getEngine=function(){var e={};return e.name=r,e.version=r,G.call(e,n,t.engine),e},this.getOS=function(){var e={};return e.name=r,e.version=r,G.call(e,n,t.os),e},this.getResult=function(){return{ua:this.getUA(),browser:this.getBrowser(),engine:this.getEngine(),os:this.getOS(),device:this.getDevice(),cpu:this.getCPU()}},this.getUA=function(){return n},this.setUA=function(e){return n=typeof e===l&&e.length>255?R(e,255):e,this},this.setUA(n),this};F.VERSION="0.7.30",F.BROWSER=U([d,m,"major"]),F.CPU=U([g]),F.DEVICE=U([c,f,p,b,w,v,h,y,S]),F.ENGINE=F.OS=U([d,m]),typeof i!==s?(typeof e!==s&&e.exports&&(i=e.exports=F),i.UAParser=F):n(5)?(t=function(){return F}.call(i,n,i,e))===r||(e.exports=t):typeof o!==s&&(o.UAParser=F);var W=typeof o!==s&&(o.jQuery||o.Zepto);if(W&&!W.ua){var H=new F;W.ua=H.getResult(),W.ua.get=function(){return H.getUA()},W.ua.set=function(e){H.setUA(e);var i=H.getResult();for(var n in i)W.ua[n]=i[n]}}}("object"==typeof window?window:this)},function(e,i){(function(i){e.exports=i}).call(this,{})},function(e,i){e.exports=function(){var e=["monospace","sans-serif","serif"],i=document.getElementsByTagName("body")[0],n=document.createElement("span");n.style.fontSize="72px",n.innerHTML="mmmmmmmmmmlli";var t={},o={};for(var r in e)n.style.fontFamily=e[r],i.appendChild(n),t[e[r]]=n.offsetWidth,o[e[r]]=n.offsetHeight,i.removeChild(n);this.detect=function(r){var a=!1;for(var s in e){n.style.fontFamily=r+","+e[s],i.appendChild(n);var u=n.offsetWidth!=t[e[s]]||n.offsetHeight!=o[e[s]];i.removeChild(n),a=a||u}return a}}}])}(I);var B=e({__proto__:null,default:a(I.exports)},[I.exports]);return y}));
