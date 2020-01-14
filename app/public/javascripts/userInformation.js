function resetUserInfo(user){
  document.getElementById('inputEmail4').value = user.email;
  document.getElementById('inputNachnahme').value = user.lastname;
  document.getElementById('inputCity').value = user.city;
  document.getElementById('inputZip').value = user.postalcode;
}

$("#Send").click(function(e){
  e.preventDefault();
  // console.log($("#changeInformation").serialize());
  if(isValid()){
    $("#changeInformation").submit();
  }
});


function isValid() {
    var correct = true;
    if (document.getElementById("inputNachnahme").value == "") {
        correct = false;
        document.getElementById('nachnahme').innerText = 'Nachnahme Eingeben';
    } else {
        document.getElementById('nachnahme').innerText = "";
    }
    if (document.getElementById("inputCity").value == "") {
        correct = false;
        document.getElementById('city').innerText = 'City Eingeben';
    } else {
        document.getElementById('city').innerText = "";
    }
    if (document.getElementById("inputEmail4").value == "") {
        correct = false;
        document.getElementById('email').innerText = 'Email Eingeben';
    } else {
        document.getElementById('email').innerText = "";
    }
    if (document.getElementById("inputZip").value == "") {
        correct = false;
        document.getElementById('plz').innerText = 'Postleitzahl Eingeben';
    } else {
        document.getElementById('plz').innerText = "";
    }

    return correct;
}
