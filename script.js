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
    map.on('click', () => {
        unSelectMarkers();
        hideDetails();
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
                <p><strong>Location:</strong> (${report.latitude}, ${report.longitude})</p>
                <p><strong>Type:</strong> ${report.emtype}</p>
                <p><strong>Time Reported:</strong> ${new Date(report.date_time).toLocaleString()}</p>
                <p><strong>Status:</strong> ${report.staus}</p>
                <button onclick="editDetails(${report.id})">Edit</button>
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
                    <button onclick="saveDetails(${element.id})">Save</button>
                    <button onclick="showDetails(${element.id})">Cancel</button>
                    `;
                    document.body.appendChild(details);
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
