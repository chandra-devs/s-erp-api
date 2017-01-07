// flow
var schools = require("./api_components/schools.js");
var exams = require("./api_components/exams.js");
var school_classes = require("./api_components/school_classes.js");
var students = require("./api_components/students.js");
var subjects = require("./api_components/subject.js");
var course_works = require("./api_components/course_work.js");
var attendance = require("./api_components/attendance.js");
var employee = require("./api_components/employee.js");
var staff_user = require("./api_components/staff_user.js");
var teachers = require("./api_components/teacher.js");

var config = require("./config.json");
var express = require("express");
var bodyParser = require("body-parser");
var app = express();
var server = require('http').createServer(app);
var api_key = "api-key-KJFSI4924R23RFSDFSD7F94";
var mongo = require('mongodb').MongoClient;
var objectId = require('mongodb').ObjectID;
var assert = require('assert');
var port = process.env.PORT || 4005;
var router = express.Router();
var fs = require("fs");
var url = 'mongodb://' + config.dbhost + ':27017/s_erp_data';
var cookieParser = require('cookie-parser');
app.use(cookieParser());

app.use(bodyParser.urlencoded({
    extended: false
}));

app.use(bodyParser.json());

router.use(function(req, res, next) {
    // do logging
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    next(); // make sure we go to the next routes and don't stop here
});

app.get('/', function (req, res) {
  res.send('Hello Node!');
});

router.route('/em')
    .get(function(req, res, next) {
        mongo.connect(url, function(err, db) {
            if (!err) {
                res.send("Hay! We have a connection WOW Great");
                return true;
            } else {
                res.send("This think you have done something wrong!!");
            }
        });

    });


app.listen(port, function(){
   console.log('Express server listening on port ' + port);
});

app.use('/api', schools);
app.use('/api', exams);
app.use('/api', school_classes);
app.use('/api', teachers);
app.use('/api', students);
app.use('/api', subjects);
app.use('/api', course_works);
app.use('/api', attendance);
app.use('/api', employee);
app.use('/api', staff_user);
app.use('/api', router);
