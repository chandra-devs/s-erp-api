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

router.route('/exams/:section_id/:exam_sch_id')
    .post(function(req, res, next) {
        var status = 1;
        var section_id = req.params.section_id;
        var exam_sch_id = req.params.exam_sch_id;
        subjects = [];
        var item = {
            exam_paper_id: 'getauto',
            section_id: section_id,
            exam_sch_id: exam_sch_id,
            exam_paper_title: req.body.exam_paper_title,
            date: req.body.date,
            start_time: req.body.start_time,
            end_time: req.body.end_time,
            max_marks: req.body.max_marks,
            status: status,
        };
        mongo.connect(url, function(err, db) {
            autoIncrement.getNextSequence(db, 'exams', function(err, autoIndex) {
                var collection = db.collection('exams');
                collection.ensureIndex({
                    "exam_paper_id": 1,
                }, {
                    unique: true
                }, function(err, result) {
                    if (item.subject_id == null || item.exam_sch_id == null || item.exam_paper_title == null || item.date == null) {
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
                                    exam_paper_id: exam_sch_id+'-'+subject_id+'-EXM-'+autoIndex
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
      var exam_sch_id = req.params.exam_sch_id;
        var resultArray = [];
        mongo.connect(url, function(err, db) {
            assert.equal(null, err);
            var cursor = db.collection('exams').find({subject_id, exam_sch_id});
            cursor.forEach(function(doc, err) {
                assert.equal(null, err);
                resultArray.push(doc);
            }, function() {
                db.close();
                res.send({
                    [exam_sch_id+'-'+subject_id]: resultArray
                });
            });
        });
    });

    router.route('/get_exam/:exam_paper_id')
    .get(function(req, res, next) {
      var exam_paper_id = req.params.exam_paper_id;
        var resultArray = [];
        mongo.connect(url, function(err, db) {
            assert.equal(null, err);
            var cursor = db.collection('exams').find({exam_paper_id});
            cursor.forEach(function(doc, err) {
                assert.equal(null, err);
                resultArray.push(doc);
            }, function() {
                db.close();
                res.send({
                    exam: resultArray
                });
            });
        });
    });

    router.route('/exam_edit/:exam_paper_id')
        .post(function(req, res, next){
          var exam_paper_id = req.params.exam_paper_id;
          var name = req.body.name;
          var value = req.body.value;
          if (name == 'status') {
            var value = parseInt(req.body.value);
          }

          mongo.connect(url, function(err, db){
                db.collection('exams').update({exam_paper_id},{$set:{[name]: value}}, function(err, result){
                  assert.equal(null, err);
                   db.close();
                   res.send('true');
                });
          });
        });


    router.route('/exam_eval/:exam_paper_id/:student_id')
        .post(function(req, res, next) {
            var status = 1;
            var exam_paper_id = req.params.exam_paper_id;
            var student_id = req.params.student_id;
            var date = new Date();
            console.log(date);
            subjects = [];
            var item = {
                paper_result_id: 'getauto',
                exam_paper_id: exam_paper_id,
                student_id: student_id,
                marks: req.body.marks,
                percentage: req.body.percentage,
                conduct: req.body.conduct,
                comment: req.body.comment,
                date: date,
                status: status,
            };
            mongo.connect(url, function(err, db) {
                autoIncrement.getNextSequence(db, 'exam_evaluation', function(err, autoIndex) {
                  var count = db.collection('exam_evaluation').find({ $and: [{exam_paper_id, student_id}]}).count(function (e, count){
                    if (count > 0) {
                      db.close();
                      res.end('already submitted');
                    }
                  });
                    var collection = db.collection('exam_evaluation');
                    collection.ensureIndex({
                        "paper_result_id": 1,
                    }, {
                        unique: true
                    }, function(err, result) {
                        if (item.exam_paper_id == null || item.student_id == null || item.marks == null || item.comment == null) {
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
                                        paper_result_id: exam_paper_id+'-'+student_id+'-EVAL-'+autoIndex
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
          var exam_paper_id = req.params.exam_paper_id;
          var student_id = req.params.student_id;
            var resultArray = [];
            mongo.connect(url, function(err, db) {
                assert.equal(null, err);
                var cursor = db.collection('exam_evaluation').find({exam_paper_id, student_id});
                cursor.forEach(function(doc, err) {
                    assert.equal(null, err);
                    resultArray.push(doc);
                }, function() {
                    db.close();
                    res.send({
                        [exam_paper_id+'-'+student_id]: resultArray
                    });
                });
            });
        });

      // router.route('/chk_exam_eval/:exam_paper_id/:student_id')
      // .get(function(req, res, next) {
      //   var exam_paper_id = req.params.exam_paper_id;
      //   var student_id = req.params.student_id;
      //     var resultArray = [];
      //     mongo.connect(url, function(err, db) {
      //         assert.equal(null, err);
      //         var count = db.collection('exam_evaluation').find({exam_paper_id, student_id}).count();
      //         cursor.forEach(function(doc, err) {
      //             assert.equal(null, err);
      //             resultArray.push(doc);
      //         }, function() {
      //             db.close();
      //             res.send({
      //                 count: resultArray
      //             });
      //         });
      //     });
      // });





module.exports = router;
