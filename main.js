// Update the popout menu of the extension

browser.storage.local.get('players').then(result => {
    for (let name of result.players) {
        let playerNameElement = document.createElement('div');
        playerNameElement.className = 'player-name'
        playerNameElement.id = name;
        playerNameElement.innerText = name;
        document.getElementById('players').appendChild(playerNameElement)
    }
});

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
});

browser.storage.onChanged.addListener( () => {
    browser.storage.local.get('BGA').then(result => {
        document.getElementById('game-stats').innerText = result.BGA;
    })
  });
