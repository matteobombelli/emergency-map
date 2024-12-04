// Declare globals
var map; // Map HTML element
var markers = []; // Array of map markers
var report_list; // Report list HTML element
var details; // Details HTML element
const PASSCODE = "21232f297a57a5a743894a0e4a801fc3";


var marker_selected = L.icon({ // Selected marker appearance
    iconUrl: 'images/red-marker.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
    shadowSize: [41, 41]
});

function initializeHome() {
    // Dynamincally initialize topnav
    const topnav = document.createElement("div");
    topnav.className = "topnav";
    topnav.innerHTML = `
        <a class="active" href="index.html">Home</a>
        <a href="report.html">Create Report</a>
        `
    document.body.appendChild(topnav);
    
    // Dynamically initialize map
    let map_container = document.createElement('div');
    map_container.id = 'map';
    document.body.appendChild(map_container);

    // Load map API with view set to Vancouver
    map = L.map('map').setView([49.2057, -122.9110], 11);
    L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 19,
        attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'
    }).addTo(map);

    // add a container for the list to allow overflow
    var div = document.createElement('div');
    div.style.overflowX = "auto";
    document.body.appendChild(div);
    
    // Dynamically initialize report list
    report_list = document.createElement('table');
    report_list.className = 'report_list';
    div.appendChild(report_list)

    // Retrieve reports from localStorage, initialize to empty array if none
    var storedData = localStorage.getItem('reports');
    let reports = storedData ? JSON.parse(storedData) : [];

    // Populate map with reports
    populateMap(reports);

    // Add event to only list reports that have markers visible on map
    map.on('moveend', updateReportList);
    // Add event to deselect markers when map is clicked
    map.on('click', () => {
        if(details){
            unSelectMarkers();
            hideDetails();
        }
    });
}

function populateMap(reports) {
    // Reset globals
    // Clear all markers from the map
    markers.forEach(marker => {
        map.removeLayer(marker);  // Remove each marker
    });
    report_list.innerHTML = `
    <tr>
        <th>Location</th>
        <th>Type</th>
        <th>Time Reported</th>
        <th>Status</th>
        <th></th>
    </tr>
    `;
    markers = [];

    // Check reports is not null
    if (reports == null) {
        return;
    }

    for (var report of reports) {
        report_list.innerHTML += `
        
                <tr id="${report.id}"> 
                    <td>${report.addr} ${report.latitude && report.longitude ? `(${report.latitude}, ${report.longitude})` : 'N/A'}</td>
                    <td>${report.emtype}</td>
                    <td>${new Date(report.date_time).toDateString()}</td>
                    <td>${report.status}</td>
                    <td><button type="button" onClick="promptPasscode(${report.id}, 'delete')"><img src="images/x.png" alt="Remove" title= "Delete Report"></button></td>
                </tr>
            `;

        if (report.latitude && report.longitude) {
            let marker = L.marker([report.latitude, report.longitude]).addTo(map);
            marker.id = report.id;
            markers.push(marker);

            // Add event to marker that selects its associated report
            marker.on('click', () => {
                selectReport(marker.id);
            });
        }
    }

    // Set the listed reports
    updateReportList();
}

function updateReportList() {
    let bounds = map.getBounds();
    for (let marker of markers) {
        let lat = marker.getLatLng().lat;
        let lng = marker.getLatLng().lng;

        let in_bounds = (lat < bounds._northEast.lat && lat > bounds._southWest.lat && 
        lng < bounds._northEast.lng && lng > bounds._southWest.lng);

        document.getElementById(marker.id).style.display = in_bounds ? '' : 'none';

        // Hide details and unselect marker if marker is off the map
        if (details != null && !in_bounds && details.id == `details_${marker.id}`) {
            hideDetails();
            
        }
    }

    // Add event listeners for selecting rows in the report list
    report_list.querySelectorAll('tr').forEach(child => {
        child.addEventListener('click', () => selectReport(child.id));
    });
}

function selectReport(id) {
    // Reset all markers
    unSelectMarkers();

    // Show corrosponding details
    showDetails(id);
    // Highlight corrosponding marker
    for (let marker of markers) {
        if (marker.id == id) {
            marker.setIcon(marker_selected);
            break;
        }
    } 
}

function removeReport(id) {
    // Retrieve reports from localStorage, initialize to an empty array if none
    var storedData = localStorage.getItem('reports');
    let reports = storedData ? JSON.parse(storedData) : [];
    
    // Filter out the report with the matching ID
    reports = reports.filter(report => report.id !== id);

    localStorage.setItem('reports', JSON.stringify(reports));

    // Repopulate map
    populateMap(reports);
}

function unSelectMarkers() {
    // unhighlight all markers
    for (var marker of markers) {
        marker.setIcon(L.Icon.Default.prototype);
    }
}

function showDetails(id) {
    // Erase current displaying details, if any
    if (details != null) {
        hideDetails(details);
    }

    // Load reports
    let storedData = localStorage.getItem('reports');
    let reports = storedData ? JSON.parse(storedData) : [];
    
    // Get the selected report
    for (let report of reports) {
        if (report.id == id) {
            
            // Dynamically create details element 
            details = document.createElement('div');
            details.className = 'details';
            
            // Hide img if a user didn't provide an url
            var display = "";
            if(report.empic == "") {
                display = "none";
            }

            // Set the details id to details_{report.id} because each should be unique
            details.id = `details_${report.id}`;
            details.innerHTML = `
                <h3>Report Details</h3>
                <img class="reportImg" style="display: ${display};" src="${report.empic}"/>
                <p><strong>Type:</strong> ${report.emtype}</p>
                <p><strong>Location:</strong> ${report.addr}</p>
                <p><strong>Reported by:</strong> ${report.fname} ${report.lname} (${report.telnum})</p>
                <p><strong>Time Reported:</strong> ${new Date(report.date_time).toLocaleString()}</p>
                <p><strong>Status:</strong> ${report.status}</p>
                <p><strong>Comments:</strong> ${report.comment}</p>
                <button onclick="hideDetails()">Close</button>
                <button onclick="promptPasscode(${report.id}, 'edit')">Edit</button>
            `;
            // Append details to the document
            document.body.appendChild(details);
        }
    }
}

function hideDetails() {
    // Remove details from document

    unSelectMarkers();
    document.body.removeChild(details);
    details = null;
}


//edit the details of the report
function editDetails(report) {
    // Load reports
    let storedData = localStorage.getItem('reports');
    let reports = storedData ? JSON.parse(storedData) : [];
    for (element of reports) {
        if (element.id == report.id) {
            if (details != null) {
                // Remove the current details and show the 'edit' details which is from the report form
                hideDetails(details);
                details = document.createElement('div');
                details.className = 'details';
                details.innerHTML = `
                    <h3>Report Details</h3>
                    <label for="fname">First Name: </label>
                    <input type="text" id="fname" name="fname" required value="${element.fname}"><br><br>
                    <label for="lname">Last Name: </label>
                    <input type="text" id="lname" name="lname" required value="${element.lname}"><br><br>
                    <label for="telnum">Telephone: </label>        
                    <input type="text" id="telnum" name="telnum" required value="${element.telnum}"><br><br>
                    <label for="emtype">Emergency Type: </label>       
                    <input type="text" id="emtype" name="emtype" required value="${element.emtype}"><br><br>
                    <label for="addr">Address: </label>
                    <input type="text" id="addr" name="addr" required value="${element.addr}"><br><br>
                    <label for="latitude">Latitude: </label>
                    <input type="number" step="0.000001" id="latitude" name="latitude" value="${element.latitude}"><br><br>
                    <label for="longitude">Longitude: </label>
                    <input type="number" step="0.000001" id="longitude" name="longitude" value="${element.longitude}"><br><br>
                    <label for="empic">Picture of Emergency: </label>
                    <input type="url" id="empic" name="empic" value="${element.empic}"><br><br>
                    <label for="comment">Comment: </label>
                    <input type="text" id="comment" name="comment" value="${element.comment}"><br><br>
                    <label for="status">Status: </label>
                    <select id="status" name="status" value = "${element.status}">
                        <option value="OPEN">OPEN</option>
                        <option value="RESOLVED">RESOLVED</option>
                    </select><br><br>
                    <button onclick="showDetails(${element.id})">Cancel</button>
                    <button onclick="saveDetails(${element.id})">Save</button>
                    `; 
                    document.body.appendChild(details);
                    let opt = document.querySelector(`.details select[id="status"] option[value="${element.status}"]`);
                    opt.selected = true;
                }
            }
        }    
    }


//saves the edited details
function saveDetails(report){
    // Load reports
    let storedData = localStorage.getItem('reports');
    let reports = storedData ? JSON.parse(storedData) : [];
    
    for (element of reports) {
        if (element.id == report.id) {
            // Update the report with the new details
            element.fname = document.getElementById('fname').value;
            element.lname = document.getElementById('lname').value;
            element.telnum = document.getElementById('telnum').value;
            element.emtype = document.getElementById('emtype').value;
            element.addr = document.getElementById('addr').value;
            element.latitude = document.getElementById('latitude').value;
            element.longitude = document.getElementById('longitude').value;
            element.empic = document.getElementById('empic').value;
            element.comment = document.getElementById('comment').value;
            element.status = document.getElementById('status').value;
        }
    }

    // Save the updated reports, hide the details, repopulate map incase coords changed, and refresh the page
    localStorage.setItem('reports', JSON.stringify(reports));
    hideDetails();
    populateMap(reports);
    refreshPage();
}

function refreshPage(){
    location.reload();
}

// Function that converts argument into a hash value and returns it
// Returns null if an error occurs
async function hashValue(valueToHash) {
    var url = `https://api.hashify.net/hash/md5/hex?value=${encodeURIComponent(valueToHash)}`;
    try{
        const response = await fetch(url);
        const data = await response.json();

        if (data.Digest == PASSCODE) {
            return true;
        }
        return false;
    }catch(error){
        console.error("Error:", error);
        return null;
    }
    
}


function promptPasscode(report, type){
    // Check if the popup already exists and remove it
    
    const existingPopup = document.getElementById('dynamic-popup');
    if (existingPopup) {
        existingPopup.remove();
    }
    // Create the overlay
    const overlay = document.createElement('div');
    overlay.id = 'dynamic-overlay';
    
    // Create the popup container
    const popup = document.createElement('div');
    popup.id = 'dynamic-popup';
    // Add content to the popup
    const title = document.createElement('h2');
    if(type == 'delete'){
        title.textContent = `You are about to delete this report. Enter Passcode to confirm:`;
    }
    else{
        title.textContent += `Enter Passcode: `
    }
    popup.appendChild(title);
    
    const description = document.createElement('div');
    description.innerHTML = `
        <input type="password" id="passcode" name="passcode" required>
        `;
    popup.appendChild(description);
    // Add a close button
    const closeButton = document.createElement('button');
    closeButton.id = 'popup-button';
    closeButton.textContent = 'Close';
    const enterButton = document.createElement('button');
    enterButton.id = 'popup-button';
    enterButton.textContent = 'Enter';
    
    closeButton.addEventListener('click', () => {
        overlay.remove();
        popup.remove();
    });
    //TODO
    enterButton.addEventListener('click', async () => {
        // Check if the passcode is correct
        try{
            const passcodeInput = await hashValue(document.getElementById('passcode').value);
    
        if (passcodeInput == true) {
            if (type == 'edit') {
                overlay.remove();
                popup.remove();
                editDetails(report);
            } else if (type == 'delete') {`             `
                overlay.remove();
                popup.remove();
                removeReport(report.id);
                hideDetails();
            }
        } else if (passcodeInput == false) {
            alert("Incorrect passcode");
            
        } else {
            alert("Error: Could not verify passcode");
        }

        }catch(error){
            console.error("Error:", error);
            alert("An error occurred. Please try again.");
        }
        
    });
    popup.appendChild(closeButton);
    popup.appendChild(enterButton);
    // Append overlay and popup to the body
    document.body.appendChild(overlay);
    document.body.appendChild(popup);
}