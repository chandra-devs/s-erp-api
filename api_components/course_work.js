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

router.route('/course_works/:subject_id')
    .post(function(req, res, next) {
      var subject_id = req.params.subject_id;
        var status = 1;
        subjects = [];
        var item = {
            lesson_id: 'getauto',
            subject_id: subject_id,
            title: req.body.title,
            code: req.body.code,
            no_of_topics: req.body.no_of_topics,
            description: req.body.description,
            status: status,
        };
        mongo.connect(url, function(err, db) {
            autoIncrement.getNextSequence(db, 'courseworks', function(err, autoIndex) {
                var collection = db.collection('courseworks');
                collection.ensureIndex({
                    "lesson_id": 1,
                }, {
                    unique: true
                }, function(err, result) {
                    if (item.subject_id == null || item.title == null || item.no_of_topics == null) {
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
                                    lesson_id: subject_id+'-LES-'+autoIndex
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
      var subject_id = req.params.subject_id;
        var resultArray = [];
        mongo.connect(url, function(err, db) {
            assert.equal(null, err);
            var cursor = db.collection('courseworks').find({subject_id});
            cursor.forEach(function(doc, err) {
                assert.equal(null, err);
                resultArray.push(doc);
            }, function() {
                db.close();
                res.send({
                    [subject_id]: resultArray
                });
            });
        });
    });



    router.route('/topics/:lesson_id')
        .post(function(req, res, next) {
          var lesson_id = req.params.lesson_id;
            var status = 1;
            subjects = [];
            var item = {
                topic_id: 'getauto',
                lesson_id: lesson_id,
                title: req.body.title,
                description: req.body.description,
                status: status,
            };
            mongo.connect(url, function(err, db) {
                autoIncrement.getNextSequence(db, 'topics', function(err, autoIndex) {
                    var collection = db.collection('topics');
                    collection.ensureIndex({
                        "topic_id": 1,
                    }, {
                        unique: true
                    }, function(err, result) {
                        if (item.lesson_id == null || item.title == null) {
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
                                        topic_id: lesson_id+'-TOPIC'+autoIndex
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
          var lesson_id = req.params.lesson_id;
            var resultArray = [];
            mongo.connect(url, function(err, db) {
                assert.equal(null, err);
                var cursor = db.collection('topics').find({lesson_id});
                cursor.forEach(function(doc, err) {
                    assert.equal(null, err);
                    resultArray.push(doc);
                }, function() {
                    db.close();
                    res.send({
                        [lesson_id]: resultArray
                    });
                });
            });
        });


        router.route('/topic_notes/:topic_id')
            .post(function(req, res, next) {
              var topic_id = req.params.topic_id;
                var status = 1;
                subjects = [];
                var item = {
                    notes_id: 'getauto',
                    topic_id: topic_id,
                    file_name: req.body.file_name,
                    link_path: req.body.link_path,
                    description: req.body.description,
                    status: status,
                };
                mongo.connect(url, function(err, db) {
                    autoIncrement.getNextSequence(db, 'topic_notes', function(err, autoIndex) {
                        var collection = db.collection('topic_notes');
                        collection.ensureIndex({
                            "notes_id": 1,
                        }, {
                            unique: true
                        }, function(err, result) {
                            if (item.file_name == null || item.link_path == null) {
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
                                            notes_id: topic_id+'-NOTES'+autoIndex
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
              var topic_id = req.params.topic_id;
                var resultArray = [];
                mongo.connect(url, function(err, db) {
                    assert.equal(null, err);
                    var cursor = db.collection('topic_notes').find({topic_id});
                    cursor.forEach(function(doc, err) {
                        assert.equal(null, err);
                        resultArray.push(doc);
                    }, function() {
                        db.close();
                        res.send({
                            [topic_id]: resultArray
                        });
                    });
                });
            });


    //
    // router.route('/exam_edit/:exam_id')
    //     .post(function(req, res, next){
    //       var exam_id = req.params.exam_id;
    //       var name = req.body.name;
    //       var value = req.body.value;
    //       mongo.connect(url, function(err, db){
    //             db.collection('schools').update({exam_id},{$set:{[name]: value}}, function(err, result){
    //               assert.equal(null, err);
    //                db.close();
    //                res.send('true');
    //             });
    //       });
    //     });


module.exports = router;
