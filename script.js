// Declare globals
var map; // Map HTML element
var report_list; // Report list HTML element
var markers = []; // Markers array

var marker_selected = L.icon({ // Selected marker appearance
    iconUrl: 'images/red-marker.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
    shadowSize: [41, 41]
});

function initializeHome() {
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
    document.body.appendChild(report_list);

    // Retrieve reports from localStorage, initialize to empty array if none
    let storedData = localStorage.getItem('reports');
    let reports = storedData ? JSON.parse(storedData) : [];

    // Iterate through reports
    // Populate report list
    // Populate markers array
    let i = 0;
    for (var report of reports) {
        // Append to report list
        report_list.innerHTML += `
            <tr data-pos="${i}"> 
                <td>${report.latitude && report.longitude ? `(${report.latitude}, ${report.longitude})` : 'N/A'}</td>
                <td>${report.emtype}</td>
                <td>${new Date(report.date_time).toDateString()}</td>
                <td>${report.staus}</td>
                <td>MORE INFO</td>
                <td><button type="button" onClick="removeReport(${i})">Click</button></td>
            </tr>
            `;
        i++;

        // Append to markers array
        if (report.latitude && report.longitude) {
            let marker = L.marker([report.latitude, report.longitude]).addTo(map);
            markers.push(marker);

            // Add click event for selecting marker
            marker.on('click', (e) => {
                unSelectMarkers();
                marker.setIcon(marker_selected);
            });
        }
    }

    // Add event listeners for selecting rows in report list
    report_list.querySelectorAll('tr').forEach(child => {
        child.addEventListener('click', selectListMarker);
    });

    // Add event to only list reports that have markers visible on map
    map.on('moveend', setVisibleMarkers);

    // Add event listener to each marker to update when selected
    for (var marker of markers) {
    marker.on('click', (e => {
        unSelectMarkers();
        e.target.setIcon(marker_selected);
    } ));
    marker.bindPopup('<b>Location</b><br>Type:');
    }

    // Add event listener to deselect all markers when map is clicked
    map.on('click', unSelectMarkers);

    // Update visible markers on load
    setVisibleMarkers();
}


function selectListMarker(e) {
    // unhighlight all markers
    unSelectMarkers();

        // Get the parent row (`tr`) of the clicked element
        const row = e.target.closest('tr');

        // Check if the row exists and get its first cell (`td`)
        const target = row ? row.cells[0].textContent.trim() : null;
    
        if (!target) {
            console.error("Row or first cell not found!");
            return;
        }

        console.log(target);
    // highlight marker and show details when list item is clicked
    for (var marker of markers) {
        const coordinates_string = `(${marker.getLatLng().lat}, ${marker.getLatLng().lng})`;
        console.log(coordinates_string);
        
        if (coordinates_string == target) {
            marker.setIcon(marker_selected);
            marker.openPopup();
            break;
        }
    } 
}


function unSelectMarkers() {
    // unhighlight all markers
    for (var marker of markers) {
        marker.setIcon(L.Icon.Default.prototype);
    }
}


function setVisibleMarkers() {
    // update list to show reports whose markers are in the map
    
    let bounds = map.getBounds();
    for (var i = 0; i < markers.length; i++) {
        let lat = markers[i].getLatLng().lat;
        let lng = markers[i].getLatLng().lng;

        let in_bounds = (lat < bounds._northEast.lat && lat > bounds._southWest.lat && 
        lng < bounds._northEast.lng && lng > bounds._southWest.lng);

        report_list.querySelector(`tbody:nth-child(${i + 2})`).style.display = in_bounds ? '' : 'none';
    }
}