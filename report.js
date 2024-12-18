class report {   // Report object
    constructor() {
        const time = new Date()
        this.id = newId();
        this.date_time = time.toLocaleString('en-US', { timeZone: 'Canada/Pacific' });
        this.status = "OPEN";

        function newId() {
            // Retrieve report id counter, if empty initialize to 0
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
        <input type="text" id="addr" name="addr" required placeholder="1234 Example Street, Vancouver, BC, Canada">
        <span id="addr-validation-msg" style="color: red;"></span><br><br>
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

    // Track address validation status
    let isAddressValid = false;

    // Add validation to address field
    const addrField = document.getElementById('addr');
    const validationMsg = document.getElementById('addr-validation-msg');
    const phoneField = document.getElementById('telnum');

    addrField.addEventListener('blur', async () => {
        const address = addrField.value.trim();
        if (!address) {
            validationMsg.textContent = "Address is required.";
            isAddressValid = false;
            return;
        }

        validationMsg.textContent = "Validating address...";
        const coords = await geocodeAddress(address);

        if (coords) {
            validationMsg.textContent = "Address is valid.";
            validationMsg.style.color = "green";
            isAddressValid = true;

            // Optionally set latitude and longitude fields
            let roundingMult = 10 ** 6;
            document.getElementById('latitude').value = Math.round(coords.lat * roundingMult) / roundingMult;
            document.getElementById('longitude').value = Math.round(coords.lon * roundingMult) / roundingMult;
        } else {
            validationMsg.textContent = "Invalid address. Please check and try again.";
            validationMsg.style.color = "red";
            isAddressValid = false;
        }
    });

    // Listen for submit
    report_form.addEventListener('submit', async (e) => {
        e.preventDefault();

        if (!isAddressValid) {
            alert("Please provide a valid address before submitting.");
            return;
        }
        const phoneValue = phoneField.value.trim();
        const phoneRegex = /^\d{3}-\d{3}-\d{4}$/;

        if (!phoneRegex.test(phoneValue)) {
            alert("Please enter a valid phone number in the format 123-456-7890.");
            return;
        }

        const fd = new FormData(report_form);
        const obj = Object.fromEntries(fd);
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
        validationMsg.textContent = ""; // Clear validation message

        alert("Report saved successfully!");
    });
}

// Geocoding function using Nominatim
// Returns lat and lon as an object
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
    } catch (error) {
        console.error('Error during geocoding:', error);
    }
    return null;
}
