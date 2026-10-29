/*mt-line-shim-sw-v13*/(function () {
  try {
    var c = self.chrome || (self.chrome = {})
    if (!c.runtime) c.runtime = {}
    if (!c.runtime.id) c.runtime.id = 'ophjlpahpchlmihnnnihgmmeilfjmjjc'
    function evt() { return { addListener: function () {}, removeListener: function () {}, hasListener: function () { return false } } }
    if (!c.tabs) c.tabs = {}
    var tEvents = ["onActivated", "onCreated", "onRemoved", "onUpdated", "onMoved", "onReplaced", "onAttached", "onDetached", "onHighlighted", "onZoomChange"]
    for (var i = 0; i < tEvents.length; i++) if (!c.tabs[tEvents[i]]) c.tabs[tEvents[i]] = evt()
    if (!c.windows) c.windows = {}
    var wEvents = ["onCreated", "onRemoved", "onFocusChanged", "onBoundsChanged"]
    for (var j = 0; j < wEvents.length; j++) if (!c.windows[wEvents[j]]) c.windows[wEvents[j]] = evt()
    if (!c.action) c.action = {}
    var a = c.action
    if (!a.onClicked) a.onClicked = evt()
    a.setBadgeText = a.setBadgeText || function () {}
    a.setBadgeBackgroundColor = a.setBadgeBackgroundColor || function () {}
    a.setIcon = a.setIcon || function () {}
    a.setTitle = a.setTitle || function () {}
    a.setPopup = a.setPopup || function () {}
    a.getPopup = a.getPopup || function () { return Promise.resolve("") }
    a.getBadgeText = a.getBadgeText || function () { return Promise.resolve("") }
    a.getBadgeBackgroundColor = a.getBadgeBackgroundColor || function () { return Promise.resolve([0, 0, 0, 0]) }
    if (!c.notifications) c.notifications = {}
    var nt = c.notifications
    var nEvents = ["onClicked", "onClosed", "onButtonClicked", "onShown", "onPermissionLevelChanged"]
    for (var k = 0; k < nEvents.length; k++) if (!nt[nEvents[k]]) nt[nEvents[k]] = evt()
    nt.create = nt.create || function () {}
    nt.clear = nt.clear || function () {}
    nt.getAll = nt.getAll || function () { return Promise.resolve({}) }
    nt.getPermissionLevel = nt.getPermissionLevel || function () { return Promise.resolve("granted") }
    if (!c.system) c.system = {}
    if (!c.system.display) c.system.display = {}
    var sd = c.system.display
    sd.getDisplays = sd.getDisplays || function () { return Promise.resolve([]) }
    sd.getDisplayLayout = sd.getDisplayLayout || function () { return Promise.resolve([]) }
    sd.getInfo = sd.getInfo || function () { return Promise.resolve([]) }
    console.log("[line-mode] sw-shim v13 active id=" + c.runtime.id)
    return true
  } catch (e) { return false }
})();
import"./cache.js";const mainWindowId={get:async()=>(await chrome.storage.local.get("mainWindow"))?.mainWindow??null,set:async e=>await chrome.storage.local.set({mainWindow:e}),remove:async()=>await chrome.storage.local.remove("mainWindow")},checkAndDeleteLegacyData=async()=>{if(!(await chrome.storage.local.get("isOpenedBefore"))?.isOpenedBefore){await chrome.storage.local.clear();const e=await indexedDB.databases();for(const o of e)await removeDatabase(o);await chrome.storage.local.set({isOpenedBefore:!0})}},removeDatabase=e=>new Promise(((o,a)=>{const n=indexedDB.deleteDatabase(e.name);n.onsuccess=()=>o(),n.onerror=e=>a(e),n.onblocked=()=>a(new Error("deleteDatabase blocked"))}));chrome.action.onClicked.addListener((async()=>{const e=await mainWindowId.get();if(e){if(await new Promise((o=>{chrome.windows.update(e,{focused:!0},(e=>{e?o(!0):(mainWindowId.remove(),o(!1))}))})))return}await checkAndDeleteLegacyData().catch((e=>{console.warn("Failed to delete legacy data",e)}));const o=await chrome.system.display.getInfo(),{bounds:a}=o[0],n={left:a.left+a.width/2-400,top:a.top+a.height/2-290},t=await chrome.windows.create({url:chrome.runtime.getURL("index.html"),focused:!0,left:Math.floor(n.left),top:Math.floor(n.top),width:800,height:580,type:"panel"});mainWindowId.set(t.id),chrome.action.setIcon({path:{32:"../../line_logo_32x32_on.png",48:"../../line_logo_48x48_on.png",64:"../../line_logo_64x64_on.png",96:"../../line_logo_96x96_on.png",128:"../../line_logo_128x128_on.png"}}),chrome.action.setBadgeBackgroundColor({color:"#df4d0f"})})),chrome.windows.onRemoved.addListener((async e=>{await mainWindowId.get()===e&&(chrome.action.setIcon({path:{32:"../../line_logo_32x32_off.png",48:"../../line_logo_48x48_off.png",64:"../../line_logo_64x64_off.png",96:"../../line_logo_96x96_off.png",128:"../../line_logo_128x128_off.png"}}),chrome.action.setBadgeText({text:""}),mainWindowId.remove())}));