const path = require('path');
const fs = require('fs');

module.exports = function(app) {
  // Serve /spot.css and /spot2.svg from public folder during development
  app.get('/spot.css', (req, res) => {
    res.sendFile(path.join(__dirname, '../public/spot.css'));
  });
  app.get('/spot2.svg', (req, res) => {
    res.sendFile(path.join(__dirname, '../public/spot2.svg'));
  });
};
