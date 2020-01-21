// https://openrouteservice.org/dev/#/api-docs/geocode
function adressSearch(){
  // get possible adresses
  var adress = $('#inputPlace').val();
  if(adress){
    $.ajax({
      // https://derickrethans.nl/leaflet-and-nominatim.html
      url: 'https://nominatim.openstreetmap.org/search?format=json&limit=3&q='+adress,
      type: 'GET'
    })
    .done (function(response) {
      console.log(response);
      // parse + use data here
      $('#adressResult').empty();
      $('#inputCoordinates').val("");
      var items = [];
      $.each(response, function(key, val) {
        items.push(
          '<button type="button" class="list-group-item rounded-0" onclick="chooseAddress(' +
          val.lat + ", " + val.lon + ", " + "'"+val.display_name+"'" +')">' + val.display_name +
          '</button>'
        );
      });

      if (items.length !== 0) {
        $('<div/>', {
          class: 'list-group',
          html: items.join(''),
          // style: 'top: 52px; position: absolute; z-index: 1001; margin-right: 15px;'
        }).appendTo('#adressResult');
      } else {
        $('<p>', { html: "No results found" }).appendTo('#adressResult');
        $('#inputCoordinates').val("");
      }
    })
    .fail (function(xhr, status, errorThrown ) {
      console.log(errorThrown);
      $('#inputCoordinates').val("");
    });
  }
  else{
    $('#inputCoordinates').val("");
  }
}


function chooseAddress (lat, lon, name) {
  $('#adressResult').empty();
  $('#inputPlace').val(name);
  $('#inputCoordinates').val(JSON.stringify([lon, lat]));
}
