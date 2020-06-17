// This function uses the autocomplete selection, and checks to confirm
// what suburb the lat, lng is in.
async function findSuburb(osmId, index) {
  let x = osmId[index]
  getPolygon(x)
}


// This function is to add the suburb polygon to the map
async function getPolygon(osmId) {
  let url = `https://nominatim.openstreetmap.org/reverse?format=geojson&osm_id=${osmId}&osm_type=R&polygon_geojson=1`;
  let res = await fetch(url)
  let data = await res.json()
  L.geoJSON(data).addTo(map)
}
