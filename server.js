var express = require('express');
var path = require('path');

var app = express();

app.use(express.static(path.join(__dirname, 'public')));

app.set('port', process.env.PORT || 3000);
app.listen(app.get('port'), function(){
  console.log("Server listening on port: ", app.get('port'));
});