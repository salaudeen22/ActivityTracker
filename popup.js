let showTableBtn = document.getElementById("btnShowTable");
let clearTimesBtn = document.getElementById("btnClearTimes");
let errorMessageElement = document.getElementById("errorMessage");
let exportPdfBtn = document.getElementById("btnExportPDf");
let timeTable = document.getElementById("timeTable");
let allUrlCheckBox = document.getElementById("allUrlCheckBox");

function createLogoutButton() {
  var btnLogout = document.createElement("button");
  btnLogout.id = "btnLogout";
  btnLogout.textContent = "Logout";

  btnLogout.addEventListener("click", function () {
    logout();
  });

  document.querySelector(".btnsection").appendChild(btnLogout);
}

function removeLogoutButton() {
  var btnLogout = document.getElementById("btnLogout");
  if (btnLogout) {
    btnLogout.parentNode.removeChild(btnLogout);
  }
}

function logout() {
  chrome.storage.local.remove(
    ["isLoggedIn", "userEmail", "authtoken"],
    function () {
      alert("Logged out successfully.");
      removeLogoutButton();
      showLoginButton();
    }
  );
}

function showLoginButton() {
  var btnLogin = document.getElementById("btnLogin");
  if (btnLogin) {
    btnLogin.style.display = "block";
  }
}

chrome.storage.local.get(["isLoggedIn"], function (data) {
  if (data.isLoggedIn) {
    createLogoutButton();
    hideLoginButton();
  }
});

function hideLoginButton() {
  var btnLogin = document.getElementById("btnLogin");
  if (btnLogin) {
    btnLogin.style.display = "none";
  }
}

function download(filename, text) {
  var element = document.createElement("a");
  element.setAttribute(
    "href",
    "data:text/plain;charset=utf-8," + encodeURIComponent(text)
  );
  element.setAttribute("download", filename);
  element.style.display = "none";
  document.body.appendChild(element);
  element.click();
  document.body.removeChild(element);
}
clearTimesBtn.onclick = function (element) {
  chrome.storage.local.set({ tabTimesObject: "{}" }, function () {
    console.log("Tab times cleared.");
  });
};

// exportPdfBtn.onclick = function(element) {
//     let content = "aldkfjsaldkfjalskofjosldfjabldskfjsoljf";
//     let downloadUrl = "./";
//     let filename = "my-document.pdf";

//     browser.downloads.download({
//         url: downloadUrl,
//         filename: filename,
//         saveAs: true,
//         body: content,
//         conflictAction: "uniquify"
//     }).then((downloadId) => {
//         console.log("PDF successfully downloaded with ID: " + downloadId);
//     }).catch((error) => {
//         console.error("PDF export was not successful: ", error);
//     });
// };

exportPdfBtn.onclick = function (element) {
  let downloadUrl = "./";
  const titleText =
    "Tab-time-trackings-" + encodeURIComponent(new Date().toISOString());
  let content = titleText + "\r\n\r\n";
  const paddings = [40, 10, 12, 35, 35];
  let rowCount = timeTable.rows.length;
  for (var x = 0; x < rowCount; x++) {
    let row = timeTable.rows[x];
    for (var j = 0; j < row.cells.length; j++) {
      let col = row.cells[j];
      content += col.innerText.padEnd(j >= paddings.length ? 40 : paddings[j]);
    }
    content += "\n";
  }
  download(titleText + ".txt", content);
};

showTableBtn.onclick = function (element) {
  const ShowAllurl = allUrlCheckBox.checked;
  chrome.storage.local.get("tabTimesObject", function (dataCont) {
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

      entries.sort(function (el1, el2) {
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

      entries.forEach(function (urlObject) {
        // console.log(urlObject);
        let urlobj = urlObject["url"];

        if (ShowAllurl && urlObject.hasOwnProperty("urlDetails")) {
          let urlDetails = urlObject["urlDetails"];
          console.log(urlDetails);

          const ul = document.createElement("ul");

          urlDetails.forEach((url) => {
            const li = document.createElement("li");
            li.textContent = url;
            ul.appendChild(li);
          });

          let newRow = timeTable.insertRow(0);
          let celHostname = newRow.insertCell(0);
          celHostname.innerHTML = urlObject["url"];

          let detailsCell = newRow.insertCell(1);
          detailsCell.appendChild(ul);
        } else {
          let newRow = timeTable.insertRow(0);
          let celHostname = newRow.insertCell(0);
          let celTimeMinutes = newRow.insertCell(1);
          let celTime = newRow.insertCell(2);
          let celLastDate = newRow.insertCell(3);
          let celFirstDate = newRow.insertCell(4);

          celHostname.innerHTML = urlobj;

          let time_ =
            urlObject["trackedSeconds"] != null
              ? urlObject["trackedSeconds"]
              : 0;
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
            console.log("frist name:" + date.toUTCString());
            date.setTime(urlObject["startDateVal"]);
            celFirstDate.innerHTML = date.toUTCString();
          } else {
            celFirstDate.innerHTML = "date not found ";
          }
        }
      });
      if (!ShowAllurl) {
        let headerRow = timeTable.insertRow(0);
        headerRow.insertCell(0).innerHTML = "Url";
        headerRow.insertCell(1).innerHTML = "Minutes";
        headerRow.insertCell(2).innerHTML = "Tracked Seconds";
        headerRow.insertCell(3).innerHTML = "Last Date";
        headerRow.insertCell(4).innerHTML = "Frist Date";
      }
    } catch (err) {
      const message =
        "Loading the tabTimesObject went wrong: " + err.toString();
      console.error(message);
      errorMessageElement.innerText = message;
    }
  });
};
setInterval(function () {
  chrome.storage.local.get(["tabTimesObject", "userEmail"], function (data) {
    const userEmail = data.userEmail;
    const tabTimeObject = JSON.parse(data.tabTimesObject || "{}")
    
  
    if (userEmail != null && tabTimeObject != null) {
      SendData(userEmail, tabTimeObject);
    }
  });
},   60000);


