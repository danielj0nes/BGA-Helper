// Update the popout menu of the extension

// Parse the JSON object to desirable HTML
function resourceParser(json) {
    let html = '<div class="log">';
    for (const [resource, value] of Object.entries(json)) {
        html += `<div class="cat_log_token icon_${resource}"></div> ${value} `;
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
            playerNameElement.innerHTML = `<b>${name}</b>${resourceParser(resources)}`;
            document.getElementById('players').appendChild(playerNameElement);
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
