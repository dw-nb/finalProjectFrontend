/*
Main: Setup all universal variables.
*/
document.getElementById("resultsAndFilter").style.display = "none";

// you need to add the Mapbox API key here once you pull it.
MAPBOX_API_KEY = 'pk.eyJ1IjoiZG91Z2xhc25vYmxlIiwiYSI6ImNrYWhpNnEwNzA1a2EyeG81a2ppdng1Y3AifQ.jnYMxyBfb7-VdAX1R6cP0Q' //check the .env file

// Default from location
let fromLatitude = '-33.8688';
let fromLongitude = '151.2093';
let fromPoint = [fromLatitude, fromLongitude];
let selectedFromPoint = []
// Default to location
let toLatitude = '-33.9644';
let toLongitude = '151.1373';
let toPoint = [toLatitude, toLongitude];
let selectedToPoint = []
//
let autocompleteResultsLatitude = []
let autocompleteResultsLongitude = []
// Id used to get the polygon data
let osmId = []

/*
Main: Get the users location by their IP, and filter based on that.
*/

// default ip address is au
let ipCountry = 'au'

// This uses an http call to update where the user is, giving them a more relevant map
// on page load.
// fromLatitude = geoplugin_longitude()
// fromLatitude = geoplugin_latitude()
// ipCountry = geoplugin_countryCode().toLowerCase()

/*
Main: Function to place the input location on a map
*/

// When the page loads, this initialises the map
let map = L.map('mapContainer').setView([fromLatitude, fromLongitude], 12);

// This creates a tile layer to add to our map
L.tileLayer('https://api.mapbox.com/styles/v1/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}', {
  attribution: 'Map data &copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors, <a href="https://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, Imagery © <a href="https://www.mapbox.com/">Mapbox</a>',
  id: 'mapbox/streets-v11',
  tileSize: 512,
  zoomOffset: -1,
  accessToken: MAPBOX_API_KEY
}).addTo(map)

/*
Main: Function to gather from and to location data from user
*/

// These if statements check if the user has input anything into the input box
if (document.getElementById('fromInput').onkeydown != "") {
  checkInput('fromInput', 300)
}
if (document.getElementById('toInput').onkeydown != "") {
  checkInput('toInput', 300)
}

// if there is something input, this gets that input, and sends it to the nominatim autocomplete function,
// to get the autocomplete results.
// That information is not passed to that function until the until the user has stopped typing though.
function checkInput(type, ms) {
  document.getElementById(type).addEventListener('keyup', (delay(function(e) {
    if (document.getElementById(type).value === "") {
      // Want to remove any autocomplete lists if the user has cleared the field
      if (document.getElementById('autocompleteList') != undefined && (document.getElementById(type).value == "" || document.getElementById(type).value == null)) {
        document.getElementById("autocompleteList").remove()
      }
      // Avoid logging anything when there is nothing in the input is empty
    } else {
      let input = document.getElementById(type).value
      let results = nomAutoComp(input, 5, type)
      console.log(input)
    }
  }, ms)));
}

// This function delays the call above until the number of ms indicated have passed,
// confirming the user has stopped typing.
function delay(funcName, ms) {
  let timer = 0
  return function(...args) {
    clearTimeout(timer)
    timer = setTimeout(funcName.bind(this, ...args), ms || 0)
  }
}

// This function calls nominatim to generate an list of places that match the user input.
async function nomAutoComp(searchQuery, limit, type) {
  let url = `https://nominatim.openstreetmap.org/search?q=${searchQuery}&limit=${limit}&format=geojson&addressdetails=1&countrycodes=${ipCountry}`
  let res = await fetch(url)
  let data = await res.json()
  let autocompleteResults = []
  autocompleteResultsLatitude.length = 0
  autocompleteResultsLongitude.length = 0
  osmId.length = 0

  fromPoint.length = 0
  toPoint.length = 0
  // this clears the autocomplete array to ensure it is only the most resent results being displayed
  autocompleteResults.length = 0

  for (i = 0; i < data.features.length; i++) {
    // get address name and add it to the autocompleteResults
    autocompleteResults.push(data.features[i].properties.display_name)
    autocompleteResultsLongitude.push(data.features[i].geometry.coordinates[0])
    autocompleteResultsLatitude.push(data.features[i].geometry.coordinates[1])
    osmId.push(data.features[i].properties.osm_id)
  }
  console.log(autocompleteResults);

  // This function takes the gerenated places, and creates an autocomplete list for the
  // user to select from
  autocomplete(type, autocompleteResults);
  return autocompleteResultsLatitude, autocompleteResultsLongitude;
}

// This function updates the from and to points based on which autocomplete result
// the user selects from the list.
function updateLocation(type, index) {
  if (type === "fromInput") {
    fromLatitude = autocompleteResultsLatitude[index]
    fromLongitude = autocompleteResultsLongitude[index]
    fromPoint = [fromLatitude, fromLongitude]
    selectedFromPoint = []
    selectedFromPoint = [fromLatitude, fromLongitude]
  }
  if (type === "toInput") {
    toLatitude = autocompleteResultsLatitude[index]
    toLongitude = autocompleteResultsLongitude[index];
    toPoint = [toLatitude, toLongitude]
    selectedToPoint = []
    selectedToPoint = [toLatitude, toLongitude]
  }
  //checkPolygon(fromPoint, toPoint, type)
  return selectedFromPoint, selectedToPoint
}

// Once the user clicks to visualise the route, this function display's the route on the map
// If no input has been used, it uses the default from-to points.
document.getElementById('map-button').addEventListener('click', function() {
  // TODO: clear existing information on the map. possibly with: clearLayers() | POSSIBLE LOCATION 1
  document.getElementById('mapContainer').style.cssText = 'margin-top: 0px; position: absolute; height: 50%; width: 100%; transition: 0.5s';
  document.getElementById("resultsAndFilter").style.display = "block";
  waiting()
  checkIfPrice(selectedFromPoint, selectedToPoint)
})

function waiting() {
  // this waits 0.5s while the container is resized
  setTimeout(function() {
    // This function check if the map container has changed size and then refreshes the map to ensure it fits.
    map.invalidateSize()
    mapRoute(fromLatitude, fromLongitude, toLatitude, toLongitude)
    updateMap(markerFromPoint, markerToPoint)
  }, 600);
}

// This function is being used to update the map with the route
function mapRoute(fromLatitude, fromLongitude, toLatitude, toLongitude) {
  if (fromPoint != "" || toPoint != "") {
    // TODO: clear existing information on the map. possibly with: clearLayers() | POSSIBLE LOCATION 2
  }
  // This adds the markers to the map
  markerFromPoint = L.marker([fromLatitude, fromLongitude]).addTo(map)
  markerToPoint = L.marker([toLatitude, toLongitude]).addTo(map)

  // This call adds the route to the map; by default it shows a
  // TODO: clean up this routing call so that there is no empty box when the route is initialised.
  L.Routing.control({
    waypoints: [
      L.latLng(fromLatitude, fromLongitude),
      L.latLng(toLatitude, toLongitude)
    ],
    router: L.Routing.mapbox(MAPBOX_API_KEY),
    show: false
  }).addTo(map);

  // Return the map and layer object
  return [L, map, markerFromPoint, markerToPoint]
}

function updateMap(markerFromPoint, markerToPoint) {
  let markers = [markerFromPoint, markerToPoint];
  // TODO: clear existing information on the map. possibly with: clearLayers() | POSSIBLE LOCATION 3

  // this group variable creates a box, so the map can be zoomed out to an appropriate
  // z-index level and the entire route be visible
  let group = L.featureGroup(markers).addTo(map);
  // this provides the user with map panning to get to their location, while it zooms
  // to the indicated level of padding
  map.flyToBounds(group.getBounds(), {
    // additional bottom padding is used because the input box sits ontop of the map
    padding: [0, 100]
  })
}

/*
Main: Functions to check if the from and to point are within the polygons of the mongodb objects
*/

// This function takes the from and to points, and calls the checkPolygon function
// receiving a boolean value when the points are evaluated against the polygons,
// if true for both from and to; the getPrice function is called which gets the price
async function checkIfPrice(fromPoint, toPoint) {
  console.log(`fromPoint: ${fromPoint}, toPoint: ${toPoint}`);
  // This calls the checkPolygon function to check the fromPoint is in the fromPolygon's
  // found in all the mongodb objects
  let from = await checkPolygon(fromPoint, "fromInput")
  // This calls the checkPolygon function to check the toPoint is in the toPolygon's
  // found in all the mongodb objects
  let to = await checkPolygon(toPoint, "toInput")
  if (from == true && to == true) {
    console.log("we have a price for that");
  }
  if (from == true && to == false) {
    document.getElementById("thePrice").innerHTML = "we dont have pricing for that drop off location";
  }
  if (from == false && to == true) {
    document.getElementById("thePrice").innerHTML = "we dont have pricing for that pick up location";
  }
}

// This is to initialise an array of objects that have successfully passed the "checking from polygon"
let possiblePolygons = []
// Once this array is full, it is used by the "toPolygon" checker.
// If the toPolygon is successful, it is used to grab the price.

// This function checks the point provided against the polygon against the mongodb objects
async function checkPolygon(point, type) {
  // we call the getPrice function on the server.
  const url = '/getPriceInfo'
  const data = await fetch(url);
  const priceData = await data.json();
  // we then query mongodb and get back all the priceInfo objects
  // and iterate over all the mongodb objects
  for (let i = 0; i < priceData.length; i++) {
    console.log(priceData.length);
    let isIn = false;
    if (type == "fromInput") {
      console.log("checking fromPolygon");
      // This calls the inside function, confirming if the point is inside the polygon
      if (await inside(point, Object.values(priceData[i].fromPolygon[0])) == true) {
        console.log("Point is inside fromPolygon");
        // This pushes all the objects that contain the fromPoint in the fromPolygon
        possiblePolygons.push(priceData[i])
        isIn = true;
      } else {
        console.log("Point is NOT inside fromPolygon");
        isIn;
      }
    }
  }
  for (let i = 0; i < possiblePolygons.length; i++) {
    let isIn = false;
    if (type == "toInput") {
      console.log("checking toPolygon");
      // This calls the inside function, confirming if the point is inside the to polygon
      if (await inside(point, Object.values(possiblePolygons[i].toPolygon[0])) == true) {
        console.log("Point is inside toPolygon");
        isIn = true;
        getPrice(i)
      } else {
        console.log("Point is NOT inside toPolygon");
        isIn;
      }
    }
  }
}

// This function checks if a point is inside an array - returning a boolean
function inside(point, array) {
  // ray-casting algorithm based on
  // http://www.ecse.rpi.edu/Homepages/wrf/Research/Short_Notes/pnpoly.html
  // These are flipped because the array is returned as long lat
  let x = point[1];
  let y = point[0];
  console.log("got to the inside function");
  let inside = false;
  for (let i = 0, j = array.length - 1; i < array.length; j = i++) {
    let xi = array[i][0];
    let yi = array[i][1];
    let xj = array[j][0];
    let yj = array[j][1];
    let intersect = ((yi > y) != (yj > y)) && (x < (xj - xi) * (y - yi) / (yj - yi) + xi);
    console.log(`intersect: ${intersect}`);
    if (intersect) inside = !inside;
  }
  return inside;
};

// This function gets the price if both the from and to are within their respective polygons.
async function getPrice(i) {
  let price = possiblePolygons[i].price
  document.getElementById("thePrice").innerHTML = `Your trip will cost: $${price}`
  console.log(price)
}
