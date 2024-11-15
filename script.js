// map
var map = L.map('map').setView([49.2057, -122.9110], 11);
L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 19,
    attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'
}).addTo(map);

// markers
var marker1 = L.marker([49.2057, -122.9110]).addTo(map);
var marker2 = L.marker([49.1913, -122.8490]).addTo(map);
var marker3 = L.marker([49.1667, -123.1333]).addTo(map);
var markers = [marker1, marker2, marker3];
var redIcon = L.icon({
    iconUrl: 'images/red-marker.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
    shadowSize: [41, 41]
});

// list
var list = document.getElementById('list');
for (var marker of markers) {
    list.innerHTML += `<p>${marker.getLatLng().toString()}</p>`;
}
list.querySelectorAll('p').forEach(child => {
    child.addEventListener('click', highlightMarker);
});

// highlight marker and show details when marker is clicked
for (var marker of markers) {
    marker.on('click', (e) => e.target.setIcon(redIcon));
    marker.bindPopup('<b>Location</b><br>Type:');
}

// events
map.on('moveend', (e) => {
    // update list to show reports whose markers are in the map
    var bounds = e.target.getBounds();
    for (var i = 0; i < markers.length; i++) {
        var lat = markers[i].getLatLng().lat;
        var lng = markers[i].getLatLng().lng;
        if (lat > bounds._northEast.lat || lat < bounds._southWest.lat || 
            lng > bounds._northEast.lng || lng < bounds._southWest.lng) 
        {
            list.querySelector(`p:nth-child(${i + 1})`).style.display = 'none';
        } else {
            list.querySelector(`p:nth-child(${i + 1})`).style.display = 'block';
        }
    }
});
function highlightMarker(e) {
    // highlight marker and show details when list item is clicked
    for (var marker of markers) {
        if (marker.getLatLng().toString() == e.target.innerHTML) {
            marker.setIcon(redIcon);
            marker.openPopup();
            break;
        }
    }
}
function unHighlightMarkers() {
    // unhighlight all markers
    for (var marker of markers) {
        marker.setIcon(L.Icon.Default.prototype);
    }
}
map.on('click', unHighlightMarkers);