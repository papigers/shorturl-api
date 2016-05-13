exports.findOne = function(coll, find, cb){
  coll.findOne(find, cb);
};

function findUniqueId(coll, random, cb){
  coll.findOne({_id: random}, function(err,res){
    if(err){
      cb(err);      
    }
    else{
      if(res){
        var rnd = Math.floor(Math.random()*4000);
        findUniqueId(coll, rnd, cb);
      }
      else{
        cb(null, random);
      }
    }
  });
};

exports.insert = function(coll, url, cb){
  findUniqueId(coll, Math.floor(Math.random()*4000), function(err, id){
    if(err)
      cb(err);
    else
      coll.insertOne({url: url, _id: id}, cb);
  });
};

