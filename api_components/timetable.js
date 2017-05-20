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

// Add Timetable

router.route('/class_timetable/:section_id')
    .post(function(req, res, next) {
        var status = 1;
        var section_id = req.params.section_id;
        var item = {
            timetable_id: 'getauto',
            section_id: section_id,
            day: req.body.day,
						start_time: req.body.start_time,
						end_time: req.body.end_time,
						room_no: req.body.room_no,
            status: status,
        }
        mongo.connect(url, function(err, db) {
            autoIncrement.getNextSequence(db, 'timetable', function(err, autoIndex) {
                var collection = db.collection('timetable');
                collection.ensureIndex({
                    "timetable_id": 1,
                }, {
                    unique: true
                }, function(err, result) {
                    if (item.section_id == null) {
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
                                    timetable_id: section_id+'-SEC-'+autoIndex
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
				var section_id = req.params.section_id;
        mongo.connect(url, function(err, db) {
            assert.equal(null, err);
            var cursor = db.collection('timetable').find({section_id});
            cursor.forEach(function(doc, err) {
                assert.equal(null, err);
                resultArray.push(doc);
            }, function() {
                db.close();
                res.send({
                    timetable: resultArray
                });
            });
        });
    });


module.exports = router;
