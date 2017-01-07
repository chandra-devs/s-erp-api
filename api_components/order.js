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


router.route('/new_order')

  .post(function(req, res, next){

      var order_no = req.body.order_no;
      var origin_port = req.body.origin_port;
      var destination_port = req.body.destination_port;
      var expected_date = req.body.expected_date;
      var status = 0;

      var item = {
        order_no: order_no,
        origin_port: origin_port,
        destination_port: destination_port,
        expected_date: expected_date,
        status: status
      };

      mongo.connect(url, function(err, db){
        db.collection('orders').ensureIndex( { order_no: 1 }, {unique:true}, function(err, result){
          if (item.order_no == null || item.origin_port == null || item.destination_port == null || item.expected_date == null) {
            res.end('null');
          }else{
            db.collection('orders').insertOne(item, function(err, result){
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
  });

router.route('/add_products')

.post(function(req, res, next){
    products_list = [];
    var order_no = req.body.order_no;
    var box_no = req.body.box_no;
    var product_name = req.body.product_name;
    var product_type = req.body.product_type;
    var qty = req.body.qty;
    var weight = req.body.weight;
    var total_cubic_feet = req.body.total_cubic_feet;

  var products_list = {
    box_no: box_no,
    product_name: product_name,
    product_type: product_type,
    qty: qty,
    weight: weight,
    total_cubic_feet:total_cubic_feet
  };

  mongo.connect(url, function(err, db){
    assert.equal(null, err);
        db.collection('orders').update({"order_no":order_no},{$push:{products_list:products_list}}, function(err, result){
          assert.equal(null, err);
           db.close();
           res.send('true');
         });
  });

});

router.route('/add_containers')

.post(function(req, res, next){
    containers_list = [];
    var order_no = req.body.order_no;
    var container_name = req.body.container_name;
    var container_type = req.body.container_type;
    var container_qty = req.body.container_qty;

  var containers_list = {
    container_name: container_name,
    container_type: container_type,
    container_qty: container_qty
  };

  mongo.connect(url, function(err, db){
    assert.equal(null, err);
        db.collection('orders').update({"order_no":order_no},{$push:{containers_list:containers_list}}, function(err, result){
          assert.equal(null, err);
           db.close();
           res.send('true');
         });
  });

});

router.route('/add_documents')

.post(function(req, res, next){
    req_documents_list = [];
    var order_no = req.body.order_no;
    var document_name = req.body.document_name;

  var req_documents_list = {
    document_name: document_name
  };

  mongo.connect(url, function(err, db){
    assert.equal(null, err);
        db.collection('orders').update({"order_no":order_no},{$push:{req_documents_list:req_documents_list}}, function(err, result){
          assert.equal(null, err);
           db.close();
           res.send('true');
         });
  });

});

router.route('/orders')

  .get(function(req, res, next){

    var resultArray = [];
    mongo.connect(url, function(err, db){
      assert.equal(null, err);
      var cursor = db.collection('orders').find();
      cursor.forEach(function(doc, err){
        assert.equal(null, err);
        resultArray.push(doc);
      }, function(){
        db.close();
        res.send({items: resultArray });
      });
    });
  });


router.route('/orders/:order_no')
  .get(function(req, res, next){

    var order_no = req.params.order_no;
    var resultArray = [];
    mongo.connect(url, function(err, db){
      assert.equal(null, err);
      var cursor = db.collection('orders').find({"order_no": order_no}).limit(1);
      cursor.forEach(function(doc, err){
        assert.equal(null, err);
        resultArray.push(doc);
      }, function(){
        db.close();
        if (resultArray.length === 0) {
          res.end('No Order Found');
        }else{
          res.send({items: resultArray });
        }
      });
      });
  });


router.route('/orders_with_status/:sts')
  .get(function(req, res, next){

    var sval = parseInt(req.params.sts);
    var resultArray = [];
    mongo.connect(url, function(err, db){
      assert.equal(null, err);
      var cursor = db.collection('orders').find({"status":sval});
      cursor.forEach(function(doc, err){
        assert.equal(null, err);
        resultArray.push(doc);
      }, function(){
          db.close();
        if (resultArray.length === 0) {
          res.send('No Orders Found');
        }else{
          res.send({items: resultArray });
        }
      });
    });
  });



//Products_Total_Cubic_Feet
router.route('/products_tcf/:order_no')

.get(function(req, res, next){

  var resultArray = [];
  mongo.connect(url, function(err, db){
    assert.equal(null, err);
    var cursor = db.collection('orders').aggregate([
      {$match:{'order_no':req.params.order_no}},
      {$unwind:"$products_list"},
      {$group: {
        _id: 1,
        "total_cubic_feet": {$sum: '$products_list.total_cubic_feet'}
        }
      }
    ]);
    cursor.forEach(function(doc, err){
      assert.equal(null, err);
      resultArray.push(doc);
    }, function(){
      db.close();
      res.send({count: resultArray[0].total_cubic_feet });
    });
  });
});

//Products_count
router.route('/products_count/:order_no')

.get(function(req, res, next){

  var resultArray = [];
  mongo.connect(url, function(err, db){
    assert.equal(null, err);
    var cursor = db.collection('orders').aggregate([
      {$match:{'order_no':req.params.order_no}},
{$unwind:"$products_list"},
{$group: {
        _id: 1,
        "total_products": {$sum: '$products_list.qty'}
    }
}
    ]);
    cursor.forEach(function(doc, err){
      assert.equal(null, err);
      resultArray.push(doc);
    }, function(){
      db.close();
      res.send({count: resultArray[0].total_products });
    });
  });
});

//Containers_count
router.route('/containers_count/:order_no')

.get(function(req, res, next){

  var resultArray = [];
  mongo.connect(url, function(err, db){
    assert.equal(null, err);
    var cursor = db.collection('orders').aggregate([
      {$match:{'order_no':req.params.order_no}},
      {$unwind:"$containers_list"},
      {$group: {
        _id: 1,
        "total_containers": {$sum: '$containers_list.container_qty'}
        }
      }
    ]);
    cursor.forEach(function(doc, err){
      assert.equal(null, err);
      resultArray.push(doc);
    }, function(){
      db.close();
      res.send({count: resultArray[0].total_containers });
    });
  });
});

// Get Containers form Order
router.route('/getContainers/:order_no')
  .get(function(req, res, next){

    var order_no = req.params.order_no;
    var resultArray = [];
    mongo.connect(url, function(err, db){
      assert.equal(null, err);
      var cursor = db.collection('orders').find({"order_no": order_no},{"containers_list":1,"_id":0}).limit(1);
      cursor.forEach(function(doc, err){
        assert.equal(null, err);
        resultArray.push(doc);
      }, function(){
        db.close();
        if (resultArray.length === 0) {
          res.end('No Order Found');
        }else{
          res.send({items: resultArray });
        }
      });
      });
  });

// Get Containers form Order
router.route('/getProducts/:order_no')
  .get(function(req, res, next){

    var order_no = req.params.order_no;
    var resultArray = [];
    mongo.connect(url, function(err, db){
      assert.equal(null, err);
      var cursor = db.collection('orders').find({"order_no": order_no},{"products_list":1,"_id":0}).limit(1);
      cursor.forEach(function(doc, err){
        assert.equal(null, err);
        resultArray.push(doc);
      }, function(){
        db.close();
        if (resultArray.length === 0) {
          res.end('No Order Found');
        }else{
          res.send({items: resultArray });
        }
      });
      });
  });


// Get Orders by Agent
  router.route('/get_agent_orders/:agent_id/:sval')

  .get(function(req, res, next){


    var sval = parseInt(req.params.sval);
    var agent_id = req.params.agent_id;
    var resultArray = [];
    var resultArray_final = [];
    var dataArray = [];
    var finalArray = [];
    mongo.connect(url, function(err, db){
      assert.equal(null, err);
      var cursor = db.collection('agents').aggregate([{$match: {'agent_id':agent_id}},{ $unwind : "$agent_ports" },
        {$lookup:{
          from: 'ports',
          localField: 'agent_ports',
          foreignField: 'port_id',
          as:'ag_ports'
        }},{ $project : { ag_ports: 1, _id:0} }
      ]);
      cursor.forEach(function(doc, err){
        resultArray.push(doc);
      }, function(){

        for(var k in resultArray) {
            for(var o in resultArray[k]) {
                dataArray.push(resultArray[k][o][0]);
            }
        }
        for(var l in dataArray){
          finalArray.push(dataArray[l].port_name);
        }

        var curso = db.collection('orders').find({"status":sval,'origin_port':{$in:finalArray}});
        curso.forEach(function(doc, err){
          resultArray_final.push(doc);
        }, function(){
          db.close();
          res.send({items:resultArray_final});
        });
      });

    });

  });

// Get Orders by FF
router.route('/get_ff_orders/:ff_username/:sval')

.get(function(req, res, next){


  var ff_username = req.params.ff_username;
  var sval = parseInt(req.params.sval);
  var resultArray = [];
  var resultArray_final = [];
  var dataArray = [];
  var finalArray = [];
  mongo.connect(url, function(err, db){
    assert.equal(null, err);
    var cursor = db.collection('freight_forwarders').aggregate([{$match: {'ff_username':ff_username}},{ $unwind : "$ff_ports" },
      {$lookup:{
        from: 'ports',
        localField: 'ff_ports',
        foreignField: 'port_id',
        as:'fg_ports'
      }},{ $project : { fg_ports: 1, _id:0} }
    ]);
    cursor.forEach(function(doc, err){
      resultArray.push(doc);
    }, function(){

      for(var k in resultArray) {
          for(var o in resultArray[k]) {
              dataArray.push(resultArray[k][o][0]);
          }
      }
      for(var l in dataArray){
        finalArray.push(dataArray[l].port_name);
      }

      var curso = db.collection('orders').find({"status":sval,'origin_port':{$in:finalArray}});
      curso.forEach(function(doc, err){
        resultArray_final.push(doc);
      }, function(){
        db.close();
        res.send({items:resultArray_final});
      });
    });

  });

});

// Get Bids by Order #NO
    router.route('/get_bids_by_order/:order_no')
    .get(function(req, res, next){

      var order_no = req.params.order_no;
      var resultArray = [];
      mongo.connect(url, function(err, db){
        assert.equal(null, err);
        var cursor = db.collection('bids').find({'order_no':order_no},{'order_no':0});
        cursor.forEach(function(doc, err){
          resultArray.push(doc);
        }, function(){
          db.close();
          res.send(resultArray);
        });
      });
    });

module.exports = router;
