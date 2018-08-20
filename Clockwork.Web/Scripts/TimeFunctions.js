
//On User button click this function retrieves the correct DateTime
function UserAction(button) {
    var xhttp = new XMLHttpRequest();
    xhttp.onreadystatechange = function () {
        if (this.readyState == 4 && this.status == 200) {
            var responseDate = new Date(Date.parse(JSON.parse(this.responseText).time));
            var responseJSON = JSON.parse(this.responseText);
            UpdateTable(responseDate, responseJSON);
        }
    };
    if (button.id == 'SubmitButton') {
        xhttp.open("GET", "http://127.0.0.1:5000/api/currenttime", true);
    } else {
        var selectedValue = document.getElementById("timeZoneSelect");
        xhttp.open("GET", "http://127.0.0.1:5000/api/TimeZone/" + selectedValue.options[selectedValue.selectedIndex].text);
    }
    
    xhttp.setRequestHeader("Content-type", "application/json");
    xhttp.send();
}


function StartUp() {
    LoadTable();
    LoadOptions();
}

function LoadTable() {
    var xhttp = new XMLHttpRequest();
    xhttp.onreadystatechange = function () {
        if (this.readyState == 4 && this.status == 200) {
            var responseArray = JSON.parse(this.responseText);
            for (i = 0; i < responseArray.length; i++) {
                AddTableData(
                    responseArray[i].currentTimeQueryId,
                    responseArray[i].time,
                    responseArray[i].utcTime,
                    responseArray[i].clientIp,
                    responseArray[i].timeZone,
                    false
                );
            }
            AddTableData("Query ID", "Time", "UTC", "Client IP", "Time Zone", false);
        }
    };
    xhttp.open("GET", "http://127.0.0.1:5000/api/getDB", true);
    xhttp.setRequestHeader("Content-type", "application/json");
    xhttp.send();
}

//GETs all Timezones from server then populates drop down
function LoadOptions() {
    var xhttp = new XMLHttpRequest();
    xhttp.onreadystatechange = function () {
        if (this.readyState == 4 && this.status == 200) {
            var timeZones = JSON.parse(this.responseText);
            var select = document.getElementById("timeZoneSelect");
            for (i = 0; i < timeZones.length; i++) {
                var listItem = document.createElement('option');
                listItem.value = timeZones[i]
                listItem.innerHTML = timeZones[i];
                select.appendChild(listItem);
            }
        }
    };
    xhttp.open("GET", "http://127.0.0.1:5000/api/getTimeZoneCollection", true);
    xhttp.setRequestHeader("Content-type", "application/json");
    xhttp.send();
}


//This table function out the html table based on data from the database.
function AddTableData(queryID, time, utcTime, clientIP, TimeZone, remakeHeaders) {
    var tableRef = document.getElementById("listView");
    var row = tableRef.insertRow(0);
    var cell1 = row.insertCell(0);
    var cell2 = row.insertCell(1);
    var cell3 = row.insertCell(2);
    var cell4 = row.insertCell(3);
    var cell5 = row.insertCell(4);
    cell1.innerHTML = (queryID);
    cell2.innerHTML = (time);
    cell3.innerHTML = (utcTime);
    cell4.innerHTML = (clientIP);
    cell5.innerHTML = (TimeZone);
    if (remakeHeaders) {
        document.getElementById("listView").deleteRow(1);
        AddTableData("Query ID", "Time", "UTC", "Client IP", "Time Zone", false);
    }
}

//Updates Header Text for date and time
function UpdateTable(responseDate, responseJSON) {
    var dateStr = FormatDate(responseDate);
    var timeStr = FormatTime(responseDate);
    console.log(responseJSON);
    document.getElementById("output").innerHTML = `Today's Date: ${dateStr}`;
    document.getElementById("time").innerHTML = `The current time is: ${timeStr}`;
    AddTableData(
        responseJSON.currentTimeQueryId,
        (String)(responseJSON.time).substr(0, responseJSON.time.length - 6),
        (String)(responseJSON.utcTime).substr(0, responseJSON.utcTime.length - 1),
        responseJSON.clientIp,
        responseJSON.timeZone,
        true
    );
}

function FormatTime(responseDate) {
    var returnStr = "";
    var PM = false;
    if (responseDate.getHours() > 12) {
        returnStr = responseDate.getHours() - 12;
        PM = true;
    } else {
        returnStr = responseDate.getHours();
    }
    ((responseDate.getMinutes() < 10) ? returnStr += `:0${responseDate.getMinutes()}` : returnStr += `:${responseDate.getMinutes()}`);
    ((responseDate.getSeconds() < 10) ? returnStr += `:0${responseDate.getSeconds()}` : returnStr += `:${responseDate.getSeconds()}`);
    ((PM) ? returnStr += 'PM' : returnStr += 'AM');
    return returnStr;
}

function FormatDate(responseDate) {
    var returnStr = `${responseDate.getMonth() + 1}/${responseDate.getDate()}/${responseDate.getFullYear()}`;
    return returnStr;
}