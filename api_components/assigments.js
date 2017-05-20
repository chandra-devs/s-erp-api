// flow
var express = require("express");
var config = require("../config.json");
var bodyParser = require("body-parser");
var api_key = "api-key-KJFSI4924R23RFSDFSD7F94";
var mongo = require('mongodb').MongoClient;
var autoIncrement = require("mongodb-autoincrement");
var assert = require('assert');
var port = process.env.PORT || 4005;
var router = express.Router();
var url = 'mongodb://' + config.dbhost + ':27017/s_erp_data';

var cookieParser = require('cookie-parser');
router.use(function(req, res, next) {
    // do logging
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    next(); // make sure we go to the next routes and don't stop here
});

// Add Schools

router.route('/assignment/:section_id/:lesson_id')
    .post(function(req, res, next) {
        var status = 1;
        var section_id = req.params.section_id;
        var lesson_id = req.params.lesson_id;
        books = [];
        var item = {
            assignment_id: 'getauto',
            assignment_title: req.body.assignment_title,
            section_id: section_id,
            lesson_id: lesson_id,
            due_date: req.body.due_date,
            description: req.body.description,
        };
        mongo.connect(url, function(err, db) {
            autoIncrement.getNextSequence(db, 'assignments', function(err, autoIndex) {
                var collection = db.collection('assignments');
                collection.ensureIndex({
                    "assignment_id": 1,
                }, {
                    unique: true
                }, function(err, result) {
                    if (item.assignment_title == null) {
                        res.end('null');
                    } else {
                        collection.insertOne(item, function(err, result) {
                            if (err) {
                                if (err.code == 11000) {
                                    console.log(err);
                                    res.end('false');
                                }
                                res.end('false');
                            }
                            collection.update({
                                _id: item._id
                            }, {
                                $set: {
                                    assignment_id: 'ASMT-'+autoIndex
                                }
                            }, function(err, result) {
                                db.close();
                                res.end('true');
                            });
                        });
                    }
                });
            });
        });
    })
    .get(function(req, res, next) {
        var resultArray = [];
        mongo.connect(url, function(err, db) {
            assert.equal(null, err);
            var cursor = db.collection('assignments').find();
            cursor.forEach(function(doc, err) {
                assert.equal(null, err);
                resultArray.push(doc);
            }, function() {
                db.close();
                res.send({
                    assignments: resultArray
                });
            });
        });
    });

    router.route('/assignment_edit/:assignment_id/:name/:value')
        .post(function(req, res, next){
          var assignment_id = req.params.assignment_id;
          var name = req.params.name;
          var value = req.params.value;
          mongo.connect(url, function(err, db){
                db.collection('assignments').update({assignment_id},{$set:{[name]: value}}, function(err, result){
                  assert.equal(null, err);
                   db.close();
                   res.send('true');
                });
          });
        });


module.exports = router;
