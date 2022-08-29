// Update the popout menu of the extension

// Parse the JSON object to desirable HTML
function resourceParser(json) {
    let html = '<div class="log">';
    for (const [resource, value] of Object.entries(json)) {
        html += `<div class="cat_log_token icon_${resource}"></div> ${value}<br>`;
    }
    html += `</div>`;
    return html;
}

browser.storage.local.get('playerAmounts').then(result => {
    if (result.playerAmounts) {
        for (const [name, resources] of Object.entries(result.playerAmounts)) {
            let playerNameElement = document.createElement('div');
            playerNameElement.className = 'player-name';
            playerNameElement.id = name;
            playerNameElement.innerHTML = `<b>${name}</b>`;

            let playerResourcesElement = document.createElement('div');
            playerResourcesElement.className = 'player-name';
            playerResourcesElement.innerHTML = `${resourceParser(resources)}`;
            document.getElementById('players').appendChild(playerNameElement);
            document.getElementById('players').appendChild(playerResourcesElement);
        }
    }
});

browser.storage.local.get('playerColours').then(result => {
    if (result.playerColours) {
        for (const [name, colour] of Object.entries(result.playerColours)) {
            document.getElementById(name).style.color = colour;
        }
    }
});

browser.storage.local.get('game').then(result => {
    if (result.game) {
        document.getElementById('game').innerText = `Now playing: ${result.game}`;
        document.getElementById('game').href = '';
    } else {
        document.getElementById('game').innerText = 'Join a game to start tracking!';
        document.getElementById('game').href = 'https://boardgamearena.com/gamepanel?game=catan';
    }
});

browser.storage.local.get('dice').then(result => {
    if (result.dice) {
        document.getElementById('dice-rolls').style.display = '';
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
