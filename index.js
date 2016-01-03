var express = require('express');
var path = require('path');

//connect to the mongo
var db = require('mongoskin').db("mongodb://localhost/testdb", { w: 0});
	db.bind('events');
	db.bind('persons');
	db.bind('documents');

//create the app instance
var app = express();
//serve static files
app.use(express.static(path.join(__dirname, 'public')));
//parse POST data
app.use(express.bodyParser());


//response for saving operations
function after_update(err, res, events){
    if (err){
    	res.status(500);
    	res.send({ error:err.toString() });
    } else {
    	res.send(events || {});
    }
}


//:entity loading
app.get('/:entity', function(req, res){
	console.log(req.param("entity"));
	entity = req.param("entity");
	db[req.param("entity")].find().toArray(function(err, data){
		for (var i = 0; i < data.length; i++){
			//map _id to id
			data[i].id = data[i]._id;
			delete data[i]._id;
		}
		res.send(data);
	});
});

//adding
app.post('/:entity', function(req, res){
	db.events.insert(req.body, function(err, events){
		if (err) return res.send({ status:"error" });
		res.send({ newid:req.body._id });
	});
});

//updating
app.put('/:entity/:id', function(req, res){
	db.events.updateById(req.param("id"), req.body, function(err){
		if (err) return res.send({ status:"error" });
		res.send({});
	});
});

//deleting
app.delete('/:entity/:id', function(req, res){
	db.events.removeById(req.param("id"), req.body, function(err){
		if (err) return res.send({ status:"error" });
		res.send({});
	});
});


app.listen(3000);
