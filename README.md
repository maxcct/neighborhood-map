# Neighborhood Map

If all files are present and correct, running the app should require nothing
more than opening **index.html** in a browser.

The data models used are stored in **collection.js**. The ModelView is
contained in**app.js** and the view is comprised by the bindings in 
**index.html**, as per the way Knockout works. Also included in **app.js**
is code for autocomplete functionality, which uses *jQuery UI*.

The app draws on information from Wikipedia via AJAX requests to its API.
A link to the relevant page is included underneath. Please note that it was
necessary to use jQuery to control the div in question (`#info`), because
it appeared to be impossible to get the info from an AJAX request without
first adding it to the DOM. As such, it was necessary to use jQuery for all
updates of that field: the state of any KO observable relating to the div's
content would otherwise end up conflicting with text supplied by API requests.

If a location is selected from the list, an API request is sent, the map 
recenters itself on the corresponding marker, and that marker bounces. If a
marker is selected, an API request is sent and an info window displaying that
location's name appears above the marker.

Words entered into the 'TYPE TO FILTER' field are checked against a list of
keywords associated with each location, and those that have no matching terms
have their list items and markers hidden. Autocomplete is present.

The 'CLEAR' button closes all info windows, sets all location `visible`
properties to `true`, clears Wikipedia info section and resets filter field.
