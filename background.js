const tabTimeObjectKey = "tabTimesObject"; // { key:url, value: {url:string, trackedSeconds: number, lastDateVal: number //utc milliseconds?,startDateVal:number,urlDetails:string[]}}
const lastActiveTabKey = "lastActiveTab"; // {url:string, lastDateVal: number,fullUrl:String}

chrome.runtime.onInstalled.addListener(function () {
  console.log("Extension installed or updated.");
  const currentDate = new Date();
  localStorage.setItem("installDate", currentDate.toISOString());

  chrome.declarativeContent.onPageChanged.removeRules(undefined, function () {
    chrome.declarativeContent.onPageChanged.addRules([
      {
        conditions: [
          new chrome.declarativeContent.PageStateMatcher({
            pageUrl: {},
          }),
        ],
        actions: [new chrome.declarativeContent.ShowPageAction()],
      },
    ]);
  });
});
function isNewDay() {

  const installDate = new Date(localStorage.getItem('installDate'));

  const currentDate = new Date();
  
 
  return installDate.getFullYear() !== currentDate.getFullYear() ||
         installDate.getMonth() !== currentDate.getMonth() ||
         installDate.getDate() !== currentDate.getDate();
}

function resetDataOnNewDay() {
  if (isNewDay()) {
    
      chrome.storage.local.set({ "tabTimesObject": {} }, function() {
          console.log("Time spent on websites reset.");
      });
      
    
      chrome.storage.local.set({ "timeLimits": {} }, function() {
          console.log("Time limits reset.");
      });

    
      chrome.storage.local.set({ "restrictedWebsites": [] }, function() {
          console.log("Restricted websites reset.");
      });

     
      const currentDate = new Date();
      localStorage.setItem('installDate', currentDate.toISOString());

      console.log("Data reset for the new day.");
  }
}
function handleTabUpdate(tabId, changeInfo, tab) {
 
  resetDataOnNewDay();
  
  
}


chrome.tabs.onUpdated.addListener(handleTabUpdate);
chrome.windows.onFocusChanged.addListener(function (windowId) {
  if (windowId === chrome.windows.WINDOW_ID_NONE) {
    // Reset the last active tab data if the window loses focus
    resetLastActiveTab();
  } else {
    // Process tab change if the window gains focus
    processTabChange(true);
  }
});

function resetLastActiveTab() {
  chrome.storage.local.set({ [lastActiveTabKey]: "" }, function () {
    console.log("Last active tab reset.");
  });
}

function processTabChange(isWindowActive) {
  chrome.tabs.query({ active: true }, function (tabs) {
    if (tabs.length > 0 && tabs[0] !== null) {
      let currentTab = tabs[0];
      let url = currentTab.url;

      let title = currentTab.title;
      let hostName = url;
      try {
        let urlObject = new URL(hostName);

        hostName = urlObject.hostname;
        console.log("hostname" + hostName);
      } catch (e) {
        console.log(e);
        // console.error(`Could not construct URL from ${currentTab.url}, error: ${e}`);
      }
      console.log("isWindowActive: " + isWindowActive + "url:" + url);
      console.log(tabs);

      chrome.storage.local.get(
        [tabTimeObjectKey, lastActiveTabKey],
        function (result) {
          let lastActiveTab = JSON.parse(result[lastActiveTabKey] || "{}");
          let tabTimeObject = JSON.parse(result[tabTimeObjectKey] || "{}");
          console.log("result:" + JSON.stringify(result));

          if (
            lastActiveTab.hasOwnProperty("url") &&
            lastActiveTab.hasOwnProperty("lastDateVal")
          ) {
            let lastUrl = lastActiveTab["url"];
            let currentDateVal = Date.now();
            let passedSeconds =
              (currentDateVal - lastActiveTab["lastDateVal"]) * 0.001; // Convert ms to s

            let fullUrl = lastUrl;
            if (lastActiveTab.hasOwnProperty("fullUrl")) {
              fullUrl = lastActiveTab["fullUrl"];
            }

            if (tabTimeObject.hasOwnProperty(lastUrl)) {
              let lastUrlObjectInfo = tabTimeObject[lastUrl];
              if (lastUrlObjectInfo.hasOwnProperty("trackedSeconds")) {
                lastUrlObjectInfo["trackedSeconds"] += passedSeconds;
              } else {
                lastUrlObjectInfo["trackedSeconds"] = passedSeconds;
              }
              lastUrlObjectInfo["lastDateVal"] = currentDateVal;
              if (lastUrlObjectInfo.hasOwnProperty("urlDetails")) {
                let detailUrlArr = lastUrlObjectInfo["urlDetails"];

                if (detailUrlArr.indexOf(fullUrl) > 0) {
                  detailUrlArr.push(fullUrl);
                } else {
                  lastUrlObjectInfo["urlDetails"] = [fullUrl];
                }
              }
            } else {
              let newUrlInfo = {
                url: lastUrl,
                trackedSeconds: passedSeconds,
                lastDateVal: currentDateVal,
                startDateVal: lastActiveTab["lastDateVal"],
                urlDetails: [fullUrl],
              };
              tabTimeObject[lastUrl] = newUrlInfo;
            }
          }

          let currentDateValue = Date.now();
          let lastTabInfo = {
            url: hostName ? hostName : "Unknown Tab",
            lastDateVal: currentDateValue,
            fullUrl: url,
          };

          if (!isWindowActive) {
            lastTabInfo = {};
          }

          let newLastTabObject = {};
          newLastTabObject[lastActiveTabKey] = JSON.stringify(lastTabInfo);

          chrome.storage.local.set(newLastTabObject, function () {
            console.log("Last active tab stored: " + hostName);
          });

          const tabTimesObjectString = JSON.stringify(tabTimeObject);
          let newTabTimesObject = {};
          newTabTimesObject[tabTimeObjectKey] = tabTimesObjectString;

          chrome.storage.local.set(newTabTimesObject, function () {
            console.log("Tab times object updated.");
          });
        }
      );
    } else {
      console.log("no active tab found");
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

async function SendData(userEmail, dataString) {
  try {
      const response = await fetch('http://localhost:4000/api/sendData', {
          method: 'POST',
          headers: {
              'Content-Type': 'application/json'
          },
          body: JSON.stringify({
              email: userEmail,
              screen_data: [dataString]
          })
      });

      if (response.ok) {
          const data = await response.json();
          return data;
      } else {
          return response.statusText;
      }
  } catch (error) {
      return error;
  }
}

setInterval(function () {
  chrome.storage.local.get(["tabTimesObject", "userEmail"], function (data) {
    const userEmail = data.userEmail;
    const tabTimeObject = JSON.parse(data.tabTimesObject || "{}")

  
    if (userEmail != null && tabTimeObject != null) {
      SendData(userEmail, tabTimeObject);
    }
  });
},   60000);
