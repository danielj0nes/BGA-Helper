const playerLogsId = 'logs';
const playerNamesId = 'player-name'
console.log('Extension loaded :)');
browser.storage.local.set({ game: 'Catan' });

// Grab all the player names
let playerNames = [];
const playerElements = document.getElementsByClassName(playerNamesId);
for (let player of playerElements) {
    playerNames.push(player.innerText);
}
browser.storage.local.set({ players: playerNames});

// Game event logs
let gameLog = new MutationObserver(function (e) {
    if (e[0].addedNodes) {
        let log = e[0].addedNodes[0].innerHTML;
        console.log(log);

        // Handle addedNodes with multiple nodes...
        if (e[0].addedNodes.length > 1) {
            console.log('Multiple nodes added');
            for (let i of e[0].addedNodes) {
                console.log(i);
            }
        }
        browser.storage.local.set({ BGA: log });
        logParser(log);
    }
});
gameLog.observe(document.getElementById(playerLogsId), { childList: true });

// Parse the logs
function logParser(log) {
    console.log(typeof log);
    
}
