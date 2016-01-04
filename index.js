var express = require('express');
var bodyParser = require('body-parser');
var path = require('path');

//connect to the mongo
//var db = require('mongoskin').db("mongodb://localhost/testdb", {
//	w: 0
//});
var mongo = require('mongoskin');
var db = mongo.db("mongodb://localhost/testdb", {
    native_parser: true
});
db.bind('events');
db.bind('persons');
db.bind('documents');

//create the app instance
var app = express();
//serve static files
app.use(express.static(path.join(__dirname, 'public')));
//parse POST data
app.use(bodyParser.urlencoded({
    extended: true,
    type: '*/x-www-form-urlencoded'
}));


//response for saving operations
function after_update(err, res, events) {
    if (err) {
        res.status(500);
        res.send({
            error: err.toString()
        });
    } else {
        res.send(events || {});
    }
}

//list fields of collection
//function map_reduce(coll) {
//    return db.runCommand({
//        mapreduce: coll,
//        map: function() {
//            for (var key in this) {
//                emit(key, null);
//            }
//        },
//        reduce: function(key, stuff) {
//            return null;
//        },
//        out: coll + "_keys"
//    });
//}

var eventItem = db.events.findOne();
for (var key in eventItem) {
    console.log(key);
}
//console.log(db.events.findOne());


//:entity loading
app.get('/:entity', function(req, res) {
    var coll = req.param("entity");
    db[coll].find().toArray(function(err, data) {
        for (var i = 0; i < data.length; i++) {
            //map _id to id
            data[i].id = data[i]._id;
            delete data[i]._id;
        }
        res.send(data);
    });
});

//adding
app.post('/:entity', function(req, res) {
    db[req.param("entity")].insert(req.body, function(err, events) {
        //console.log(err);
        if (err) return res.send({
            status: err
        });
        res.send({
            newid: req.body._id
        });
    });
});

//updating
app.put('/:entity/:id', function(req, res) {
    db[req.param("entity")].updateById(req.param("id"), req.body, function(err) {
        if (err) return res.send({
            status: err
        });
        res.send({});
    });
});

//deleting
app.delete('/:entity/:id', function(req, res) {
    db[req.param("entity")].removeById(req.param("id"), req.body, function(err) {
        if (err) return res.send({
            status: err
        });
        res.send({});
    });
});


app.listen(3000);
