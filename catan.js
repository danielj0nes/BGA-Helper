const playerLogsId = 'logs';
const playerNamesId = 'player-name'
let previousLog = 0;
console.log('Extension loaded :)');
browser.storage.local.set({ game: 'Catan' });

// Add player names to array and send this to main.js
const playerElements = document.getElementsByClassName(playerNamesId);
if (playerElements) {
    let playerNames = [];
    for (let player of playerElements) {
        playerNames.push(player.innerText);
    }
    browser.storage.local.set({ players: playerNames});
}

// Parse the logs
function logParser(log) {
    let logNumber = log[0].id.split('_')[1];
    if (logNumber - 1 > previousLog && previousLog !== 0) {
        console.log(previousLog, logNumber);
    }
    console.log(log);
    console.log(log[0].innerHTML);

    // Get div_id
    

    browser.storage.local.set({ BGA: log[0].innerHTML });
    previousLog = logNumber;
    
}

// Game event log listener
let gameLog = new MutationObserver(function (e) {
    if (e[0].addedNodes) {
        let log = e[0].addedNodes;

        logParser(log);
    }
});
gameLog.observe(document.getElementById(playerLogsId), { childList: true });
