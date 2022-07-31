browser.storage.local.get('game').then(result => {
    if (result.game) {
        document.getElementById('game').innerText = result.game;
    } else {
        document.getElementById('game').innerText = "No games currently in progress";
    }
});

browser.storage.local.get('BGA').then(result => {
    if (result.BGA) {
        document.getElementById('game-stats').innerText = result.BGA;
    } else {
        document.getElementById('game-stats').innerText = "";
    }
})

browser.storage.onChanged.addListener( () => {
    browser.storage.local.get('BGA').then(result => {
        document.getElementById('game-stats').innerText = result.BGA;
    })
  });

