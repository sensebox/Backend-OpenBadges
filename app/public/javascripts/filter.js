$("#submit").click(function(e){
  e.preventDefault();
  filter();
});


function filter(){
  var coordinates = $('#inputCoordinates').val();
  var radius = $('#inputRadius').val();
  if(coordinates){
    if(!radius){
      alert('Für die Ortssuche bedarf es der Eingabe einer Addresse und des Radius.');
      return false;
    }
  }
  else {
    if(radius){
      alert('Für die Ortssuche bedarf es der Eingabe einer Addresse und des Radius.');
      return false;
    }
  }
  var name = $('#inputName').val();
  var topic = $('#inputTopic').val();
  var enddate = $('#inputDate2').val();
  var startdate = $('#inputDate').val();

  var body = {};
  if(name) body.name = name;
  if(topic) body.topic = topic;
  if(startdate) body.startdate = startdate;
  if(enddate) body.enddate = enddate;
  if(coordinates) body.coordinates = coordinates;
  if(radius) body.radius = radius;
  var querystring = $.param(body);
  window.location.href= window.location.pathname+'?'+querystring;
}
