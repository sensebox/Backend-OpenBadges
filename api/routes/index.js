/**
*   routes/index.js
*   @see https://medium.com/@sesitamakloe/how-we-structure-our-express-js-routes-58933d02e491
*/

module.exports = function(app){
  app.use('/api', require('./api'));
  app.use('/', require('./testAPI'));
};
