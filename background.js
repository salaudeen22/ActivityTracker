const tabTimeObjectKey = "tabTimesObject"; // { key:url, value: {url:string, trackedSeconds: number, lastDateVal: number //utc milliseconds?,startDateVal:number}}
const lastActiveTabKey = "lastActiveTab"; // {url:string, lastDateVal: number}

chrome.runtime.onInstalled.addListener(function() {
    console.log("Extension installed or updated.");
  
    chrome.declarativeContent.onPageChanged.removeRules(undefined, function() {
        chrome.declarativeContent.onPageChanged.addRules([
            {
                conditions: [
                    new chrome.declarativeContent.PageStateMatcher({
                        pageUrl: {},
                    })
                ],
                actions: [ new chrome.declarativeContent.ShowPageAction() ]
            }
        ]);
    });
});

chrome.windows.onFocusChanged.addListener(function(windowId) {
    if (windowId === chrome.windows.WINDOW_ID_NONE) {
        // Reset the last active tab data if the window loses focus
        resetLastActiveTab();
    } else {
        // Process tab change if the window gains focus
        processTabChange(true);
    }
});

function resetLastActiveTab() {
    chrome.storage.local.set({ [lastActiveTabKey]: '' }, function() {
        console.log("Last active tab reset.");
    });
}

function processTabChange(isWindowActive) {
  
    chrome.tabs.query({ active: true }, function(tabs) {
        if (tabs.length > 0 && tabs[0] !== null) {
            let currentTab = tabs[0];
            let url = currentTab.url;
            let title = currentTab.title;
            let hostName = url;
            try {
                let urlObject = new URL(url);

                hostName = urlObject.hostname;
            } catch (e) {
                console.log(e);
                // console.error(`Could not construct URL from ${currentTab.url}, error: ${e}`);
            }
            console.log("isWindowActive: " + isWindowActive);
            console.log(tabs);

           
            chrome.storage.local.get([tabTimeObjectKey, lastActiveTabKey], function(result) {
                let lastActiveTab = JSON.parse(result[lastActiveTabKey] || '{}');
                let tabTimeObject = JSON.parse(result[tabTimeObjectKey] || '{}');
                console.log("result:"+JSON.stringify(result));

                if (lastActiveTab.hasOwnProperty("url") && lastActiveTab.hasOwnProperty("lastDateVal")) {
                    let lastUrl = lastActiveTab["url"];
                    let currentDateVal = Date.now();
                    let passedSeconds = (currentDateVal - lastActiveTab["lastDateVal"]) * 0.001; // Convert ms to s
                    if (tabTimeObject.hasOwnProperty(lastUrl)) {
                        let lastUrlObjectInfo = tabTimeObject[lastUrl];
                        if (lastUrlObjectInfo.hasOwnProperty("trackedSeconds")) {
                            lastUrlObjectInfo["trackedSeconds"] += passedSeconds;
                        } else {
                            lastUrlObjectInfo["trackedSeconds"] = passedSeconds;
                        }
                    } else {
                        
                        let newUrlInfo = {
                            url: lastUrl,
                            trackedSeconds: passedSeconds,
                            lastDateVal: currentDateVal,
                            startDateVal: lastActiveTab["lastDateVal"]
                        };
                        tabTimeObject[lastUrl] = newUrlInfo;
                    }
                }

               
                let currentDateValue = Date.now();
                let lastTabInfo = {
                    "url": hostName ? hostName : "Unknown Tab",
                    "lastDateVal": currentDateValue
                };
                
                if (!isWindowActive) {
                    lastTabInfo = {};
                }

               
                let newLastTabObject = {};
                newLastTabObject[lastActiveTabKey] = JSON.stringify(lastTabInfo);

             
                chrome.storage.local.set(newLastTabObject, function() {
                    console.log("Last active tab stored: " + hostName);
                });

               
                const tabTimesObjectString = JSON.stringify(tabTimeObject);
                let newTabTimesObject = {};
                newTabTimesObject[tabTimeObjectKey] = tabTimesObjectString;

           
                chrome.storage.local.set(newTabTimesObject, function() {
                    console.log("Tab times object updated.");
                });
            });
        }
    });
}
function onTabTrack(activeInfo) {
    let tabId = activeInfo.tabId;
    let windowId = activeInfo.windowId;
    // Perform actions based on the active tab and windowId
    processTabChange(true); 
}

// Add listener for tab activation event
chrome.tabs.onActivated.addListener(onTabTrack);

