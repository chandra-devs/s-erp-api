// flow
var express = require("express");
var config = require("../config.json");
var bodyParser  =  require("body-parser");
var api_key = "api-key-KJFSI4924R23RFSDFSDNF94";
var mongo = require('mongodb').MongoClient;
var assert = require('assert');
var port = process.env.PORT || 8022;
var router = express.Router();
var url = 'mongodb://'+config.dbhost+':27017/transport_main';

var cookieParser = require('cookie-parser');
router.use(function(req, res, next) {
    // do logging
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    next(); // make sure we go to the next routes and don't stop here
});

// Add Freight Forwarder

  router.route('/freight_forwarders')

    .post(function(req, res, next){

        var ff_id = req.body.ff_id;
        var ff_name = req.body.ff_name;
        var ff_username = req.body.ff_username;
        var ff_password = req.body.ff_password;
        var agent_id = req.body.agent_id;
        var status = 1;

        var item = {
          ff_id: ff_id,
          ff_name: ff_name,
          ff_username: ff_username,
          ff_password: ff_password,
          agent_id: agent_id,
          status: status
        };

        mongo.connect(url, function(err, db){
          db.collection('freight_forwarders').ensureIndex( { ff_id: 1, ff_username: 1 }, {unique:true}, function(err, result){
            if (item.ff_id == null || item.ff_name == null || item.ff_username == null || item.ff_password == null || item.agent_id == null) {
              res.end('null');
            }else{
              db.collection('freight_forwarders').insertOne(item, function(err, result){
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
        var cursor = db.collection('freight_forwarders').find();
        cursor.forEach(function(doc, err){
          assert.equal(null, err);
          resultArray.push(doc);
        }, function(){
          db.close();
          res.send({freight_forwarders: resultArray });
        });
      });
    });

// Add Ports to FF
    router.route('/add_ports_to_ff')

    .post(function(req, res, next){
        ff_ports = [];
        var ff_username = req.body.ff_username;
        var port_id = req.body.port_id;

        var ff_ports = {
          port_id: port_id
        };

      mongo.connect(url, function(err, db){
        assert.equal(null, err);
            db.collection('freight_forwarders').update({"ff_username":ff_username},{$push:{ff_ports:port_id}}, function(err, result){
              assert.equal(null, err);
               db.close();
               res.send('true');
             });
      });

    });


// Get FF ports
  router.route('/get_ff_ports/:ff_username')
  .get(function(req, res, next){
    var url = 'mongodb://localhost:27017/transport_main';
    var ff_username = req.params.ff_username;
    var resultArray = [];
    mongo.connect(url, function(err, db){
      assert.equal(null, err);
      var cursor = db.collection('freight_forwarders').find({'ff_username':ff_username},{'ff_ports':1,'_id':0});
      cursor.forEach(function(doc, err){
        resultArray.push(doc);
      }, function(){
        db.close();
        res.send(resultArray[0]);
      });
    });
  });


// Add Bids

router.route('/bids')

  .post(function(req, res, next){

      var order_no = req.body.order_no;
      var ff_username = req.body.ff_username;

      var item = {
        order_no: order_no,
        ff_username: ff_username
      };

      mongo.connect(url, function(err, db){
        var cursor = db.collection('bids').find({ $and:[ { ff_username: ff_username }, { order_no: order_no } ] }).count(function (e, count) {
      console.log(count);
      if (count == 0) {
        db.collection('bids').insertOne(item, function(err, result){
          if (err) {
            if (err.code == 11000) {
              res.end('false');
            }
          }
          var item_id = item._id;
           db.close();
           res.send(item_id);
         });
      }else{
        db.close();
        res.send("you can't bid again on this or");
      }
    });

      });
  })

  .get(function(req, res, next){
    var url = 'mongodb://localhost:27017/transport_main';
    var resultArray = [];
    mongo.connect(url, function(err, db){
      assert.equal(null, err);
      var cursor = db.collection('bids').find();
      cursor.forEach(function(doc, err){
        assert.equal(null, err);
        resultArray.push(doc);
      }, function(){
        db.close();
        res.send({bids: resultArray });
      });
    });
  });

// Add Containers to my Bids
router.route('/add_containers_to_bid')

.post(function(req, res, next){
    containers_list = [];
    var bid_id = req.body.bid_id;
    var container_name = req.body.container_name;
    var price = req.body.price;

  var containers = {
    container_name: container_name,
    price: price
  };

  mongo.connect(url, function(err, db){
    assert.equal(null, err);
        db.collection('bids').update({"_id":objectId(bid_id)},{$push:{containers:containers}}, function(err, result){
          assert.equal(null, err);
           db.close();
           res.send('true');
         });
  });

});

// Get Bids by FF User
    router.route('/get_bids_by_ff/:ff_username')
    .get(function(req, res, next){
      var url = 'mongodb://localhost:27017/transport_main';
      var ff_username = req.params.ff_username;
      var resultArray = [];
      mongo.connect(url, function(err, db){
        assert.equal(null, err);
        var cursor = db.collection('bids').find({'ff_username':ff_username});
        cursor.forEach(function(doc, err){
          resultArray.push(doc);
        }, function(){
          db.close();
          res.send(resultArray);
        });
      });
    });

module.exports = router;
