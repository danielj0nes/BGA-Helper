console.log('Extension loaded for Catan');

const playerLogsId = 'logs';
const playerNamesId = 'player-name';
const rollIndicator = 'rolls dice:';
const playerGets = 'gets';
const nothing = 'nothing';

let playerName = ''; // Maybe do stuff with this
let previousLog = 0;
let diceStats = {2: 0, 3: 0, 4: 0, 5: 0, 6: 0, 7: 0, 8: 0, 9: 0, 10: 0, 11: 0, 12: 0};
let playerResources = {};
let inProgress = false;

browser.storage.local.set({ game: 'Catan' });

// Build the initial player names-resources data structure
const playerElements = document.getElementsByClassName(playerNamesId);
if (playerElements && !inProgress) {
    for (let player of playerElements) {
        playerResources[player.innerText] = {'lumber': 0, 'brick': 0, 'grain': 0, 'wool': 0, 'ore': 0};
    }
    browser.storage.local.set({ playerAmounts: playerResources});
    inProgress = true;
}

// Filter the gets log events and update playerResources
function parseResourceGains(log) {
    if (log.includes(playerGets) && !(log.includes(nothing))) {
        const nameMatch = />(.+?) gets </;
        const resourceMatch = /icon_(.+?)"/g;
        const amountMatch = /(><)div class="cat_log_token?.|>([0-9])</g;
        let name = log.match(nameMatch);
        let amounts = [...log.matchAll(amountMatch)];
        let resources = [...log.matchAll(resourceMatch)];
        // Replace undefined values caught in the regex with 1. Surely a better solution?
        let updatedAmounts = []
        amounts.forEach(amount => {
            updatedAmounts.push(amount.map(num => num === undefined ? 1 : num));
        });
        updatedAmounts.forEach((amount, index) => {
            playerResources[name[1]][resources[index][1]] += parseInt(amount[amount.length - 1]);
        });
        console.log(playerResources);
        browser.storage.local.set({ playerAmounts: playerResources});
    }
}

// Parse dice rolls and update diceStats to keep track of rolls over time
function parseDice(log) {
    if (log.includes(rollIndicator)) {
        const matchDice = /icon_die([0-9]) .* icon_die([0-9])/;
        let [_, d1, d2] = log.match(matchDice);
        d1 = parseInt(d1); d2 = parseInt(d2);
        const roll = d1 + d2;
        diceStats[roll] += 1;
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
            console.log(missingLog.innerHTML);
            parseDice(missingLog.innerHTML);
            parseResourceGains(missingLog.innerHTML);
        }
    }
    // Save the most recent log into memory (will probs remove this)
    console.log(log[0].innerHTML);
    parseDice(log[0].innerHTML);
    parseResourceGains(log[0].innerHTML);
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
