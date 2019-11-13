function submit(){
// $('#login').submit(function(e){
//   e.preventDefault();

  var form = $('#login');

  $.ajax({
   type: "POST",
   url: '/user/login',
   data: form.serialize()
  })
  .done(function(data) {
    console.log('Token', data.token);
    window.localStorage.token = data.token;
    console.log('Storage', window.localStorage);
    console.log('Authorisierung erfolgreich!');
    logSecret();
  })
  .fail(function(err){
    console.log('Authorisierung fehlgeschlagen');
  });
}


function logSecret(){
  $.ajax({
   type: "GET",
   url: '/secret',
   beforeSend: function (xhr){
     xhr.setRequestHeader('Authorization', "Bearer " + window.localStorage.token);
   }
  })
  .done(function(response) {
    console.log(response);
    if(response === 'secret accessed successfully!'){
      logOut();
    }
  });
}

function logOut(){
  $.ajax({
   type: "GET",
   url: '/user/logout',
   beforeSend: function (xhr){
     xhr.setRequestHeader('Authorization', "Bearer " + window.localStorage.token);
   }
  })
  .done(function(response) {
    console.log(response.message);
    console.log('Expires in: '+response.invalidToken.date.toLocaleString('de-De'));
  })
  .fail(function(err){
    console.log(err.responseText);
  });
}
