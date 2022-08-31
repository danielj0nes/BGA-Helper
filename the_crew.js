console.log('Extension loaded for The Crew');

const playerLogsId = 'logs';
let previousLog = 0;

browser.storage.local.set({ game: 'The Crew' });

// Scrape the logs from the game and obtain the inner HTML for later parsing
function logScraper(log) {
    let logNumber = parseInt(log[0].id.split('_')[1]);
    // Handle case where multiple logs are fired at once
    // Here we want to obtain and parse all the logs the observer didn't get (previousLog + 1 : logNumber - 1)
    if (logNumber - 1 > previousLog && previousLog !== 0) {
        let logRange = (logNumber - previousLog) - 1;
        let toNumber = previousLog + 1;
        console.log(logNumber, toNumber, logRange, previousLog);
        // Use logRange to work out how many iterations and toNumber as the stopping point
        for (let logId of [...Array(logRange).keys()].map(i => i + toNumber)) {
            let missingLog = document.getElementById(`log_${logId}`);
            console.log(missingLog.innerHTML);
        }
        previousLog = logNumber;
    }
    // Save the most recent log into memory (will probs remove this)
    previousLog = logNumber;
    console.log(log[0].innerHTML);
}

// Game event log listener
let gameLog = new MutationObserver(function (e) {
    if (e[0].addedNodes) {
        let log = e[0].addedNodes;
        logScraper(log);
    }
});
gameLog.observe(document.getElementById(playerLogsId), { childList: true });
