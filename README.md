# emergency-map

View the project [here](https://matteobombelli.github.io/emergency-map/index.html "View emergency-map on Github Pages")
Password: admin

# Overview
### Users can add reports with the following details:
- First Name  
- Last Name  
- Telephone Number*  
- Emergency Type  
- Address**  
- Latitude/Longitude  
- Picture URL  
- Comment  

(*) Restricted to 123-456-7890 format  
(**) Address is geocoded and checked for validity, then autofills Longitude/Latitude  

### Map
- Default position is centered on Vancouver, BC as this was the intended location for use  
- Displays all reports as pins  
- Pins are selectable  
- Only loads pins that are visible on the map  

### Report List
- Only displays reports visible on the map  
- Sortable forwards & backwards by any of the headers  
- Details of each report can be viewed by clicking on the listed report  
- Reports can be removed by pressing the "X" on the listed report and entering a password***

(***) Passwords are stored in an MD5 hash, as to not be visible in plaintext

### Report Details
- Shows details of a report submission as well as a report "Status"  
- Details can be edited by pressing the "Edit" Button at the bottom of the popup and entering a password***  

(***) Passwords are stored in an MD5 hash, as to not be visible in plaintext