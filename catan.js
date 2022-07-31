console.log("Extension loaded :)");
browser.storage.local.set({ game: "Catan" });

var gameLog = new MutationObserver(function (e) {
    if (e[0].removedNodes) {
        console.log(e[0].addedNodes[0].innerHTML);
        browser.storage.local.set({ BGA: e[0].addedNodes[0].innerHTML });
    }
});
gameLog.observe(document.getElementById('logs'), { childList: true });

