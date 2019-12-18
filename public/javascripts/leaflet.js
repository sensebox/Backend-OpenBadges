var mymap = L.map('map').setView([51.9606649, 7.6261347], 11);

L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
  maxZoom: 18,
  attribution: "Map data &copy; <a href=\"https://www.openstreetmap.org/\">OpenStreetMap</a> contributors",
  id: "osm"
}).addTo(mymap);


var popup = L.popup()
    .setLatLng([51.9606649, 7.6261347], 11)
    .setContent("I am the center.")
    .openOn(mymap);
