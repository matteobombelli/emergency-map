function init(){
    let MyForm = document.createElement("form");
    MyForm.innerHTML = `
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
    <label for="longitute">Longitute (optional): </label>
    <input type="number" id="longitute" name="longitute"><br><br>
    <label for="latitude">Latitude (optional): </label>
    <input type="number" id="latitude" name="latitude"><br><br>
    <label for="empic">Picture of Emergency: </label>
    <input type="url" id="empic" name="empic"><br><br>
    <label for="comment">Comment: </label>
    <input type="text" id="comment" name="comment"><br><br>
    </fieldset>
                        `
    document.body.appendChild(MyForm);
    

}