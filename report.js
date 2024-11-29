class report {   // Report object
    constructor() {
        const time = new Date()
        this.id = newId();
        this.date_time = time.toLocaleString('en-US', { timeZone: 'UTC' });
        this.status = "OPEN";

        function newId() {
            // Retrieve array of reports, if non-existent initialize new array
            var storedData = localStorage.getItem('reportId');
            let id = storedData ? JSON.parse(storedData) : 0;
            
            // Check for null
            if (id == null) {
                id = 0;
            } else {
                id++;
            }
    
            // Store new id counter
            localStorage.setItem('reportId', id);
            
            return 'report_' + id;
        }
    }
}

function initializeReport() {
    // Add top nav bar
    const topnav = document.createElement("div");
    topnav.className = "topnav";
    topnav.innerHTML = `
        <a href="index.html">Home</a>
        <a class="active" href="report.html">Create Report</a>
    `;
    document.body.appendChild(topnav);

    // Dynamically initialize form
    let report_form = document.createElement('form');
    report_form.className = 'report';
    report_form.innerHTML = `
        <fieldset>
        <label for="fname">First Name: </label>
        <input type="text" id="fname" name="fname" required><br><br>
        <label for="lname">Last Name: </label>
        <input type="text" id="lname" name="lname" required><br><br>
        <label for="telnum">Telephone Number: </label>        
        <input type="tel" id="telnum" name="telnum" required placeholder="123-456-7890"><br><br>
        <label for="emtype">Emergency Type: </label>       
        <input type="text" id="emtype" name="emtype" required><br><br>
        <label for="addr">Address: </label>
        <input type="text" id="addr" name="addr" required placeholder="1234 Example Street, Vancouver, BC, Canada"><br><br>
        <label for="latitude">Latitude (optional): </label>
        <input type="number" step="0.000001" id="latitude" name="latitude"><br><br>
        <label for="longitude">Longitude (optional): </label>
        <input type="number" step="0.000001" id="longitude" name="longitude"><br><br>
        <label for="empic">Picture of Emergency: </label>
        <input type="url" id="empic" name="empic"><br><br>
        <label for="comment">Comment: </label>
        <input type="text" id="comment" name="comment"><br><br>
        <button type="submit">Submit</button>
        </fieldset>
    `;

    // Add form to document
    document.body.appendChild(report_form);

    // Listen for submit
    report_form.addEventListener('submit', async (e) => {
        e.preventDefault();

        const fd = new FormData(report_form);
        const obj = Object.fromEntries(fd);
        
        // Check for missing latitude and longitude and geocode if needed
        if (!obj.latitude || !obj.longitude) {
            const address = obj.addr;
            if (address) {
                const coords = await geocodeAddress(address);
                if (coords) {
                    obj.latitude = Math.round(coords.lat * 10000) / 10000;
                    obj.longitude = Math.round(coords.lon * 10000) / 10000;
                }
            }
        }

        const new_report = new report();
        Object.assign(new_report, obj);

        // Retrieve array of reports, if non-existent initialize new array
        var storedData = localStorage.getItem('reports');
        let reports = storedData ? JSON.parse(storedData) : [];
        
        // Append the object to the array
        reports.push(new_report);

        // Save new array
        localStorage.setItem('reports', JSON.stringify(reports));
        
        // Clear the form
        report_form.reset();
    });
}

// Geocoding function using Nominatim
async function geocodeAddress(address) {
    try {
        const response = await fetch(`https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(address)}&format=json`);
        const data = await response.json();
        if (data && data.length > 0) {
            return {
                lat: parseFloat(data[0].lat),
                lon: parseFloat(data[0].lon)
            };
        }
        alert('Geocoding failed: Address not found.');
    } catch (error) {
        console.error('Error during geocoding:', error);
        alert('Geocoding error occurred.');
    }
    return null;
}
