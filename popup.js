let showTableBtn = document.getElementById('btnShowTable');
let clearTimesBtn = document.getElementById('btnClearTimes');
let errorMessageElement = document.getElementById('errorMessage');
let timeTable = document.getElementById("timeTable");

clearTimesBtn.onclick = function(element) {
    chrome.storage.local.set({ "tabTimesObject": "{}" }, function() {
        console.log("Tab times cleared.");
      
    });
};

showTableBtn.onclick = function(element) {
    chrome.storage.local.get("tabTimesObject", function(dataCont) {
        console.log(dataCont);
        let dataString = dataCont["tabTimesObject"];
        if (dataString == null) {
            return;
        }
        try {
            let data = JSON.parse(dataString);
          
            timeTable.innerHTML = "";
          
            let entries = [];
            for (let key in data) {
                if (data.hasOwnProperty(key)) {
                    entries.push(data[key]);
                }
            }
           
            entries.sort(function(el1, el2) {
                let e1 = el1["trackedSeconds"];
                let e2 = el2["trackedSeconds"];
                if (isNaN(e1) || isNaN(e2)) {
                    return 0;
                }
                if (e1 > e2) {
                    return -1;
                } else if (e1 < e2) {
                    return 1;
                }
                return 0;
            });
           
            entries.forEach(function(urlObject) {
                console.log(urlObject);
                let newRow = timeTable.insertRow(0); 
                let celHostname = newRow.insertCell(0);
                let celTimeMinutes = newRow.insertCell(1);
                let celTime = newRow.insertCell(2);
                let celLastDate = newRow.insertCell(3);
                let celFirstDate = newRow.insertCell(4);
                celHostname.innerHTML = urlObject["url"];
                let time_ = urlObject["trackedSeconds"] != null ? urlObject["trackedSeconds"] : 0;
                celTime.innerHTML = Math.round(time_);
                celTimeMinutes.innerHTML = (time_ / 60).toFixed(2);
                let date = new Date();
                if (urlObject.hasOwnProperty(["lastDateVal"])) {
                    date.setTime(urlObject["lastDateVal"]);
                    celLastDate.innerHTML = date.toUTCString();
                  } else {
                    celLastDate.innerHTML = "date not found ";
                  }
                  if (urlObject.hasOwnProperty("startDateVal")) {
                    console.log("frist name:"+ date.toUTCString());
                    date.setTime(urlObject["startDateVal"]);
                    celFirstDate.innerHTML = date.toUTCString();
                  } else {
                    celFirstDate.innerHTML = "date not found ";
                  }
          
            });
            
            let headerRow = timeTable.insertRow(0);
            headerRow.insertCell(0).innerHTML = "Url";
            headerRow.insertCell(1).innerHTML = "Minutes";
            headerRow.insertCell(2).innerHTML = "Tracked Seconds";
            headerRow.insertCell(3).innerHTML = "Last Date";
            headerRow.insertCell(4).innerHTML = "Frist Date";
        } catch (err) {
            const message = "Loading the tabTimesObject went wrong: " + err.toString();
            console.error(message);
            errorMessageElement.innerText = message;
        }
    });
};
