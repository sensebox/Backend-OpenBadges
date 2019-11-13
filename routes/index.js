var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Open Badges' });
});

/* GET Start page. */
router.get('/Start', function(req, res, next) {
  res.render('startseite');
});
module.exports = router;
