// Parse the event log in the Catan game to obtain and display the information conveniently
// Includes: tracking dice rolls and player resources (imperfect due to robber stealing from other players being hidden)
console.log('Extension loaded for Catan');

const playerLogsId = 'logs';
const playerNamesId = 'player-name';
const rollIndicator = 'rolls dice:';
const playerGets = 'gets ';
const playerRoad = 'builds a road';
const playerSettlement = 'builds a settlement';
const playerUpgrades = 'upgrades a ';
const playerBuys = 'buys a ';
const playerGetsNothing = 'gets nothing</div>';
const playerTrade = 'gives ';
const maritimeTrade = 'uses maritime trade';
const maritimeSplit = ' → ';
const playerSplit = ' to ';
const resourceMatch = /icon_(.+?)"/g;
const playerDiscards = 'discards';
const playerSteals = 'You get <span';
const playerStealsFrom = 'steals from';
const playerLoses = 'You lose';

let previousLog = 0;
let diceStats = {2: 0, 3: 0, 4: 0, 5: 0,
                 6: 0, 7: 0, 8: 0, 9: 0,
                 10: 0, 11: 0, 12: 0};
let playerResources = {};
let inProgress = false;
let stolenFrom = '';

browser.storage.local.set({ game: 'Catan' });

// Build the initial player names-resources data structure
const playerElements = document.getElementsByClassName(playerNamesId);
if (playerElements && !inProgress) {
    for (let player of playerElements) {
        playerResources[player.innerText] = {'lumber': 0, 'brick': 0,
                                             'grain': 0, 'wool': 0,
                                             'ore': 0};
    }
    browser.storage.local.set({ playerAmounts: playerResources });
    inProgress = true;
}

// Helper function to replace undefined values caught in the regex with 1
// This deals with the case where just the icon is shown and no number
function parseUndefinedMatches(log) {
    const amountMatch = /(><)div class="cat_log_token?.|>([0-9])</g;
    const amounts = [...log.matchAll(amountMatch)];
    let updatedAmounts = [];
    amounts.forEach(amount => {
        updatedAmounts.push(amount.map(num => num === undefined ? 1 : num));
    });
    return updatedAmounts;
}

// Handle events associated with the robber
function parseRobber(log) {
    if (!(log.includes(playerDiscards)) && !(log.includes(playerLoses)) && !(log.includes(playerSteals))) return;
    const playerName = Object.keys(playerResources)[0];
    if (log.includes(playerLoses)) {
        // Update main player losing a resource to the robber
        const resource = log.match(/icon_(.+?)"/)[1];
        playerResources[playerName][resource] -= Math.max(0, playerResources[playerName][resource] - 1);
    } else if (log.includes(playerSteals)) {
        // Update main player gaining + losing player losing
        const resource = log.match(/icon_(.+?)"/)[1];
        playerResources[playerName][resource] += 1;
        playerResources[stolenFrom][resource] -= Math.max(0, playerResources[stolenFrom][resource] - 1);
    } else if (log.includes(playerDiscards)) {
        // Remove discarded cards from the player
        const nameMatch = />(.*) discards/;
        const name = log.match(nameMatch)[1];
        const amounts = parseUndefinedMatches(log);
        const resources = [...log.matchAll(resourceMatch)];
        console.log(name, amounts, resources);
        amounts.forEach((amount, index) => {
            playerResources[name][resources[index][1]] -= Math.max(0, playerResources[name][resources[index][1]] - parseInt(amount[amount.length - 1]));
        });
        console.log(name, amounts, resources);
    }
    browser.storage.local.set({ playerAmounts: playerResources });
}

// Filter the builds/upgrades/buys log events and update playerResources
function parseBuilds(log) {
    if (!(log.includes(playerRoad)) && !(log.includes(playerSettlement)) && !(log.includes(playerUpgrades)) && !(log.includes(playerBuys))) return;
    const nameMatch = /;">(.+?)<\/span><!--PNE-->/;
    const name = log.match(nameMatch)[1];
    if (log.includes(playerRoad)) {
        playerResources[name].brick = Math.max(0, playerResources[name].brick - 1);
        playerResources[name].lumber = Math.max(0, playerResources[name].lumber - 1);
    } else if (log.includes(playerSettlement)) {
        playerResources[name].brick = Math.max(0, playerResources[name].brick - 1);
        playerResources[name].lumber = Math.max(0, playerResources[name].lumber - 1);
        playerResources[name].grain = Math.max(0, playerResources[name].grain - 1);
        playerResources[name].wool = Math.max(0, playerResources[name].wool - 1);
    } else if (log.includes(playerUpgrades)) {
        playerResources[name].ore = Math.max(0, playerResources[name].ore - 3);
        playerResources[name].grain = Math.max(0, playerResources[name].grain - 2);
    } else if (log.includes(playerBuys)) {
        playerResources[name].ore = Math.max(0, playerResources[name].ore - 1);
        playerResources[name].grain = Math.max(0, playerResources[name].grain - 1);
        playerResources[name].wool = Math.max(0, playerResources[name].wool - 1);
    }
    browser.storage.local.set({ playerAmounts: playerResources });
}

// Filter trade log events and update playerResources
function parseTrades(log) {
    if (log.includes(maritimeTrade)) {
        const nameMatch = /">(.+?) uses/;
        const name = log.match(nameMatch)[1];
        const [loses, receives] = log.split(maritimeSplit);
        const losesAmounts = parseUndefinedMatches(loses);
        const receivesAmounts = parseUndefinedMatches(receives);
        const losesResources = [...loses.matchAll(resourceMatch)];
        const receivesResources = [...receives.matchAll(resourceMatch)];
        losesAmounts.forEach((amount, index) => {
            playerResources[name][losesResources[index][1]] = Math.max(0, playerResources[name][losesResources[index][1]] - parseInt(amount[amount.length - 1]));
        });
        receivesAmounts.forEach((amount, index) => {
            playerResources[name][receivesResources[index][1]] += parseInt(amount[amount.length - 1]);
        });
        browser.storage.local.set({ playerAmounts: playerResources });
    } else if (log.includes(playerTrade)) {
        const p1NameMatch = /⇌ (.+?) gives/;
        const p2NameMatch = /(.+?) who/;
        const [gives, receives] = log.split(playerSplit);
        const p1Name = gives.match(p1NameMatch)[1];
        const p2Name = receives.match(p2NameMatch)[1];
        const p1Amounts = parseUndefinedMatches(gives);
        const p2Amounts = parseUndefinedMatches(receives);
        const p1Resources = [...gives.matchAll(resourceMatch)];
        const p2Resources = [...receives.matchAll(resourceMatch)];
        // P1 gives and P2 receives
        p1Amounts.forEach((amount, index) => {
            playerResources[p1Name][p1Resources[index][1]] -= Math.max(0, (playerResources[p1Name][p1Resources[index][1]] - parseInt(amount[amount.length - 1])));
            playerResources[p2Name][p1Resources[index][1]] += parseInt(amount[amount.length - 1]);
        });
        // P2 gives and P1 receives
        p2Amounts.forEach((amount, index) => {
            playerResources[p2Name][p2Resources[index][1]] -= Math.max(0, (playerResources[p2Name][p2Resources[index][1]] - parseInt(amount[amount.length - 1])));
            playerResources[p1Name][p2Resources[index][1]] += parseInt(amount[amount.length - 1]);
        });
        browser.storage.local.set({ playerAmounts: playerResources });
    }
}

// Filter the gets log events and update playerResources
function parseGains(log) {
    if (log.includes(playerGetsNothing) || !(log.includes(playerGets))) return;
    const nameMatch = />(.+?) gets </;
    const name = log.match(nameMatch)[1];
    const resources = [...log.matchAll(resourceMatch)];
    const updatedAmounts = parseUndefinedMatches(log);
    // Increase each resource by the respective amount obtained
    updatedAmounts.forEach((amount, index) => {
        playerResources[name][resources[index][1]] += parseInt(amount[amount.length - 1]);
    });
    browser.storage.local.set({ playerAmounts: playerResources });
}

// Parse dice rolls and update diceStats to keep track of rolls over time
function parseDice(log) {
    if (!(log.includes(rollIndicator))) return;
    const matchDice = /icon_die([0-9]) .* icon_die([0-9])/;
    let [_, d1, d2] = log.match(matchDice);
    d1 = parseInt(d1); d2 = parseInt(d2);
    const roll = d1 + d2;
    diceStats[roll] += 1;
    browser.storage.local.set({ dice: diceStats });
}

function runParsers(log) {
    // Since stealing counts as two separate events, catch the first and set the target
    if (log.includes(playerStealsFrom)) {
        const stolenPlayerMatch = /steals from (.*)</;
        stolenFrom = log.match(stolenPlayerMatch)[1];
    }
    parseDice(log);
    parseGains(log);
    parseBuilds(log);
    parseTrades(log);
    parseRobber(log);
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
            runParsers(missingLog.innerHTML);
        }
    }
    // Save the most recent log into memory (will probs remove this)
    console.log(log[0].innerHTML);
    runParsers(log[0].innerHTML);

    // Be sure to remove this later
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
