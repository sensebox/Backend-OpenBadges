var mymap = L.map('map').setView([51.9606649, 7.6261347], 11);

L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
  maxZoom: 18,
  attribution: "Map data &copy; <a href=\"https://www.openstreetmap.org/\">OpenStreetMap</a> contributors",
  id: "osm"
}).addTo(mymap);


function addMarker(lng, lat, title){
  mymap.setView(new L.LatLng(lat, lng), 11);
  L.popup()
      .setLatLng([lat, lng])
      .setContent(title)
      .openOn(mymap);
}
