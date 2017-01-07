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

// Add Agent

router.route('/agents')

  .post(function(req, res, next){

      var agent_id = req.body.agent_id;
      var agent_name = req.body.agent_name;
      var agent_username = req.body.agent_username;
      var agent_password = req.body.agent_password;
      var status = 1;

      var item = {
        agent_id: agent_id,
        agent_name: agent_name,
        agent_username: agent_username,
        agent_password: agent_password,
        status: status
      };

      mongo.connect(url, function(err, db){
        db.collection('agents').ensureIndex( { agent_id: 1, agent_username: 1 }, {unique:true}, function(err, result){
          if (item.agent_id == null || item.agent_name == null || item.agent_username == null || item.agent_password == null) {
            res.end('null');
          }else{
            db.collection('agents').insertOne(item, function(err, result){
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
      var cursor = db.collection('agents').find();
      cursor.forEach(function(doc, err){
        assert.equal(null, err);
        resultArray.push(doc);
      }, function(){
        db.close();
        res.send({agents: resultArray });
      });
    });
  });


// Add Ports to Agent
    router.route('/add_ports_to_agent')

    .post(function(req, res, next){
        agent_ports = [];
        var agent_id = req.body.agent_id;
        var port_id = req.body.port_id;

        var agent_ports = {
          port_id: port_id
        };

      mongo.connect(url, function(err, db){
        assert.equal(null, err);
            db.collection('agents').update({"agent_id":agent_id},{$push:{agent_ports:port_id}}, function(err, result){
              assert.equal(null, err);
               db.close();
               res.send('true');
             });
      });

    });

// Get Agent ports
  router.route('/get_agent_ports/:agent_id/:api_key')
  .get(function(req, res, next){
    var api = req.params.api_key;
    if (api_key !== api){
      res.end('Not a valid Api Key');
    }else{
    var url = 'mongodb://localhost:27017/transport_main';
    var agent_id = req.params.agent_id;
    var resultArray = [];
    mongo.connect(url, function(err, db){
      assert.equal(null, err);
      var cursor = db.collection('agents').find({'agent_id':agent_id},{'agent_ports':1,'_id':0});
      cursor.forEach(function(doc, err){
        resultArray.push(doc);
      }, function(){
        db.close();
        res.send(resultArray[0]);
      });
    });
  }
  });

// Get Agent ff
  router.route('/get_agent_ff/:agent_id')
  .get(function(req, res, next){
    var url = 'mongodb://localhost:27017/transport_main';
    var agent_id = req.params.agent_id;
    var resultArray = [];
    mongo.connect(url, function(err, db){
      assert.equal(null, err);
      var cursor = db.collection('agents').find({'agent_id':agent_id},{'agent_ff':1,'_id':0});
      cursor.forEach(function(doc, err){
        resultArray.push(doc);
      }, function(){
        db.close();
        res.send(resultArray[0]);
      });
    });
  });

module.exports = router;
