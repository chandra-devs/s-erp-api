// flow
var express = require("express");
var config = require("../config.json");
var bodyParser  =  require("body-parser");
var api_key = "api-key-KJFSI4924R23RFSDFSDNF94";
var mongo = require('mongodb').MongoClient;
var assert = require('assert');
var port = process.env.PORT || 8080;
var router = express.Router();
var url = 'mongodb://'+config.dbhost+':27017/transport_main';

var cookieParser = require('cookie-parser');
router.use(function(req, res, next) {
    // do logging
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    next(); // make sure we go to the next routes and don't stop here
});


// Add Port

router.route('/ports')

  .post(function(req, res, next){

      var port_id = req.body.port_id;
      var port_name = req.body.port_name;
      var port_country = req.body.port_country;
      var status = 1;

      var item = {
        port_id: port_id,
        port_name: port_name,
        port_country: port_country,
        status: status
      };

      mongo.connect(url, function(err, db){
        db.collection('ports').ensureIndex( { port_id: 1 }, {unique:true}, function(err, result){
          if (item.port_id == null || item.port_name == null || item.port_country == null) {
            res.end('null');
          }else{
            db.collection('ports').insertOne(item, function(err, result){
              if (err) {
                if (err.code == 11000) {
                  res.end('false');
                }
              }
               db.close();
               res.send('true');
             });
          }

        });
      });
  })
  .get(function(req, res, next){
    var url = 'mongodb://localhost:27017/transport_main';
    var resultArray = [];
    mongo.connect(url, function(err, db){
      assert.equal(null, err);
      var cursor = db.collection('ports').find();
      cursor.forEach(function(doc, err){
        assert.equal(null, err);
        resultArray.push(doc);
      }, function(){
        db.close();
        res.send({ports: resultArray });
      });
    });
  });

// Add Port

router.route('/port/:port_name')

.get(function(req, res, next){
  var url = 'mongodb://localhost:27017/transport_main';
  var resultArray = [];
  mongo.connect(url, function(err, db){
    assert.equal(null, err);
    var cursor = db.collection('ports').find({'port_name':req.params.port_name},{'port_country':1,'_id':0});
    cursor.forEach(function(doc, err){
      assert.equal(null, err);
      resultArray.push(doc);
    }, function(){
      db.close();
      res.send({country: resultArray });
    });
  });
});




module.exports = router;
