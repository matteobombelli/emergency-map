class emergency_report{
    constructor() {
        const time = new Date()
        this.date_time = time.toUTCString();
        this.staus = "OPEN";
    }
}


function initializeReport() {
    // Add top nav bar
    const topnav = document.createElement("div");
    topnav.className = "topnav";
    topnav.innerHTML = `
        <a  href="index.html">Home</a>
        <a class = "active" href="report.html">Create Report</a>
        `
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
        <input type="text" id="addr" name="addr" required><br><br>
        <label for="latitude">Latitude (optional): </label>
        <input type="number" step="0.000001" id="latitude" name="latitude"><br><br>
        <label for="longitude">Longitude (optional): </label>
        <input type="number" step="0.000001" id="longitude" name="longitude"><br><br>
        <label for="empic">Picture of Emergency: </label>
        <input type="url" id="empic" name="empic"><br><br>
        <label for="comment">Comment: </label>
        <input type="text" id="comment" name="comment"><br><br>
        <button type="submit"> Submit </button>
        </fieldset>
        `;

    // Add form to document
    document.body.appendChild(report_form);

    // Listen for submit
    // New report is made and appended to array under key='reports'
    report_form.addEventListener('submit', (e) => {

        // Prevent the default form submission behavior
        e.preventDefault(); 
    
        // Create a new emergency report object
        const fd = new FormData(report_form);
        const obj = Object.fromEntries(fd);
        const new_rep = new emergency_report();
        Object.assign(new_rep, obj);

        // Retrieve array of reports, if non-existent initialize new array
        const storedData = localStorage.getItem('reports');
        let reports = storedData ? JSON.parse(storedData) : [];
        
        // Check for null
        if (reports == null) {
            reports = [];
        }
    
        // Append the object to the array
        reports.push(new_rep);

        // Save new array
        localStorage.setItem('reports', JSON.stringify(reports));
        
        // Clear the form
        report_form.reset();
    });
    
}