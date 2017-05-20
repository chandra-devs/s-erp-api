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

router.route('/book')
    .post(function(req, res, next) {
        var status = 1;
        books = [];
        var item = {
            book_id: 'getauto',
            book_title: req.body.book_title,
            author_name: req.body.author_name,
            book_price: req.body.book_price,
            qty: req.body.qty,
            rack_number: req.body.rack_number,
            inward_date: req.body.inward_date,
            book_description: req.body.book_description,
            subject: req.body.subject,

        };
        mongo.connect(url, function(err, db) {
            autoIncrement.getNextSequence(db, 'books', function(err, autoIndex) {
                var collection = db.collection('books');
                collection.ensureIndex({
                    "book_id": 1,
                }, {
                    unique: true
                }, function(err, result) {
                    if (item.book_title == null) {
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
                                    book_id: 'BOOK-'+autoIndex
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
            var cursor = db.collection('books').find();
            cursor.forEach(function(doc, err) {
                assert.equal(null, err);
                resultArray.push(doc);
            }, function() {
                db.close();
                res.send({
                    books: resultArray
                });
            });
        });
    });

    router.route('/book_edit/:book_id/:name/:value')
        .post(function(req, res, next){
          var subject_id = req.params.subject_id;
          var name = req.params.name;
          var value = req.params.value;
          mongo.connect(url, function(err, db){
                db.collection('books').update({book_id},{$set:{[name]: value}}, function(err, result){
                  assert.equal(null, err);
                   db.close();
                   res.send('true');
                });
          });
        });


module.exports = router;
