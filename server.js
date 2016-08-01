var express = require('express');
var bodyParser = require('body-parser');
var _ = require('underscore');
var app = express();
var PORT = process.env.PORT || 3000;
app.use(express.static(__dirname + '/public'));
app.listen(PORT, function () {
  console.log('Express listening on port ' + PORT + '!');
});

