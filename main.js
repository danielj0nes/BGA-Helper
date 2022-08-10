// Update the popout menu of the extension

browser.storage.local.get('playerAmounts').then(result => {
    if (result.playerAmounts) {
        for (const [name, resources] of Object.entries(result.playerAmounts)) {
            let playerNameElement = document.createElement('div');
            playerNameElement.className = 'player-name'
            playerNameElement.id = name;
            playerNameElement.innerText = `${name} - ${JSON.stringify(resources)}`;
            document.getElementById('players').appendChild(playerNameElement)
        }
    }
});

browser.storage.local.get('game').then(result => {
    if (result.game) {
        document.getElementById('game').innerText = result.game;
    } else {
        document.getElementById('game').innerText = 'No games currently in progress';
    }
});

browser.storage.local.get('BGA').then(result => {
    if (result.BGA) {
        document.getElementById('game-stats').innerText = result.BGA;
    } else {
        document.getElementById('game-stats').innerText = '';
    }
});

browser.storage.local.get('dice').then(result => {
    if (result.dice) {
        document.getElementById('dice-rolls').style.display = "";
        for (const [diceNum, diceAmount] of Object.entries(result.dice)) {
            document.getElementById(`dice-${diceNum}-amount`).innerText = diceAmount;
        }
    }
});

// Dynamically update values
browser.storage.onChanged.addListener( () => {
    browser.storage.local.get('BGA').then(result => {
        document.getElementById('game-stats').innerText = result.BGA;
    });
  });
