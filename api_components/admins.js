// flow
var express = require("express");
var config = require("../config.json");
var bodyParser = require("body-parser");
var api_key = "api-key-KJFSI4924R23RFSDFSDNF94";
var mongo = require('mongodb').MongoClient;
var assert = require('assert');
var port = process.env.PORT || 8022;
var router = express.Router();
var url = 'mongodb://' + config.dbhost + ':27017/transport_main';

var cookieParser = require('cookie-parser');
router.use(function(req, res, next) {
    // do logging
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    next(); // make sure we go to the next routes and don't stop here
});

// Add Admin

router.route('/admins/:api_key')

.post(function(req, res, next) {
        var api = req.params.api_key;
        if (api_key !== api) {
            res.end('Not a valid Api Key');
        } else {
            var admin_id = req.body.admin_id;
            var admin_name = req.body.admin_name;
            var admin_username = req.body.admin_username;
            var admin_password = req.body.admin_password;
            var status = 1;

            var item = {
                admin_id: admin_id,
                admin_name: admin_name,
                admin_username: admin_username,
                admin_password: admin_password,
                status: status
            };

            mongo.connect(url, function(err, db) {
                db.collection('admins').ensureIndex({
                    admin_id: 1,
                    admin_username: 1
                }, {
                    unique: true
                }, function(err, result) {
                    if (item.admin_id == null || item.admin_name == null || item.admin_username == null || item.admin_password == null) {
                        res.end('null');
                    } else {
                        db.collection('admins').insertOne(item, function(err, result) {
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
        }

    })
    .get(function(req, res, next) {
        var api = req.params.api_key;
        if (api_key !== api) {
            res.end('Not a valid Api Key');
        } else {
            var url = 'mongodb://localhost:27017/transport_main';
            var resultArray = [];
            mongo.connect(url, function(err, db) {
                assert.equal(null, err);
                var cursor = db.collection('admins').find();
                cursor.forEach(function(doc, err) {
                    assert.equal(null, err);
                    resultArray.push(doc);
                }, function() {
                    db.close();
                    res.send({
                        admins: resultArray
                    });
                });
            });
        }

    });

// Add sub_admin

router.route('/sub_admins/:api_key')

.post(function(req, res, next) {
        var api = req.params.api_key;
        if (api_key !== api) {
            res.end('Not a valid Api Key');
        } else {
            var sub_admin_id = req.body.sub_admin_id;
            var sub_admin_name = req.body.sub_admin_name;
            var sub_admin_username = req.body.sub_admin_username;
            var sub_admin_password = req.body.sub_admin_password;
            var status = 1;

            var item = {
                sub_admin_id: sub_admin_id,
                sub_admin_name: sub_admin_name,
                sub_admin_username: sub_admin_username,
                sub_admin_password: sub_admin_password,
                status: status
            };

            mongo.connect(url, function(err, db) {
                db.collection('sub_admins').ensureIndex({
                    sub_admin_id: 1,
                    sub_admin_username: 1
                }, {
                    unique: true
                }, function(err, result) {
                    if (item.sub_admin_id == null || item.sub_admin_name == null || item.sub_admin_username == null || item.sub_admin_password == null) {
                        res.end('null');
                    } else {
                        db.collection('sub_admins').insertOne(item, function(err, result) {
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
        }

    })
    .get(function(req, res, next) {
        var api = req.params.api_key;
        if (api_key !== api) {
            res.end('Not a valid Api Key');
        } else {
            var url = 'mongodb://localhost:27017/transport_main';
            var resultArray = [];
            mongo.connect(url, function(err, db) {
                assert.equal(null, err);
                var cursor = db.collection('sub_admins').find();
                cursor.forEach(function(doc, err) {
                    assert.equal(null, err);
                    resultArray.push(doc);
                }, function() {
                    db.close();
                    res.send({
                        sub_admins: resultArray
                    });
                });
            });
        }

    });


module.exports = router;
