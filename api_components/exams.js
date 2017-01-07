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

// Add Exams

router.route('/exams/:subject_id')
    .post(function(req, res, next) {
        var status = 1;
        var subject_id = req.params.subject_id;
        subjects = [];
        var item = {
            exam_id: 'getauto',
            subject_id: subject_id,
            exam_title: req.body.exam_title,
            exam_type: req.body.exam_type,
            date: req.body.date,
            time_from: req.body.time_from,
            time_to: req.body.time_to,
            status: status,
        };
        mongo.connect(url, function(err, db) {
            autoIncrement.getNextSequence(db, 'exams', function(err, autoIndex) {
                var collection = db.collection('exams');
                collection.ensureIndex({
                    "exam_id": 1,
                }, {
                    unique: true
                }, function(err, result) {
                    if (item.subject_id == null || item.exam_title == null || item.date == null) {
                        res.end('null');
                    } else {
                        collection.insertOne(item, function(err, result) {
                            if (err) {
                                if (err.code == 11000) {
                                    res.end('false');
                                }
                                res.end('false');
                            }
                            collection.update({
                                _id: item._id
                            }, {
                                $set: {
                                    exam_id: 'SCH-EXM-'+autoIndex
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
            var cursor = db.collection('exams').find();
            cursor.forEach(function(doc, err) {
                assert.equal(null, err);
                resultArray.push(doc);
            }, function() {
                db.close();
                res.send({
                    exams: resultArray
                });
            });
        });
    });

    router.route('/exam_edit/:exam_id')
        .post(function(req, res, next){
          var exam_id = req.params.exam_id;
          var name = req.body.name;
          var value = req.body.value;
          mongo.connect(url, function(err, db){
                db.collection('schools').update({exam_id},{$set:{[name]: value}}, function(err, result){
                  assert.equal(null, err);
                   db.close();
                   res.send('true');
                });
          });
        });


module.exports = router;
