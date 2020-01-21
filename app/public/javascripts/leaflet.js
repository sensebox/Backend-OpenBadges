var mymap = L.map('map').setView([51.9606649, 7.6261347], 11);

L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
  maxZoom: 18,
  attribution: "Map data &copy; <a href=\"https://www.openstreetmap.org/\">OpenStreetMap</a> contributors",
  id: "osm"
}).addTo(mymap);

var markers = L.featureGroup().addTo(mymap);

function addMarkers(locations){
  for(var i = 0; i < locations.length; i++){
    if(locations[i].coordinates){
      addMarker(locations[i].coordinates.coordinates[0],locations[i].coordinates.coordinates[1], locations[i].name);
    }
  }
}

function addMarker(lng, lat, title){
  var marker = L.marker([lat, lng]);
  marker.bindPopup(title).openPopup();
  markers.addLayer(marker);
  mymap.fitBounds(markers.getBounds());
}
