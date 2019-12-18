var express = require('express');
var router = express.Router();

// Beispiel wie serverseitige Daten an den Client übergeben werden
// dies erfolgt bei einem einzelnen Datensatz als einfaches JSON
router.get('/eindatensatz', function(req, res, next) {
  res.render('example1', {
    user: {
      firstname: 'Tom',
      lastname: 'Wer',
      email: 'Tom@wer.de',
      birthday: new Date().toLocaleDateString("fr-CA"),
      city: 'Münster',
      postalcode: 48159
    }
  });
});

// und bei einer Liste, also mehreren Datensätzen als ein Array von JSONs
router.get('/zweidatensaetze', function(req, res, next) {
  res.render('example2', {
    users: [
      {
        firstname: 'Tom',
        lastname: 'Wer',
        email: 'Tom@wer.de',
        birthday: new Date().toLocaleDateString("fr-CA"),
        city: 'Münster',
        postalcode: 48159
      },
      {
        firstname: 'Nick',
        lastname: 'Hier',
        email: 'Nick@hier.de',
        birthday: new Date().toLocaleDateString("fr-CA"),
        city: 'Paderborn',
        postalcode: 33098
      }
    ]
  });
});

module.exports = router;
