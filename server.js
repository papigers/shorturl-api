var express = require('express');
var path = require('path');
var validUrl = require('valid-url');
var dboper = require('./dboper');

var MongoClient = require('mongodb').MongoClient;
var ObjectId = require('mongodb').ObjectID;
var mongourl = process.env.MONGODB_URI || 'mongodb://localhost:27017/shorturl';

var app = express();

app.set('mongourl', mongourl);
app.use(express.static(path.join(__dirname, 'public')));

app.get(/^\/add\/(.+)/, function(req, res){
  var url = req.params[0];
  var dbErr = { "error" : "Database operation failed"};
  if(validUrl.isWebUri(url)){
    MongoClient.connect(mongourl, function(err, db){
      if(err)
        res.json(dbErr);
      else{
        console.log('connected to db');
        var collection = db.collection('mappings');
        dboper.findOne(collection, {url: url}, function(err, data){
          if(err){
            db.close();
            res.json(dbErr);
          }
          else{
            if(data){
              db.close();
              res.json({
                'original': url,
                'short': req.protocol + "://" + req.get('host') + '/' + data._id
              });
            }
            else{
              dboper.insert(collection, url, function(err, data){
                if(err){
                  console.log('failed to insert');
                  db.close();
                  res.json(dbErr);
                }
                else{
                  console.log('inserted successfuly');
                  db.close();
                  res.json({
                    'original': url,
                    'short': req.protocol + "://" + req.get('host') + '/' + data.insertedId
                  });
                }
              });
            }
          }
        });
      }
    });
  }
  else{
    res.json({
      "error": "Invalid URL"
    });
  }
});

app.get('/:id', function(req, res){
  var id = req.params.id;
  var dbErr = { "error" : "Database operation failed"};
  
  MongoClient.connect(mongourl, function(err, db){
    if(err)
      res.json(dbErr);
    else{
      var collection = db.collection('mappings');
      dboper.findOne(collection, {"_id": +id}, function(err, data){
        db.close();
        if(err){
          res.json(dbErr);
        }
        else{
          if(data){
            res.redirect(data.url);
          }
          else{
            res.json({ "error": "No such short url" });
          }
        }
      });
      
    }
  });
});

app.set('port', process.env.PORT || 3000);
app.listen(app.get('port'), function(){
  console.log("Server listening on port: ", app.get('port'));
});