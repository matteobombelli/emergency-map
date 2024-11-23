// Declare globals
var map; // Map HTML element
var markers = []; // Array of map markers
var report_list; // Report list HTML element
var details; // Details HTML element

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

    // Dynamically initialize report list
    report_list = document.createElement('table');
    document.body.appendChild(report_list);

    // Retrieve reports from localStorage, initialize to empty array if none
    var storedData = localStorage.getItem('reports');
    let reports = storedData ? JSON.parse(storedData) : [];

    // Populate map with reports
    populateMap(reports);

    // Add event listeners for selecting rows in the report list
    report_list.querySelectorAll('tr').forEach(child => {
        child.addEventListener('click', () => selectReport(child.id));
    });

    // Add event to only list reports that have markers visible on map
    map.on('moveend', updateReportList);
    // Add event to deselect markers when map is clicked
    map.on('click', unSelectMarkers);

    // Set the listed reports
    updateReportList();
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
                    <td>${report.latitude && report.longitude ? `(${report.latitude}, ${report.longitude})` : 'N/A'}</td>
                    <td>${report.emtype}</td>
                    <td>${new Date(report.date_time).toDateString()}</td>
                    <td>${report.staus}</td>
                    <td><button type="button" onClick="removeReport('${report.id}')"><img src="images/x.png" alt="Remove"></button></td>
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
        if (details != null && !in_bounds && details.id == marker.id) {

            hideDetails();
            
        }
    }
}

function selectReport(id) {
    // Reset all markers
    unSelectMarkers();

    // Highlight corrosponding marker
    for (let marker of markers) {
        if (marker.id == id) {
            marker.setIcon(marker_selected);
            break;
        }
    } 

    // Show corrosponding details
    showDetails(id);
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
            details.id = id;
            details.innerHTML = `
                <h3>Report Details</h3>
                <p><strong>Location:</strong> (${report.latitude}, ${report.longitude})</p>
                <p><strong>Type:</strong> ${report.emtype}</p>
                <p><strong>Time Reported:</strong> ${new Date(report.date_time).toLocaleString()}</p>
                <p><strong>Status:</strong> ${report.staus}</p>
                <button onclick="editDetails(${report})">Edit</button>
                <button onclick="hideDetails()">Close</button>
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

function editDetails(i) {
    let storedData = localStorage.getItem('reports');
    let reports = storedData ? JSON.parse(storedData) : [];

    // Get the selected report
    let report = reports[i];

    details.innerHTML = `
        <h3>Report Details</h3>
        <label for="fname">First Name: </label>
        <input type="text" id="fname" name="fname" required value="${report.fname}"><br><br>
        <label for="lname">Last Name: </label>
        <input type="text" id="lname" name="lname" required value="${report.lname}"><br><br>
        <label for="telnum">Telephone: </label>        
        <input type="text" id="telnum" name="telnum" required value="${report.telnum}"><br><br>
        <label for="emtype">Emergency Type: </label>       
        <input type="text" id="emtype" name="emtype" required value="${report.emtype}"><br><br>
        <label for="addr">Address: </label>
        <input type="text" id="addr" name="addr" required value="${report.addr}"><br><br>
        <label for="latitude">Latitude: </label>
        <input type="number" step="0.000001" id="latitude" name="latitude" value="${report.latitude}"><br><br>
        <label for="longitude">Longitude: </label>
        <input type="number" step="0.000001" id="longitude" name="longitude" value="${report.longitude}"><br><br>
        <label for="empic">Picture of Emergency: </label>
        <input type="url" id="empic" name="empic" value="${report.empic}"><br><br>
        <label for="comment">Comment: </label>
        <input type="text" id="comment" name="comment" value="${report.comment}"><br><br>
        <button onclick="saveDetails(${i})">Save</button>
        <button onclick="showDetails(${i})">Close</button>
        `;
}

function saveDetails(i){
    let storedData = localStorage.getItem('reports');
    let reports = storedData ? JSON.parse(storedData) : [];

    // Get the selected report
    let report = reports[i];

    report.fname = document.getElementById('fname').value;
    report.lname = document.getElementById('lname').value;
    report.telnum = document.getElementById('telnum').value;
    report.emtype = document.getElementById('emtype').value;
    report.addr = document.getElementById('addr').value;
    report.latitude = document.getElementById('latitude').value;
    report.longitude = document.getElementById('longitude').value;
    report.empic = document.getElementById('empic').value;
    report.comment = document.getElementById('comment').value;

    // Save the updated report
    localStorage.setItem('reports', JSON.stringify(reports));

    // Update the details
    showDetails(i);
}

//this function is optional pop up window for editing details
function showPopup(i){
    // // Check if the popup already exists and remove it
    // const existingPopup = document.getElementById('dynamic-popup');
    // if (existingPopup) {
    //     existingPopup.remove();
    // }

    // // Create the overlay
    // const overlay = document.createElement('div');
    // overlay.id = 'dynamic-overlay';
    

    // // Create the popup container
    // const popup = document.createElement('div');
    // popup.id = 'dynamic-popup';

    // // Add content to the popup
    // const title = document.createElement('h2');
    // title.textContent = `Edit report details`;
    // popup.appendChild(title);

    // let storedData = localStorage.getItem('reports');
    // let reports = storedData ? JSON.parse(storedData) : [];

    // // Get the selected report
    // let report = reports[i];

    // const description = document.createElement('div');
    // description.innerHTML = `
    //     <label for="fname">First Name: </label>
    //     <input type="text" id="fname" name="fname" required value="${report.fname}"><br><br>
    //     <label for="lname">Last Name: </label>
    //     <input type="text" id="lname" name="lname" required value="${report.lname}"><br><br>
    //     <label for="telnum">Telephone: </label>        
    //     <input type="text" id="telnum" name="telnum" required value="${report.telnum}"><br><br>
    //     <label for="emtype">Emergency Type: </label>       
    //     <input type="text" id="emtype" name="emtype" required value="${report.emtype}"><br><br>
    //     <label for="addr">Address: </label>
    //     <input type="text" id="addr" name="addr" required value="${report.addr}"><br><br>
    //     <label for="latitude">Latitude: </label>
    //     <input type="number" step="0.000001" id="latitude" name="latitude" value="${report.latitude}"><br><br>
    //     <label for="longitude">Longitude: </label>
    //     <input type="number" step="0.000001" id="longitude" name="longitude" value="${report.longitude}"><br><br>
    //     <label for="empic">Picture of Emergency: </label>
    //     <input type="url" id="empic" name="empic" value="${report.empic}"><br><br>
    //     <label for="comment">Comment: </label>
    //     <input type="text" id="comment" name="comment" value="${report.comment}"><br><br>
    //     `;
    // popup.appendChild(description);

    // // Add a close button
    // const closeButton = document.createElement('button');
    // closeButton.id = 'popup-button';
    // closeButton.textContent = 'Close';

    // const saveButton = document.createElement('button');
    // saveButton.id = 'popup-button';
    // saveButton.textContent = 'Save';
    

    // closeButton.addEventListener('click', () => {
    //     overlay.remove();
    //     popup.remove();
    // });

    // //TODO
    // saveButton.addEventListener('click', () => {
    //     overlay.remove();
    //     popup.remove();
    // });

    // popup.appendChild(closeButton);
    // popup.appendChild(saveButton);

    // // Append overlay and popup to the body
    // document.body.appendChild(overlay);
    // document.body.appendChild(popup);
}