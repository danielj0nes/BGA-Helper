const playerLogsId = 'logs';
const playerNamesId = 'player-name'
const rollIndicator = 'rolls dice:'
let previousLog = 0;
let diceStats = {2: 0, 3: 0, 4: 0, 5: 0, 6: 0, 7: 0, 8: 0, 9: 0, 10: 0, 11: 0, 12: 0};
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

// Parse the dice rolls, helper function for logScraper
function parseDice(log) {
    if (log.includes(rollIndicator)) {
        const matchDice = /icon_die([0-9]) .* icon_die([0-9])/;
        let [_, d1, d2] = log.match(matchDice)
        d1 = parseInt(d1); d2 = parseInt(d2);
        const roll = d1 + d2;
        diceStats[roll] += 1;
        console.log(diceStats);
        browser.storage.local.set({ dice: diceStats });
    }   
}


// Scrape the logs from the game and obtain the inner HTML for later parsing
function logScraper(log) {
    let logNumber = parseInt(log[0].id.split('_')[1]);
    // Handle case where multiple logs are fired at once
    // Here we want to obtain and parse all the logs the observer didn't get (previousLog + 1 : logNumber - 1)
    if (logNumber - 1 > previousLog && previousLog !== 0) {
        let logRange = (logNumber - previousLog) - 1;
        let toNumber = previousLog + 1;
        // Use logRange to work out how many iterations and toNumber as the stopping point
        for (let logId of [...Array(logRange).keys()].map(i => i + toNumber)) {
            let missingLog = document.getElementById(`log_${logId}`);
            parseDice(missingLog.innerHTML);
            console.log(missingLog.innerHTML);
        }
    }
    // Save the most recent log into memory (will probs remove this)
    console.log(log[0].innerHTML);
    parseDice(log[0].innerHTML);
    browser.storage.local.set({ BGA: log[0].innerHTML });
    // Update the last log number, for multiple logs case
    previousLog = logNumber;
    
}

// Game event log listener
let gameLog = new MutationObserver(function (e) {
    if (e[0].addedNodes) {
        let log = e[0].addedNodes;

        logScraper(log);
    }
});
gameLog.observe(document.getElementById(playerLogsId), { childList: true });
